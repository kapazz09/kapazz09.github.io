/*==================================================
    BITCOIN TOOLKIT - CORE
    State bersama, init, helper umum (format angka,
    chart, confetti), live price, cache data historis,
    dan widget Fear & Greed / Mempool Status.
    WAJIB dimuat PALING AWAL dari semua file js/tools/*.
==================================================*/

const BitcoinTools = {
    btcPrice: 0,
    exchangeRate: 0,
    currency: "USD",
    autoRefresh: null,
    networkHashrateHs: 0,
    html5QrCode: null,
    isConverting: false,
    historicalCache: {},

    //------------------------------------------------
    // INIT
    //------------------------------------------------

    init() {
        this.bindEvents();
        this.loadPrice();
        this.renderQuiz();
        this.loadFearGreed();
        this.loadMempoolStatus();
        this.loadHalvingData();
        this.renderGlossary("");
        this.autoRefresh = setInterval(() => {
            this.loadPrice();
            this.loadFearGreed();
            this.loadMempoolStatus();
        }, 300000);
    },

    //------------------------------------------------
    // FORMAT ANGKA RIBUAN (untuk kolom USD & IDR)
    // Format tampilan: 2.000.000  |  Desimal pakai koma: 12.345,67
    //------------------------------------------------

    formatNumberInput(el) {
        const cursorPos = el.selectionStart;
        const oldValue = el.value;

        // Hitung posisi kursor berdasarkan jumlah karakter signifikan (angka & koma)
        let sigBefore = 0;
        for (let i = 0; i < cursorPos; i++) {
            if (/[0-9,]/.test(oldValue[i])) sigBefore++;
        }

        // Semua titik dianggap pemisah ribuan lama -> buang, lalu dibuat ulang.
        // Koma adalah satu-satunya pemisah desimal yang didukung.
        let raw = oldValue.replace(/\./g, '');
        const commaIdx = raw.indexOf(',');
        let intPart = commaIdx === -1 ? raw : raw.slice(0, commaIdx);
        let decPart = commaIdx === -1 ? null : raw.slice(commaIdx + 1).replace(/,/g, '');

        intPart = intPart.replace(/[^0-9]/g, '');
        if (decPart !== null) decPart = decPart.replace(/[^0-9]/g, '');

        intPart = intPart.replace(/^0+(?=\d)/, '');

        let formattedInt;
        if (intPart === '') {
            formattedInt = (decPart !== null) ? '0' : '';
        } else {
            formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }

        let formatted = formattedInt;
        if (decPart !== null) formatted += ',' + decPart;

        el.value = formatted;

        if (formatted === '') {
            el.setSelectionRange(0, 0);
            return;
        }

        let count = 0;
        let newPos = formatted.length;
        for (let i = 0; i < formatted.length; i++) {
            if (/[0-9,]/.test(formatted[i])) count++;
            if (count >= sigBefore) { newPos = i + 1; break; }
        }
        if (sigBefore === 0) newPos = 0;
        el.setSelectionRange(newPos, newPos);
    },

    // Ubah "2.000.000,5" jadi angka JS biasa 2000000.5
    parseFormattedNumber(str) {
        if (!str) return NaN;
        const cleaned = str.replace(/\./g, '').replace(',', '.');
        return parseFloat(cleaned);
    },

    //------------------------------------------------
    // CHART.JS (lazy-loaded — baru diambil pas modal DCA /
    // Average Buy dibuka & hasil siap ditampilkan, bukan di
    // awal halaman, biar loading utama tetap ringan).
    //------------------------------------------------
    _chartJsPromise: null,

    loadChartJs() {
        if (window.Chart) return Promise.resolve();
        if (this._chartJsPromise) return this._chartJsPromise;
        this._chartJsPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Gagal memuat Chart.js"));
            document.head.appendChild(script);
        });
        return this._chartJsPromise;
    },

    // Hancurkan chart lama sebelum bikin baru, biar tidak numpuk
    // ("canvas already in use") kalau simulasi diulang.
    _chartInstances: {},

    renderTrendChart(canvasId, points) {
        this.loadChartJs().then(() => {
            const canvas = document.getElementById(canvasId);
            if (!canvas || !points || points.length === 0) return;

            if (this._chartInstances[canvasId]) {
                this._chartInstances[canvasId].destroy();
            }

            const isMobile = window.innerWidth < 600;
            const labels = points.map(p => p.label);
            const values = points.map(p => p.value);

            this._chartInstances[canvasId] = new Chart(canvas.getContext("2d"), {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        borderColor: "#f7931a",
                        backgroundColor: "rgba(247, 147, 26, 0.12)",
                        borderWidth: isMobile ? 1.5 : 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 0,
                        pointHitRadius: 12,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: "#f7931a"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "nearest", intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: (ctx) => "$" + ctx.parsed.y.toLocaleString("en-US", { maximumFractionDigits: 0 })
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: !isMobile,
                            grid: { display: false }
                        },
                        y: {
                            display: !isMobile,
                            grid: { display: !isMobile, color: "rgba(0,0,0,0.05)" },
                            ticks: {
                                callback: (val) => "$" + Number(val).toLocaleString("en-US", { maximumFractionDigits: 0 })
                            }
                        }
                    }
                }
            });
        }).catch(err => console.warn("Chart gagal dimuat:", err));
    },

    //------------------------------------------------
    // CONFETTI (skor kuis tinggi)
    //------------------------------------------------
    fireConfetti() {
        const colors = ["#f7931a", "#ffb347", "#16a34a", "#2980ef", "#ffd166"];
        const count = 40;
        for (let i = 0; i < count; i++) {
            const piece = document.createElement("div");
            piece.className = "confetti-piece";
            piece.style.left = Math.random() * 100 + "vw";
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = (Math.random() * 0.4) + "s";
            piece.style.animationDuration = (1.8 + Math.random() * 1) + "s";
            document.body.appendChild(piece);
            setTimeout(() => piece.remove(), 3200);
        }
    },

    //------------------------------------------------
    // EVENTS
    //------------------------------------------------

    bindEvents() {
        if (this.bindDcaEvents) this.bindDcaEvents();
        if (this.bindConverterEvents) this.bindConverterEvents();
        if (this.bindChannelEvents) this.bindChannelEvents();
        if (this.bindMiningEvents) this.bindMiningEvents();
        if (this.bindUtxoEvents) this.bindUtxoEvents();
        if (this.bindAverageBuyEvents) this.bindAverageBuyEvents();
        if (this.bindWalletEvents) this.bindWalletEvents();
        if (this.bindGlossaryEvents) this.bindGlossaryEvents();
    },

    //------------------------------------------------
    // LOAD BTC PRICE (live, dipakai semua tool)
    //------------------------------------------------

    async loadPrice() {
        const display = document.getElementById("dcaLivePriceDisplay");
        if (display) display.classList.add("skeleton-block", "short");

        try {
            const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,idr");
            const data = await response.json();
            this.btcPrice = data.bitcoin.usd;
            this.exchangeRate = data.bitcoin.idr / data.bitcoin.usd;
            this.updatePriceDisplay();
        } catch (error) {
            console.error("Price Error :", error);
            this.showOfflinePrice();
        }
    },

    updatePriceDisplay() {
        const display = document.getElementById("dcaLivePriceDisplay");
        if (!display) return;
        const idrText = this.exchangeRate
            ? " / Rp" + Math.round(this.btcPrice * this.exchangeRate).toLocaleString("id-ID")
            : "";
        display.textContent = "$" + this.btcPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + idrText;
        display.classList.remove("skeleton-block", "short");
    },

    showOfflinePrice() {
        const display = document.getElementById("dcaLivePriceDisplay");
        if (display) {
            display.textContent = "Gagal memuat harga";
            display.classList.remove("skeleton-block", "short");
        }
    },

    //------------------------------------------------
    // DCA CALCULATOR (Simulasi Historis)
    //------------------------------------------------

    // Data harga historis BTC sekarang disimpan LOKAL di file
    // btc-price-history.json (2013 - sekarang, harga rata-rata harian dari
    // Open/High/Low/Close). Tidak ada panggilan API sama sekali untuk data
    // historis -> tidak ada lagi masalah CORS/rate-limit/proxy down.
    // File ini di-update manual sekitar 1x/bulan.
    async loadLocalPriceHistory() {
        if (this.priceHistoryCache) return this.priceHistoryCache;

        const res = await fetch("data/btc-price-history.json");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (!json.prices) throw new Error("Format btc-price-history.json tidak sesuai");

        this.priceHistoryCache = json.prices;
        this.priceHistoryLastUpdated = json.lastUpdated;
        return this.priceHistoryCache;
    },

    async fetchDailyHistoryRange(fromDate, toDate) {
        return await this.loadLocalPriceHistory();
    },

    // Cari harga di tanggal tsb; kalau kosong (misal gap data, atau tanggal
    // lebih baru dari data terakhir yang di-update), mundur maksimal 60 hari
    // untuk cari tanggal terdekat yang tersedia.
    lookupHistoricalPrice(map, dateStr) {
        if (map[dateStr] !== undefined) return map[dateStr];
        const d = new Date(dateStr + "T00:00:00Z");
        for (let i = 0; i < 60; i++) {
            d.setUTCDate(d.getUTCDate() - 1);
            const key = d.toISOString().slice(0, 10);
            if (map[key] !== undefined) return map[key];
        }
        return null;
    },

    toDateInputFormat(d) {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return y + "-" + m + "-" + day;
    },

    // Rata-rata harga harian dari [startDate, endDateExclusive) — dipakai
    // supaya pembelian Mingguan/Bulanan mencerminkan rata-rata harga
    // sepanjang periode itu, bukan cuma harga di 1 tanggal persis.
    averagePriceForPeriod(map, startDate, endDateExclusive) {
        let sum = 0;
        let count = 0;
        const d = new Date(startDate);
        while (d < endDateExclusive) {
            const key = this.toDateInputFormat(d);
            if (map[key] !== undefined) {
                sum += map[key];
                count++;
            }
            d.setUTCDate(d.getUTCDate() + 1);
        }
        if (count === 0) {
            return this.lookupHistoricalPrice(map, this.toDateInputFormat(startDate));
        }
        return sum / count;
    },

    //------------------------------------------------
    // FEAR & GREED INDEX
    //------------------------------------------------

    loadFearGreed() {
        fetch("https://api.alternative.me/fng/")
            .then(res => res.json())
            .then(data => {
                const entry = data.data[0];
                const value = parseInt(entry.value);
                const classification = entry.value_classification;

                const valueEl = document.getElementById("fngValue");
                if (valueEl) valueEl.textContent = value + " - " + classification;

                const pointer = document.getElementById("fngPointer");
                if (pointer) pointer.style.left = value + "%";
            })
            .catch(() => {
                const valueEl = document.getElementById("fngValue");
                if (valueEl) valueEl.textContent = "Gagal memuat data";
            });
    },

    //------------------------------------------------
    // MEMPOOL STATUS
    //------------------------------------------------

    loadMempoolStatus() {
        fetch("https://mempool.space/api/v1/fees/recommended")
            .then(res => res.json())
            .then(data => {
                const feeEl = document.getElementById("mempoolFee");
                const nextBlockEl = document.getElementById("mempoolNextBlock");
                if (feeEl) feeEl.textContent = data.halfHourFee + " sat/vB";
                if (nextBlockEl) nextBlockEl.textContent = data.fastestFee + " sat/vB";
            })
            .catch(() => {
                const feeEl = document.getElementById("mempoolFee");
                if (feeEl) feeEl.textContent = "Gagal memuat";
            });

        fetch("https://mempool.space/api/mempool")
            .then(res => res.json())
            .then(data => {
                const sizeEl = document.getElementById("mempoolSize");
                if (sizeEl) {
                    const mb = (data.vsize / 1000000).toFixed(2);
                    sizeEl.textContent = data.count.toLocaleString("en-US") + " tx (" + mb + " MB)";
                }
            })
            .catch(() => {
                const sizeEl = document.getElementById("mempoolSize");
                if (sizeEl) sizeEl.textContent = "Gagal memuat";
            });
    }
};
