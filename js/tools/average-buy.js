/*==================================================
    BITCOIN TOOLKIT - AVERAGE BUY CALCULATOR
==================================================*/

Object.assign(BitcoinTools, {
    bindAverageBuyEvents() {
        const addAvgRowBtn = document.getElementById("addAvgRowBtn");
        if (addAvgRowBtn) addAvgRowBtn.addEventListener("click", () => this.addAvgRow());

        const avgCalcBtn = document.getElementById("avgCalcBtn");
        if (avgCalcBtn) avgCalcBtn.addEventListener("click", () => this.calculateAverageBuy());

        const avgRowsContainer = document.getElementById("avgBuyRows");
        if (avgRowsContainer) {
            avgRowsContainer.addEventListener("change", (e) => {
                if (e.target.classList.contains("avgDate")) {
                    this.onAvgDateChange(e.target.closest(".avg-buy-row"));
                }
            });
            avgRowsContainer.addEventListener("input", (e) => {
                if (e.target.classList.contains("avgAmount")) {
                    this.formatNumberInput(e.target);
                }
            });
        }
    },

    //------------------------------------------------
    // AVERAGE BUY CALCULATOR (Opsi A: harga historis otomatis)
    //------------------------------------------------

    addAvgRow() {
        const container = document.getElementById("avgBuyRows");
        const row = document.createElement("div");
        row.className = "avg-buy-row";
        row.innerHTML =
            '<input type="date" class="avgDate">' +
            '<div class="input-box">' +
            '<select class="avgCurrency"><option value="usd">$</option><option value="idr">Rp</option></select>' +
            '<input type="text" inputmode="decimal" class="avgAmount" placeholder="Jumlah dibelanjakan">' +
            '</div>' +
            '<p class="avgFetchedPrice">Pilih tanggal untuk memuat harga</p>';
        container.appendChild(row);
    },

    async fetchHistoricalPrice(dateInputValue) {
        if (this.historicalCache[dateInputValue]) {
            return this.historicalCache[dateInputValue];
        }

        const priceMap = await this.loadLocalPriceHistory();
        const usd = this.lookupHistoricalPrice(priceMap, dateInputValue);
        if (usd === null) {
            throw new Error("Tidak ada data harga untuk tanggal ini di btc-price-history.json (di luar rentang data yang tersimpan).");
        }

        const idr = this.exchangeRate ? usd * this.exchangeRate : null;

        const result = { usd, idr };
        this.historicalCache[dateInputValue] = result;
        return result;
    },

    async onAvgDateChange(rowEl) {
        const dateInput = rowEl.querySelector(".avgDate");
        const priceDisplay = rowEl.querySelector(".avgFetchedPrice");
        if (!dateInput.value) return;

        priceDisplay.textContent = "Memuat harga historis...";
        try {
            const price = await this.fetchHistoricalPrice(dateInput.value);
            rowEl.dataset.priceUsd = price.usd;
            rowEl.dataset.priceIdr = price.idr;
            priceDisplay.textContent = "Harga saat itu: $" + price.usd.toLocaleString("en-US", { maximumFractionDigits: 2 }) +
                " / Rp" + Math.round(price.idr).toLocaleString("id-ID");
        } catch (e) {
            priceDisplay.textContent = "Gagal memuat harga untuk tanggal ini. Coba tanggal lain.";
        }
    },

    calculateAverageBuy() {
        const rows = document.querySelectorAll("#avgBuyRows .avg-buy-row");
        let totalBTC = 0;
        let totalSpentUSD = 0;
        let totalSpentIDR = 0;
        let validCount = 0;
        const chartRaw = [];

        rows.forEach(row => {
            const amountInput = row.querySelector(".avgAmount");
            const currencySelect = row.querySelector(".avgCurrency");
            const dateInput = row.querySelector(".avgDate");
            const amount = this.parseFormattedNumber(amountInput.value);
            const currency = currencySelect.value;
            const priceUsd = parseFloat(row.dataset.priceUsd);
            const priceIdr = parseFloat(row.dataset.priceIdr);

            if (!amount || amount <= 0 || !priceUsd || !priceIdr) return;

            let btcBought;
            if (currency === "usd") {
                btcBought = amount / priceUsd;
            } else {
                btcBought = amount / priceIdr;
            }

            totalBTC += btcBought;
            totalSpentUSD += btcBought * priceUsd;
            totalSpentIDR += btcBought * priceIdr;
            validCount++;

            if (dateInput && dateInput.value) {
                chartRaw.push({ label: dateInput.value, value: priceUsd });
            }
        });

        if (validCount === 0 || totalBTC === 0) {
            alert("Isi minimal 1 baris dengan tanggal dan jumlah, pastikan harga historis sudah termuat (lihat teks di bawah tanggal).");
            return;
        }
        if (!this.btcPrice) {
            alert("Harga BTC live belum termuat. Coba pindah tab ke DCA Calculator / Currency Converter dulu.");
            return;
        }

        const avgPriceUSD = totalSpentUSD / totalBTC;
        const avgPriceIDR = totalSpentIDR / totalBTC;
        const currentValueUSD = totalBTC * this.btcPrice;
        const currentValueIDR = totalBTC * this.btcPrice * this.exchangeRate;
        const profitLossUSD = currentValueUSD - totalSpentUSD;
        const profitLossIDR = currentValueIDR - totalSpentIDR;
        const profitPercent = (profitLossUSD / totalSpentUSD) * 100;

        document.getElementById("avgTotalSpent").textContent =
            "$" + totalSpentUSD.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(totalSpentIDR).toLocaleString("id-ID");
        document.getElementById("avgTotalBTC").textContent = totalBTC.toFixed(8) + " BTC";
        document.getElementById("avgPrice").textContent =
            "$" + avgPriceUSD.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(avgPriceIDR).toLocaleString("id-ID");
        document.getElementById("avgCurrentPrice").textContent =
            "$" + this.btcPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(this.btcPrice * this.exchangeRate).toLocaleString("id-ID");
        document.getElementById("avgProfitLoss").innerHTML =
            (profitLossUSD >= 0
                ? '<span class="value-positive">▲ +$' + Math.abs(profitLossUSD).toLocaleString("en-US", { maximumFractionDigits: 2 }) + ' / +Rp' + Math.abs(Math.round(profitLossIDR)).toLocaleString("id-ID") + ' (+' + profitPercent.toFixed(2) + '%)</span>'
                : '<span class="value-negative">▼ -$' + Math.abs(profitLossUSD).toLocaleString("en-US", { maximumFractionDigits: 2 }) + ' / -Rp' + Math.abs(Math.round(profitLossIDR)).toLocaleString("id-ID") + ' (' + profitPercent.toFixed(2) + '%)</span>');

        document.getElementById("avgResult").style.display = "block";

        // Chart tren harga tiap transaksi, diurutkan berdasarkan tanggal
        const chartPoints = chartRaw
            .sort((a, b) => a.label.localeCompare(b.label));
        this.renderTrendChart("avgChart", chartPoints);
    }
});
