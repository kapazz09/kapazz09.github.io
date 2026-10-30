/*==================================================
    BITCOIN TOOLKIT - HALVING COUNTDOWN
==================================================*/

Object.assign(BitcoinTools, {
    //------------------------------------------------
    // HALVING COUNTDOWN
    //------------------------------------------------

    loadHalvingData() {
        const container = document.getElementById("halvingContainer");
        if (container) {
            container.innerHTML =
                '<div class="skeleton-row">' +
                '<span class="skeleton-block"></span>' +
                '<span class="skeleton-block"></span>' +
                '<span class="skeleton-block"></span>' +
                '<span class="skeleton-block short"></span>' +
                '</div>';
        }
        this.fetchWithFallback(
            "https://mempool.space/api/blocks/tip/height",
            (data) => data,
            "https://blockchain.info/q/getblockcount?cors=true",
            (data) => data
        )
            .then(currentHeight => {
                const halvingInterval = 210000;
                const nextHalvingBlock = Math.ceil((currentHeight + 1) / halvingInterval) * halvingInterval;
                const blocksRemaining = nextHalvingBlock - currentHeight;
                const minutesRemaining = blocksRemaining * 10;
                const daysRemaining = (minutesRemaining / 60 / 24).toFixed(1);

                this.renderHalvingInsight(currentHeight);

                if (container) {
                    container.innerHTML =
                        '<div class="result-row"><span>Block Saat Ini</span><strong>' + currentHeight.toLocaleString("en-US") + '</strong></div>' +
                        '<div class="result-row"><span>Block Halving Berikutnya</span><strong>' + nextHalvingBlock.toLocaleString("en-US") + '</strong></div>' +
                        '<div class="result-row"><span>Sisa Block</span><strong>' + blocksRemaining.toLocaleString("en-US") + '</strong></div>' +
                        '<div class="result-row"><span>Estimasi Waktu Tersisa</span><strong>~' + daysRemaining + ' hari</strong></div>' +
                        '<p style="font-size:12px;color:#888;margin-top:10px;">*Estimasi berdasarkan rata-rata waktu blok 10 menit, bisa sedikit berbeda dari waktu aktual.</p>';
                }
            })
            .catch(() => {
                if (container) container.innerHTML = '<p style="color:#c2410c;">Gagal memuat data. Coba lagi nanti.</p>';
            });
    },

    // Box "Apa Artinya Ini?" -- reward dihitung dari tinggi blok (bukan angka
    // hardcode) supaya otomatis benar setelah halving berikutnya terjadi.
    renderHalvingInsight(currentHeight) {
        const box = document.getElementById("halvingInsight");
        if (!box) return;

        const halvingInterval = 210000;
        const epoch = Math.floor(currentHeight / halvingInterval);
        const currentReward = 50 / Math.pow(2, epoch);
        const nextReward = currentReward / 2;

        box.innerHTML =
            '<h4>\u{1F4A1} Apa Artinya Ini?</h4>' +
            '<p>Artinya: setiap ~4 tahun, jumlah Bitcoin baru yang dihasilkan tiap blok dipotong separuh ' +
            '(<strong>halving</strong>) \u2014 <strong>block reward</strong> saat ini ' +
            '<strong>' + currentReward + ' BTC</strong> per blok, akan turun jadi <strong>' + nextReward +
            ' BTC</strong> setelah halving berikutnya. Ini bagian dari desain suplai tetap Bitcoin ' +
            '(maksimal 21 juta koin), BUKAN jaminan harga akan naik \u2014 halving hanya memengaruhi laju ' +
            'penambahan suplai baru.</p>';
        box.style.display = "block";
    },

    //------------------------------------------------
    // PANEL "BITCOIN HARI INI" (di dalam modal Halving Countdown)
    // - Persen sudah ditambang: dihitung dari TINGGI BLOK (jadwal subsidi
    //   per halaving), bukan dari API lain -> perkiraan.
    // - Difficulty: mempool.space (hashrate/3d -> currentDifficulty;
    //   fallback blockchain.info). Perkiraan penyesuaian berikutnya:
    //   mempool.space /api/v1/difficulty-adjustment (difficultyChange %,
    //   estimatedRetargetDate ms).
    // - Berita: file lokal data/bitcoin-news.json (diisi GitHub Actions).
    // Data yang tidak tersedia ditulis "Data belum tersedia", tidak pernah
    // NaN / kosong. Semua teks berita dirender dengan textContent.
    //------------------------------------------------
    _bitcoinTodayLoadedAt: 0,

    // Total BTC dari jadwal subsidi untuk blok 0..height (dalam satoshi bulat)
    minedSupplyBtc(height) {
        if (!Number.isFinite(height) || height < 0) return null;
        const interval = 210000;
        let blocksLeft = Math.floor(height) + 1;
        let subsidy = 5000000000;   // 50 BTC dalam satoshi
        let sats = 0;
        while (blocksLeft > 0 && subsidy > 0) {
            const n = Math.min(blocksLeft, interval);
            sats += n * subsidy;
            blocksLeft -= n;
            subsidy = Math.floor(subsidy / 2);
        }
        return sats / 1e8;
    },

    _btodaySet(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    renderBitcoinToday(force) {
        if (!document.getElementById("btodayMinedValue")) return;
        const now = Date.now();
        if (!force && now - this._bitcoinTodayLoadedAt < 60000) return;   // jangan ambil ulang tiap buka modal
        this._bitcoinTodayLoadedAt = now;

        const NA = "Data belum tersedia";
        const isNum = (v) => typeof v === "number" && Number.isFinite(v);

        this._btodaySet("btodayMinedValue", "Memuat...");
        this._btodaySet("btodayDiffValue", "Memuat...");
        this._btodaySet("btodayDiffSub", "");

        // 1) Sudah ditambang (dari tinggi blok)
        this.fetchWithFallback(
            "https://mempool.space/api/blocks/tip/height",
            (data) => data,
            "https://blockchain.info/q/getblockcount?cors=true",
            (data) => data
        ).then(height => {
            const h = Number(height);
            const mined = this.minedSupplyBtc(h);
            if (!isNum(mined)) throw new Error("tinggi blok tidak valid");
            const pct = (mined / 21000000) * 100;
            this._btodaySet("btodayMinedValue", pct.toFixed(2).replace(".", ",") + "%");
            this._btodaySet("btodayMinedSub", "\u2248 " + Math.round(mined).toLocaleString("id-ID") + " dari 21.000.000 BTC");
        }).catch(() => {
            this._btodaySet("btodayMinedValue", NA);
            this._btodaySet("btodayMinedSub", "");
        });

        // 2) Difficulty saat ini
        this.fetchWithFallback(
            "https://mempool.space/api/v1/mining/hashrate/3d",
            (data) => data.currentDifficulty,
            "https://blockchain.info/q/getdifficulty?cors=true",
            (data) => data
        ).then(diff => {
            const d = Number(diff);
            if (!isNum(d) || d <= 0) throw new Error("difficulty tidak valid");
            this._btodaySet("btodayDiffValue", (d / 1e12).toFixed(2).replace(".", ",") + " T");
        }).catch(() => {
            this._btodaySet("btodayDiffValue", NA);
        });

        // 2b) Perkiraan penyesuaian berikutnya (hanya mempool.space, tanpa fallback)
        this.fetchWithTimeout("https://mempool.space/api/v1/difficulty-adjustment", 7000)
            .then(res => { if (!res.ok) throw new Error("not ok"); return res.json(); })
            .then(data => {
                const change = Number(data.difficultyChange);
                const when = Number(data.estimatedRetargetDate);
                if (!isNum(change) || !isNum(when) || when <= 0) throw new Error("data penyesuaian tidak valid");
                const sign = change >= 0 ? "+" : "\u2212";
                const pctText = sign + Math.abs(change).toFixed(2).replace(".", ",") + "%";
                const dateText = new Date(when).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
                this._btodaySet("btodayDiffSub", "Perkiraan penyesuaian: " + pctText + " (\u2248 " + dateText + ")");
            })
            .catch(() => {
                this._btodaySet("btodayDiffSub", "Perkiraan penyesuaian belum tersedia");
            });

        // 3) Berita dari file lokal
        this.renderBitcoinNews();
    },

    _newsRelativeDate(iso) {
        const t = Date.parse(iso);
        if (!Number.isFinite(t)) return "";
        const diffMin = Math.floor((Date.now() - t) / 60000);
        if (diffMin < 0) return "";
        if (diffMin < 60) return Math.max(diffMin, 1) + " menit lalu";
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return diffH + " jam lalu";
        const diffD = Math.floor(diffH / 24);
        if (diffD < 7) return diffD + " hari lalu";
        return new Date(t).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    },

    renderBitcoinNews() {
        const list = document.getElementById("btodayNewsList");
        if (!list) return;

        const showEmpty = () => {
            list.textContent = "";
            const p = document.createElement("p");
            p.className = "btoday-news-empty";
            p.textContent = "Berita belum tersedia saat ini.";
            list.appendChild(p);
        };

        fetch("data/bitcoin-news.json", { cache: "no-cache" })
            .then(res => { if (!res.ok) throw new Error("not ok"); return res.json(); })
            .then(data => {
                const items = (data && Array.isArray(data.items) ? data.items : [])
                    .filter(it => it && typeof it.title === "string" && it.title.trim() && typeof it.url === "string")
                    .filter(it => /^https?:\/\//i.test(it.url))
                    .slice(0, 5);
                if (items.length === 0) { showEmpty(); return; }

                list.textContent = "";
                items.forEach(it => {
                    const row = document.createElement("div");
                    row.className = "btoday-news-item";

                    const a = document.createElement("a");
                    a.className = "btoday-news-link";
                    a.href = it.url;
                    a.target = "_blank";
                    a.rel = "noopener noreferrer";
                    a.textContent = it.title.trim();
                    row.appendChild(a);

                    const meta = document.createElement("span");
                    meta.className = "btoday-news-meta";
                    const when = this._newsRelativeDate(it.published);
                    const source = (typeof it.source === "string") ? it.source.trim() : "";
                    meta.textContent = [source, when].filter(Boolean).join(" \u00b7 ");
                    if (meta.textContent) row.appendChild(meta);

                    list.appendChild(row);
                });
            })
            .catch(showEmpty);
    },

    //------------------------------------------------
    // GRAFIK SIKLUS HALVING (4 siklus sebelumnya, dinormalisasi
    // jadi % perubahan dari harga saat halving supaya bisa
    // dibandingkan langsung meski skala harganya beda jauh)
    //------------------------------------------------
    _halvingChartRendered: false,

    renderHalvingCycleChart() {
        const canvas = document.getElementById("halvingCycleChart");
        if (!canvas) return;

        this.loadLocalPriceHistory().then(priceMap => {
            const halvingDates = [
                { year: "2012", date: "2012-11-28", color: "#888" },
                { year: "2016", date: "2016-07-09", color: "#2980ef" },
                { year: "2020", date: "2020-05-11", color: "#16a34a" },
                { year: "2024", date: "2024-04-20", color: "#f7931a" }
            ];
            const monthsToShow = 18;
            const labels = [];
            for (let m = 0; m <= monthsToShow; m++) labels.push("Bln " + m);

            const isMobile = window.innerWidth < 600;
            const datasets = halvingDates.map(h => {
                const startDate = new Date(h.date + "T00:00:00Z");
                const basePrice = this.lookupHistoricalPrice(priceMap, h.date);
                const data = [];
                for (let m = 0; m <= monthsToShow; m++) {
                    const d = new Date(startDate);
                    d.setUTCMonth(d.getUTCMonth() + m);
                    if (d > new Date()) { data.push(null); continue; }
                    const dateStr = this.toDateInputFormat(d);
                    const price = this.lookupHistoricalPrice(priceMap, dateStr);
                    data.push((basePrice && price) ? ((price / basePrice) - 1) * 100 : null);
                }
                return {
                    label: h.year,
                    data: data,
                    borderColor: h.color,
                    backgroundColor: "transparent",
                    borderWidth: isMobile ? 1.5 : 2,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHitRadius: 10,
                    pointHoverRadius: 4,
                    spanGaps: true
                };
            });

            this.loadChartJs().then(() => {
                if (this._chartInstances["halvingCycleChart"]) {
                    this._chartInstances["halvingCycleChart"].destroy();
                }
                this._chartInstances["halvingCycleChart"] = new Chart(canvas.getContext("2d"), {
                    type: "line",
                    data: { labels, datasets },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: "nearest", intersect: false },
                        plugins: {
                            legend: {
                                display: true,
                                position: "top",
                                labels: { boxWidth: 12, font: { size: 10 }, color: "#888" }
                            },
                            tooltip: {
                                enabled: true,
                                callbacks: {
                                    label: (ctx) => ctx.dataset.label + ": " + (ctx.parsed.y >= 0 ? "+" : "") + ctx.parsed.y.toFixed(0) + "%"
                                }
                            }
                        },
                        scales: {
                            x: { display: !isMobile, grid: { display: false } },
                            y: {
                                display: !isMobile,
                                grid: { display: !isMobile, color: "rgba(0,0,0,0.05)" },
                                ticks: { callback: (val) => val + "%" }
                            }
                        }
                    }
                });
                this._halvingChartRendered = true;
            }).catch(err => console.warn("Chart siklus halving gagal dimuat:", err));
        });
    }
});
