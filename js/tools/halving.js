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
