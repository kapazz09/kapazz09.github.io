/*==================================================
    BITCOIN TOOLKIT - MINING PROFIT CALCULATOR
==================================================*/

Object.assign(BitcoinTools, {
    bindMiningEvents() {
        const loadNetworkBtn = document.getElementById("loadNetworkBtn");
        if (loadNetworkBtn) loadNetworkBtn.addEventListener("click", () => this.loadNetworkHashrate());

        const miningCalcBtn = document.getElementById("miningCalcBtn");
        if (miningCalcBtn) miningCalcBtn.addEventListener("click", () => this.calculateMiningProfit());

        const miningElecCostInput = document.getElementById("miningElecCost");
        if (miningElecCostInput) miningElecCostInput.addEventListener("input", () => this.formatNumberInput(miningElecCostInput));
    },

    //------------------------------------------------
    // MINING PROFIT CALCULATOR
    //------------------------------------------------

    loadNetworkHashrate() {
        const info = document.getElementById("networkHashrateInfo");
        if (info) {
            info.innerHTML = '<span class="skeleton-block short" style="height:10px;"></span>';
        }
        fetch("https://mempool.space/api/v1/mining/hashrate/3d")
            .then(res => res.json())
            .then(data => {
                this.networkHashrateHs = data.currentHashrate;
                const info = document.getElementById("networkHashrateInfo");
                if (info) {
                    const ehs = (this.networkHashrateHs / 1e18).toFixed(2);
                    info.textContent = "Network hashrate: " + ehs + " EH/s (dimuat otomatis)";
                }
            })
            .catch(() => {
                const info = document.getElementById("networkHashrateInfo");
                if (info) info.textContent = "Gagal memuat network hashrate. Coba lagi nanti.";
            });
    },

    calculateMiningProfit() {
        const hashrateTH = parseFloat(document.getElementById("miningHashrate").value);
        const powerW = parseFloat(document.getElementById("miningPower").value);
        const elecCost = this.parseFormattedNumber(document.getElementById("miningElecCost").value);
        const poolFee = parseFloat(document.getElementById("miningPoolFee").value) || 0;

        if (!hashrateTH || !powerW || isNaN(elecCost)) {
            alert("Mohon isi semua kolom dengan angka yang valid.");
            return;
        }
        if (!this.networkHashrateHs) {
            alert("Klik 'Load Network Data' dulu untuk memuat hashrate jaringan.");
            return;
        }
        if (!this.btcPrice) {
            alert("Harga BTC belum termuat. Buka DCA Calculator / Currency Converter untuk memuat harga live dulu.");
            return;
        }

        const yourHashrateHs = hashrateTH * 1e12;
        const share = yourHashrateHs / this.networkHashrateHs;
        const blocksPerDay = 144;
        const blockReward = 3.125;

        let dailyBTC = share * blocksPerDay * blockReward;
        dailyBTC = dailyBTC * (1 - poolFee / 100);

        const dailyRevenueUSD = dailyBTC * this.btcPrice;
        const dailyKWh = (powerW / 1000) * 24;
        const dailyCostUSD = dailyKWh * elecCost;
        const dailyProfitUSD = dailyRevenueUSD - dailyCostUSD;

        const idrRate = this.exchangeRate || 0;
        const fmt = (usd) => "$" + usd.toFixed(2) + (idrRate ? " / Rp" + Math.round(usd * idrRate).toLocaleString("id-ID") : "");

        document.getElementById("miningBTC").textContent = dailyBTC.toFixed(8) + " BTC";
        document.getElementById("miningRevenue").textContent = fmt(dailyRevenueUSD);
        document.getElementById("miningCost").textContent = fmt(dailyCostUSD);
        document.getElementById("miningProfit").textContent = (dailyProfitUSD >= 0 ? "+" : "-") + fmt(Math.abs(dailyProfitUSD));

        document.getElementById("miningResult").style.display = "block";
    }
});
