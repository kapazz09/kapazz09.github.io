#!/usr/bin/env node
/*==================================================
    KAPAZZ BITCOIN - UPDATE OTOMATIS btc-price-history.json
    Dijalankan oleh GitHub Actions
    (.github/workflows/update-btc-price.yml), tapi juga
    aman dijalankan manual lewat: node .github/scripts/update-btc-price.js

    FORMAT FILE (WAJIB TETAP SAMA -- dipakai DCA Calculator
    & Average Buy Calculator di js/tools/dca.js & average-buy.js):
        {
          "lastUpdated": "YYYY-MM-DD",
          "prices": { "YYYY-MM-DD": <angka>, ... }
        }

    SUMBER DATA: CoinGecko public API (gratis, tanpa API key),
    endpoint /coins/bitcoin/history?date=DD-MM-YYYY -- mengembalikan
    "snapshot" harga USD pada tanggal itu (market_data.current_price.usd).
    CATATAN: ini BEDA metodologi dari data lama yang berasal dari
    rata-rata Open+High+Low+Close hasil export CSV Investing.com.
    Wajar kalau nilainya sedikit berbeda dari data lama -- bukan bug.

    PRINSIP KEAMANAN DATA:
    - TIDAK PERNAH mengubah/menimpa data yang sudah ada, cuma menambah.
    - Kalau salah satu tanggal gagal diambil (setelah beberapa kali
      dicoba ulang), skrip BERHENTI di situ dan hanya menyimpan tanggal-
      tanggal SEBELUM kegagalan itu (kalau ada). Ini memastikan tidak
      pernah ada "bolong" tanggal di tengah data -- tanggal yang gagal
      otomatis dicoba lagi di run berikutnya (besok), karena skrip selalu
      mulai dari (lastUpdated + 1 hari).
    - Kalau tidak ada satu pun tanggal baru yang berhasil diambil, file
      SAMA SEKALI tidak disentuh (supaya git diff & commit tetap bersih).
==================================================*/

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'btc-price-history.json');
const COINGECKO_HISTORY_URL = 'https://api.coingecko.com/api/v3/coins/bitcoin/history';

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 10000;   // backoff dasar kalau kena rate limit (429)
const REQUEST_DELAY_MS = 6500;       // jeda antar-request normal (~9 req/menit, aman di bawah limit publik ~5-15/menit)

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toDateInputFormat(date) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return toDateInputFormat(d);
}

// CoinGecko minta format tanggal DD-MM-YYYY
function toCoinGeckoDateFormat(dateStr) {
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
}

async function fetchPriceForDate(dateStr, attempt = 1) {
    const cgDate = toCoinGeckoDateFormat(dateStr);
    const url = `${COINGECKO_HISTORY_URL}?date=${cgDate}&localization=false`;

    let res;
    try {
        res = await fetch(url, { headers: { Accept: 'application/json' } });
    } catch (networkErr) {
        return retryOrThrow(dateStr, attempt, `Gagal koneksi (${networkErr.message})`);
    }

    if (res.status === 429) {
        return retryOrThrow(dateStr, attempt, 'Kena rate limit (HTTP 429)', true);
    }
    if (!res.ok) {
        return retryOrThrow(dateStr, attempt, `HTTP ${res.status}`);
    }

    let json;
    try {
        json = await res.json();
    } catch (parseErr) {
        return retryOrThrow(dateStr, attempt, `Respons bukan JSON valid (${parseErr.message})`);
    }

    const price = json && json.market_data && json.market_data.current_price
        ? json.market_data.current_price.usd
        : undefined;

    if (typeof price !== 'number' || !isFinite(price)) {
        return retryOrThrow(dateStr, attempt, 'Field harga (market_data.current_price.usd) tidak ditemukan di respons');
    }

    return price;
}

async function retryOrThrow(dateStr, attempt, reason, isRateLimit = false) {
    if (attempt < MAX_RETRIES) {
        const delay = isRateLimit ? RETRY_BASE_DELAY_MS * attempt * 2 : RETRY_BASE_DELAY_MS * attempt;
        console.warn(`  [percobaan ${attempt}/${MAX_RETRIES}] ${dateStr}: ${reason} -- coba lagi dalam ${Math.round(delay / 1000)}s...`);
        await sleep(delay);
        return fetchPriceForDate(dateStr, attempt + 1);
    }
    throw new Error(reason);
}

async function main() {
    console.log('=== Update data/btc-price-history.json dari CoinGecko ===');

    if (!fs.existsSync(DATA_FILE)) {
        console.error(`File tidak ditemukan: ${DATA_FILE}`);
        process.exit(1);
    }

    let data;
    try {
        data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (err) {
        console.error(`File JSON tidak valid: ${err.message}`);
        process.exit(1);
    }

    if (!data.prices || typeof data.prices !== 'object' || Array.isArray(data.prices)) {
        console.error('Format file tidak sesuai: field "prices" (objek) tidak ditemukan.');
        process.exit(1);
    }

    const existingDates = Object.keys(data.prices).sort();
    if (existingDates.length === 0) {
        console.error('File "prices" kosong, tidak ada tanggal acuan untuk mulai. Berhenti (butuh minimal 1 data awal).');
        process.exit(1);
    }

    const lastDate = existingDates[existingDates.length - 1];
    const today = toDateInputFormat(new Date());
    console.log(`Tanggal terakhir tercatat : ${lastDate}`);
    console.log(`Tanggal hari ini (UTC)    : ${today}`);

    let cursor = addDays(lastDate, 1);

    if (cursor > today) {
        console.log('\nSudah up-to-date, tidak ada tanggal yang bolong. Selesai tanpa perubahan.');
        writeSummaryOutputs(0, null);
        return;
    }

    const missingDates = [];
    while (cursor <= today) {
        missingDates.push(cursor);
        cursor = addDays(cursor, 1);
    }
    console.log(`\nTanggal yang perlu diambil (${missingDates.length} hari): ${missingDates[0]} s/d ${missingDates[missingDates.length - 1]}`);

    const fetched = {};
    let successCount = 0;
    let stoppedEarly = false;

    for (let i = 0; i < missingDates.length; i++) {
        const dateStr = missingDates[i];
        try {
            process.stdout.write(`[${i + 1}/${missingDates.length}] ${dateStr} ... `);
            const price = await fetchPriceForDate(dateStr);
            fetched[dateStr] = price;
            successCount++;
            console.log(`$${price}`);
        } catch (err) {
            console.log(`GAGAL (${err.message})`);
            console.error(`\nBerhenti di tanggal ${dateStr} setelah ${MAX_RETRIES} percobaan.`);
            console.error('Data yang sudah berhasil diambil sebelumnya (jika ada) tetap akan disimpan.');
            console.error('Tanggal ini dan seterusnya akan otomatis dicoba lagi di run berikutnya.');
            stoppedEarly = true;
            break;
        }

        // Jeda antar-request, kecuali ini request terakhir
        if (i < missingDates.length - 1) {
            await sleep(REQUEST_DELAY_MS);
        }
    }

    if (successCount === 0) {
        console.log('\nTidak ada data baru yang berhasil diambil. File TIDAK diubah.');
        writeSummaryOutputs(0, null);
        process.exitCode = stoppedEarly ? 1 : 0;
        return;
    }

    // Gabungkan data baru ke data lama -- TIDAK menimpa/mengubah data lama sama sekali
    const mergedPrices = Object.assign({}, data.prices, fetched);
    const newLastUpdated = Object.keys(fetched).sort().pop();

    const updated = {
        lastUpdated: newLastUpdated,
        prices: mergedPrices
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(updated), 'utf8');

    console.log(`\nBerhasil menambahkan ${successCount} hari data baru (${missingDates[0]} s/d ${newLastUpdated}).`);
    console.log(`lastUpdated diperbarui menjadi: ${newLastUpdated}`);
    if (stoppedEarly) {
        console.log(`Catatan: masih ada ${missingDates.length - successCount} hari tersisa yang belum berhasil -- akan dicoba lagi di run berikutnya.`);
    }

    writeSummaryOutputs(successCount, newLastUpdated);
}

function writeSummaryOutputs(daysAdded, lastUpdated) {
    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `days_added=${daysAdded}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `last_updated=${lastUpdated || ''}\n`);
    }
}

main().catch(err => {
    console.error('\nError tak terduga:', err);
    process.exit(1);
});
