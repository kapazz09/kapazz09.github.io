/*==================================================
    BITCOIN TOOLKIT - CURRENCY CONVERTER
==================================================*/

Object.assign(BitcoinTools, {
    bindConverterEvents() {
        const convBtc = document.getElementById("convBtcInput");
        const convSat = document.getElementById("convSatInput");
        const convUsd = document.getElementById("convUsdInput");
        const convIdr = document.getElementById("convIdrInput");
        if (convBtc) convBtc.addEventListener("input", () => this.convertCurrency("btc"));
        if (convSat) convSat.addEventListener("input", () => this.convertCurrency("sat"));
        if (convUsd) convUsd.addEventListener("input", () => { this.formatNumberInput(convUsd); this.convertCurrency("usd"); });
        if (convIdr) convIdr.addEventListener("input", () => { this.formatNumberInput(convIdr); this.convertCurrency("idr"); });
    },

    //------------------------------------------------
    // CURRENCY CONVERTER (BTC / SAT / USD / IDR gabungan)
    //------------------------------------------------

    convertCurrency(source) {
        if (this.isConverting) return;
        this.isConverting = true;

        const btcInput = document.getElementById("convBtcInput");
        const satInput = document.getElementById("convSatInput");
        const usdInput = document.getElementById("convUsdInput");
        const idrInput = document.getElementById("convIdrInput");

        let btc = null;

        if (source === "btc") {
            btc = parseFloat(btcInput.value);
        } else if (source === "sat") {
            const sat = parseFloat(satInput.value);
            if (!isNaN(sat)) btc = sat / 100000000;
        } else if (source === "usd") {
            const usd = this.parseFormattedNumber(usdInput.value);
            if (!isNaN(usd) && this.btcPrice) btc = usd / this.btcPrice;
        } else if (source === "idr") {
            const idr = this.parseFormattedNumber(idrInput.value);
            if (!isNaN(idr) && this.btcPrice && this.exchangeRate) {
                btc = idr / (this.btcPrice * this.exchangeRate);
            }
        }

        if (btc === null || isNaN(btc)) {
            this.isConverting = false;
            return;
        }

        if (source !== "btc") btcInput.value = btc.toFixed(8);
        if (source !== "sat") satInput.value = Math.round(btc * 100000000);
        if (source !== "usd" && this.btcPrice) {
            usdInput.value = (btc * this.btcPrice).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (source !== "idr" && this.btcPrice && this.exchangeRate) {
            idrInput.value = Math.round(btc * this.btcPrice * this.exchangeRate).toLocaleString("id-ID");
        }

        this.isConverting = false;
    }
});
