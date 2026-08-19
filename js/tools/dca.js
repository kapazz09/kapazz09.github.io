/*==================================================
    BITCOIN TOOLKIT - DCA CALCULATOR
==================================================*/

Object.assign(BitcoinTools, {
    bindDcaEvents() {
        const calcBtn = document.getElementById("dcaCalcBtn");
        if (calcBtn) calcBtn.addEventListener("click", () => this.calculateDCA());

        const refreshBtn = document.getElementById("refreshPriceBtn");
        if (refreshBtn) refreshBtn.addEventListener("click", () => this.loadPrice());

        const copyBtn = document.getElementById("copyResultBtn");
        if (copyBtn) copyBtn.addEventListener("click", () => this.copyResult());

        const dcaAmountInput = document.getElementById("dcaAmount");
        if (dcaAmountInput) dcaAmountInput.addEventListener("input", () => this.formatNumberInput(dcaAmountInput));
    },

    calculateDCA() {
        const amount = this.parseFormattedNumber(document.getElementById("dcaAmount").value);
        const currency = document.getElementById("dcaCurrencySelect").value;
        const frequency = document.getElementById("dcaFrequency").value;
        const startDateStr = document.getElementById("dcaStartDate").value;
        const endDateStr = document.getElementById("dcaEndDate").value;

        if (!amount || amount <= 0 || !startDateStr || !endDateStr) {
            alert("Mohon isi Jumlah per Pembelian, Tanggal Mulai, dan Tanggal Akhir dengan benar.");
            return;
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (startDate >= endDate) {
            alert("Tanggal Mulai harus lebih awal dari Tanggal Akhir.");
            return;
        }
        if (!this.btcPrice) {
            alert("Harga BTC live belum termuat. Coba tunggu sebentar atau klik 'Refresh Live Price'.");
            return;
        }

        const purchaseDates = [];
        let cursor = new Date(startDate);
        while (cursor <= endDate) {
            purchaseDates.push(new Date(cursor));
            if (frequency === "daily") cursor.setUTCDate(cursor.getUTCDate() + 1);
            else if (frequency === "weekly") cursor.setUTCDate(cursor.getUTCDate() + 7);
            else cursor.setUTCMonth(cursor.getUTCMonth() + 1);
        }

        if (purchaseDates.length === 0) {
            alert("Tidak ada tanggal pembelian dalam rentang ini.");
            return;
        }
        if (purchaseDates.length > 3650) {
            alert("Rentang tanggal dan frekuensi ini menghasilkan terlalu banyak pembelian (" + purchaseDates.length + "x). Perpendek rentang atau pilih frekuensi lebih jarang.");
            return;
        }

        const btn = document.getElementById("dcaCalcBtn");
        const originalBtnText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Memuat data historis...";

        (async () => {
            let totalBTC = 0;
            let totalSpentUSD = 0;
            let totalSpentIDR = 0;
            let failedCount = 0;

            let usdMap = {};
            try {
                usdMap = await this.fetchDailyHistoryRange(startDate, endDate);
                if (Object.keys(usdMap).length === 0) throw new Error("empty");
            } catch (e) {
                throw new Error("Gagal memuat file btc-price-history.json. Pastikan file itu ada di folder yang sama dengan index.html, dan kamu membuka situs ini lewat server (Live Server/http), bukan langsung buka file HTML dari File Explorer.");
            }

            purchaseDates.forEach((date, i) => {
                let usdPrice;
                if (frequency === "daily") {
                    // Harian: harga hari itu saja (sudah rata-rata Open/High/Low/Close hari itu)
                    usdPrice = this.lookupHistoricalPrice(usdMap, this.toDateInputFormat(date));
                } else {
                    // Mingguan/Bulanan: rata-rata harga sepanjang periode itu
                    // (dari tanggal pembelian ini sampai sebelum tanggal pembelian berikutnya)
                    const periodEnd = (i + 1 < purchaseDates.length)
                        ? purchaseDates[i + 1]
                        : new Date(endDate.getTime() + 86400000);
                    usdPrice = this.averagePriceForPeriod(usdMap, date, periodEnd);
                }

                if (usdPrice === null || usdPrice === undefined || !this.exchangeRate) {
                    failedCount++;
                    return;
                }

                const idrPrice = usdPrice * this.exchangeRate;

                const btcBought = currency === "usd" ? (amount / usdPrice) : (amount / idrPrice);
                totalBTC += btcBought;
                totalSpentUSD += btcBought * usdPrice;
                totalSpentIDR += btcBought * idrPrice;
            });

            if (totalBTC === 0) {
                alert("Gagal memuat data historis untuk semua tanggal. Coba lagi sebentar lagi.");
                return;
            }

            const avgPriceUSD = totalSpentUSD / totalBTC;
            const avgPriceIDR = totalSpentIDR / totalBTC;
            const currentValueUSD = totalBTC * this.btcPrice;
            const currentValueIDR = this.exchangeRate ? totalBTC * this.btcPrice * this.exchangeRate : 0;
            const profitLossUSD = currentValueUSD - totalSpentUSD;
            const profitLossIDR = currentValueIDR - totalSpentIDR;
            const profitPercent = (profitLossUSD / totalSpentUSD) * 100;

            let purchaseCountText = purchaseDates.length + "x pembelian";
            if (failedCount > 0) {
                purchaseCountText += " (" + failedCount + "x gagal dimuat, tidak dihitung)";
            }
            purchaseCountText += " — nilai Rp estimasi (kurs saat ini)";

            document.getElementById("dcaPurchaseCount").textContent = purchaseCountText;
            document.getElementById("totalInvested").textContent =
                "$" + totalSpentUSD.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(totalSpentIDR).toLocaleString("id-ID");
            document.getElementById("btcAccumulated").textContent = totalBTC.toFixed(8) + " BTC";
            document.getElementById("averageBuy").textContent =
                "$" + avgPriceUSD.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(avgPriceIDR).toLocaleString("id-ID");
            document.getElementById("currentValue").textContent =
                "$" + currentValueUSD.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(currentValueIDR).toLocaleString("id-ID");
            document.getElementById("profitLoss").innerHTML =
                (profitLossUSD >= 0
                    ? '<span class="value-positive">▲ +$' + Math.abs(profitLossUSD).toLocaleString("en-US", { maximumFractionDigits: 2 }) + ' / +Rp' + Math.abs(Math.round(profitLossIDR)).toLocaleString("id-ID") + '</span>'
                    : '<span class="value-negative">▼ -$' + Math.abs(profitLossUSD).toLocaleString("en-US", { maximumFractionDigits: 2 }) + ' / -Rp' + Math.abs(Math.round(profitLossIDR)).toLocaleString("id-ID") + '</span>');
            document.getElementById("profitPercent").innerHTML =
                (profitPercent >= 0
                    ? '<span class="value-positive">▲ +' + profitPercent.toFixed(2) + '%</span>'
                    : '<span class="value-negative">▼ ' + profitPercent.toFixed(2) + '%</span>');

            document.getElementById("dcaResult").style.display = "block";

            // Chart tren harga sepanjang periode (maks ~80 titik biar ringan)
            const rangeDays = Math.max(1, Math.round((endDate - startDate) / 86400000));
            const maxPoints = 80;
            const stepDays = Math.max(1, Math.ceil(rangeDays / maxPoints));
            const chartPoints = [];
            let chartCursor = new Date(startDate);
            while (chartCursor <= endDate) {
                const dateStr = this.toDateInputFormat(chartCursor);
                const price = this.lookupHistoricalPrice(usdMap, dateStr);
                if (price !== null) chartPoints.push({ label: dateStr, value: price });
                chartCursor.setUTCDate(chartCursor.getUTCDate() + stepDays);
            }
            const lastDateStr = this.toDateInputFormat(endDate);
            const lastPrice = this.lookupHistoricalPrice(usdMap, lastDateStr);
            if (lastPrice !== null && (chartPoints.length === 0 || chartPoints[chartPoints.length - 1].label !== lastDateStr)) {
                chartPoints.push({ label: lastDateStr, value: lastPrice });
            }
            this.renderTrendChart("dcaChart", chartPoints);
        })().catch((e) => {
            alert(e.message || "Terjadi kesalahan saat memuat data historis. Coba lagi.");
        }).finally(() => {
            btn.disabled = false;
            btn.textContent = originalBtnText;
        });
    },

    copyResult() {
        const purchaseCount = document.getElementById("dcaPurchaseCount").textContent;
        const totalInvested = document.getElementById("totalInvested").textContent;
        const btcAccumulated = document.getElementById("btcAccumulated").textContent;
        const currentValue = document.getElementById("currentValue").textContent;
        const averageBuy = document.getElementById("averageBuy").textContent;
        const profitLoss = document.getElementById("profitLoss").textContent;
        const profitPercent = document.getElementById("profitPercent").textContent;

        const text = "DCA Simulator Result\n----------------------\nJumlah Pembelian: " + purchaseCount +
            "\nTotal Invest: " + totalInvested + "\nBTC Terkumpul: " + btcAccumulated + "\nAverage Buy: " + averageBuy +
            "\nNilai Sekarang: " + currentValue + "\nProfit/Loss: " + profitLoss + "\nProfit (%): " + profitPercent;

        navigator.clipboard.writeText(text).then(() => {
            alert("Hasil berhasil disalin ke clipboard!");
        }).catch(() => {
            alert("Gagal menyalin. Silakan salin manual.");
        });
    }
});
