// ==================================================
// KAPAZZ BITCOIN - AMBIL BERITA BITCOIN (judul + tautan saja)
// Dijalankan harian oleh .github/workflows/bitcoin-news.yml
//
// - Sumber: media berbahasa Indonesia yang punya RSS publik.
// - Yang diambil HANYA: judul, link asli, nama sumber, tanggal terbit.
//   Isi artikel, ringkasan, dan gambar TIDAK disalin.
// - Hanya judul yang mengandung "bitcoin" atau "btc" (tidak peka huruf).
// - Kalau semua sumber gagal / hasil kosong, data/bitcoin-news.json
//   lama TIDAK ditimpa.
// - Tanpa dependensi (Node 20+, fetch bawaan).
// ==================================================
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_FILE = process.env.NEWS_OUT_FILE || path.join(ROOT, 'data', 'bitcoin-news.json');

const MAX_ITEMS = 10;
const TIMEOUT_MS = 15000;
const USER_AGENT = 'KapazzBitcoinNewsBot/1.0 (+https://kapazz09.github.io; hanya judul dan tautan)';

// "feed" = alamat RSS yang dicoba lebih dulu. Kalau gagal, skrip membaca halaman "site"
// dan mencari alamat RSS yang dideklarasikan situs itu sendiri (link rel="alternate").
// Cek laporan per sumber di log / ringkasan run Actions, lalu hapus sumber yang gagal terus.
const DEFAULT_SOURCES = [
    { name: 'Cointelegraph Indonesia', site: 'https://id.cointelegraph.com/', feed: 'https://id.cointelegraph.com/rss' },
    { name: 'CNBC Indonesia', site: 'https://www.cnbcindonesia.com/', feed: 'https://www.cnbcindonesia.com/market/rss' },
    { name: 'Detik Finance', site: 'https://finance.detik.com/', feed: 'https://rss.detik.com/index.php/finance' },
    { name: 'Kontan', site: 'https://www.kontan.co.id/', feed: 'https://www.kontan.co.id/rss' },
    { name: 'Bisnis.com', site: 'https://www.bisnis.com/', feed: 'https://www.bisnis.com/rss' },
    { name: 'Coinvestasi', site: 'https://coinvestasi.com/', feed: 'https://coinvestasi.com/feed' }
];
const SOURCES = process.env.NEWS_SOURCES_JSON ? JSON.parse(process.env.NEWS_SOURCES_JSON) : DEFAULT_SOURCES;

async function fetchText(url, maxBytes = 2_000_000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            signal: ctrl.signal,
            redirect: 'follow',
            headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8, */*;q=0.5' }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const text = await res.text();
        return text.length > maxBytes ? text.slice(0, maxBytes) : text;
    } finally {
        clearTimeout(timer);
    }
}

function decodeEntities(s) {
    return s
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&');
}
function safeChar(code) {
    try { return code > 0 && code < 0x110000 ? String.fromCodePoint(code) : ''; } catch (e) { return ''; }
}
function cleanText(raw) {
    if (!raw) return '';
    let s = String(raw).trim();
    const cdata = s.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
    if (cdata) s = cdata[1];
    else s = decodeEntities(s);
    s = s.replace(/<[^>]*>/g, ' ');
    s = decodeEntities(s);
    return s.replace(/\s+/g, ' ').trim();
}
function tagValue(block, tag) {
    const m = block.match(new RegExp('<' + tag + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + tag + '>', 'i'));
    return m ? m[1] : '';
}

function parseDate(raw) {
    if (!raw) return null;
    let s = cleanText(raw)
        .replace(/\bWIB\b/, '+0700').replace(/\bWITA\b/, '+0800').replace(/\bWIT\b/, '+0900');
    const t = Date.parse(s);
    return Number.isFinite(t) ? new Date(t) : null;
}

function safeUrl(raw, base) {
    try {
        const u = new URL(cleanText(raw), base);
        return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : '';
    } catch (e) { return ''; }
}

// Return [{title, url, published(Date)}] dari RSS 2.0 atau Atom
function parseFeed(xml, baseUrl) {
    const out = [];
    const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
    for (const block of items) {
        const title = cleanText(tagValue(block, 'title'));
        const url = safeUrl(tagValue(block, 'link') || tagValue(block, 'guid'), baseUrl);
        const published = parseDate(tagValue(block, 'pubDate') || tagValue(block, 'dc:date'));
        if (title && url && published) out.push({ title, url, published });
    }
    if (out.length === 0) {
        const entries = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
        for (const block of entries) {
            const title = cleanText(tagValue(block, 'title'));
            const hrefMatch = block.match(/<link[^>]*?href=["']([^"']+)["'][^>]*>/i);
            const url = safeUrl(hrefMatch ? hrefMatch[1] : '', baseUrl);
            const published = parseDate(tagValue(block, 'published') || tagValue(block, 'updated'));
            if (title && url && published) out.push({ title, url, published });
        }
    }
    return out;
}

function discoverFeedUrl(html, siteUrl) {
    const links = html.match(/<link\b[^>]*>/gi) || [];
    for (const tag of links) {
        if (!/type=["']application\/(rss|atom)\+xml["']/i.test(tag)) continue;
        if (!/rel=["']alternate["']/i.test(tag)) continue;
        const href = tag.match(/href=["']([^"']+)["']/i);
        const abs = href ? safeUrl(href[1], siteUrl) : '';
        if (abs) return abs;
    }
    return '';
}

async function loadSource(src) {
    const report = { name: src.name, feed: src.feed || '', status: '', total: 0, matched: 0 };
    let items = null;
    const tried = [];

    if (src.feed) {
        try {
            const xml = await fetchText(src.feed);
            const parsed = parseFeed(xml, src.feed);
            if (parsed.length === 0) throw new Error('feed terbaca tapi tidak ada item valid');
            items = parsed;
        } catch (e) { tried.push('feed: ' + e.message); }
    }
    if (!items && src.site) {
        try {
            const html = await fetchText(src.site, 400_000);
            const found = discoverFeedUrl(html, src.site);
            if (!found) throw new Error('situs tidak mendeklarasikan RSS');
            const xml = await fetchText(found);
            const parsed = parseFeed(xml, found);
            if (parsed.length === 0) throw new Error('feed hasil deteksi tidak ada item valid');
            items = parsed;
            report.feed = found + ' (terdeteksi otomatis)';
        } catch (e) { tried.push('deteksi: ' + e.message); }
    }
    if (!items) {
        report.status = 'GAGAL (' + tried.join('; ') + ')';
        return { report, items: [] };
    }
    report.total = items.length;
    const matched = items.filter(it => /bitcoin|btc/i.test(it.title)).map(it => ({ ...it, source: src.name }));
    report.matched = matched.length;
    report.status = 'OK';
    return { report, items: matched };
}

function normTitle(t) { return t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
function normUrl(u) {
    try { const x = new URL(u); x.hash = ''; x.search = ''; return (x.host + x.pathname).replace(/\/+$/, '').toLowerCase(); }
    catch (e) { return u; }
}

async function main() {
    const results = [];
    for (const src of SOURCES) {
        results.push(await loadSource(src));   // berurutan, sopan ke server sumber
    }

    const lines = ['### 📰 Berita Bitcoin: laporan sumber', '', '| Sumber | Status | Item di feed | Judul cocok |', '|---|---|---|---|'];
    for (const r of results) {
        console.log(`[${r.report.status.startsWith('OK') ? 'OK ' : 'ERR'}] ${r.report.name}: ${r.report.status} (feed=${r.report.feed || '-'}, item=${r.report.total}, cocok=${r.report.matched})`);
        lines.push(`| ${r.report.name} | ${r.report.status.replace(/\|/g, '/')} | ${r.report.total} | ${r.report.matched} |`);
    }

    const seenUrl = new Set(), seenTitle = new Set();
    const merged = results.flatMap(r => r.items)
        .sort((a, b) => b.published - a.published)
        .filter(it => {
            const u = normUrl(it.url), t = normTitle(it.title);
            if (seenUrl.has(u) || seenTitle.has(t)) return false;
            seenUrl.add(u); seenTitle.add(t);
            return true;
        })
        .slice(0, MAX_ITEMS)
        .map(it => ({ title: it.title, url: it.url, source: it.source, published: it.published.toISOString() }));

    let summary;
    if (merged.length === 0) {
        console.log('Hasil kosong (semua sumber gagal atau tidak ada judul bitcoin/btc). File lama TIDAK ditimpa.');
        summary = 'Hasil kosong: file `data/bitcoin-news.json` lama dibiarkan apa adanya.';
    } else {
        let oldItems = null;
        if (existsSync(OUT_FILE)) {
            try { oldItems = JSON.parse(readFileSync(OUT_FILE, 'utf8')).items; } catch (e) { oldItems = null; }
        }
        if (oldItems && JSON.stringify(oldItems) === JSON.stringify(merged)) {
            console.log('Daftar berita sama dengan sebelumnya, file tidak diubah.');
            summary = 'Daftar berita tidak berubah (tidak ada commit).';
        } else {
            writeFileSync(OUT_FILE, JSON.stringify({ updated: new Date().toISOString(), items: merged }, null, 2) + '\n', 'utf8');
            console.log(`Tersimpan ${merged.length} berita ke ${OUT_FILE}`);
            summary = `Tersimpan **${merged.length}** berita.`;
        }
    }
    lines.push('', summary);
    if (process.env.GITHUB_STEP_SUMMARY) {
        try { appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n'); } catch (e) { /* abaikan */ }
    }
}

main().catch(err => {
    // Gagal total tidak boleh merusak data lama; keluar dengan kode 0 supaya workflow tidak commit apa pun
    console.error('Kesalahan tak terduga:', err);
    process.exit(0);
});
