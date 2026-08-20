/*==================================================
    BITCOIN TOOLKIT - CURRENCY CONVERTER
==================================================*/

Object.assign(BitcoinTools, {
    bindConverterEvents() {
        const convBtc = document.getElementById("convBtcInput");
        const convSat = document.getElementById("convSatInput");
        const convUsd = document.getElementById("convUsdInput");
        const convIdr = document.getElementById("convIdrInput");
        const convOther = document.getElementById("convOtherInput");
        const convOtherCurrency = document.getElementById("convOtherCurrency");

        if (convBtc) convBtc.addEventListener("input", () => this.convertCurrency("btc"));
        if (convSat) convSat.addEventListener("input", () => this.convertCurrency("sat"));
        if (convUsd) convUsd.addEventListener("input", () => { this.formatNumberInput(convUsd); this.convertCurrency("usd"); });
        if (convIdr) convIdr.addEventListener("input", () => { this.formatNumberInput(convIdr); this.convertCurrency("idr"); });
        if (convOther) convOther.addEventListener("input", () => { this.formatNumberInput(convOther); this.convertCurrency("other"); });
        if (convOtherCurrency) {
            convOtherCurrency.addEventListener("change", () => {
                const label = document.getElementById("convOtherCurrencyLabel");
                if (label) label.textContent = convOtherCurrency.value;
                this.convertCurrency("btc"); // hitung ulang kolom "Mata Uang Lain" pakai kurs baru
            });
        }
    },

    //------------------------------------------------
    // KURS MATA UANG LAIN (selain USD/IDR)
    // Diambil sekali per sesi (di-cache), tidak perlu real-time.
    //------------------------------------------------
    customRates: null,
    customRatesLoading: null,

    loadCustomCurrencyRates() {
        if (this.customRates) return Promise.resolve(this.customRates);
        if (this.customRatesLoading) return this.customRatesLoading;

        const info = document.getElementById("convOtherRateInfo");
        this.customRatesLoading = fetch("https://open.er-api.com/v6/latest/USD")
            .then(res => res.json())
            .then(data => {
                if (data && data.rates) {
                    this.customRates = data.rates;
                    if (info) {
                        info.textContent = "*Harga live untuk konversi USD/IDR otomatis termuat begitu modal ini dibuka. " +
                            "Kurs mata uang lain di-update berkala (bukan real-time per detik).";
                    }
                    this.convertCurrency("btc");
                } else {
                    throw new Error("Format data kurs tidak sesuai");
                }
                return this.customRates;
            })
            .catch(() => {
                if (info) info.textContent = "*Gagal memuat kurs mata uang lain. USD/IDR tetap berfungsi normal.";
                return null;
            });

        return this.customRatesLoading;
    },

    //------------------------------------------------
    // CURRENCY CONVERTER (BTC / SAT / USD / IDR / Mata Uang Lain — gabungan)
    //------------------------------------------------

    convertCurrency(source) {
        if (this.isConverting) return;
        this.isConverting = true;

        const btcInput = document.getElementById("convBtcInput");
        const satInput = document.getElementById("convSatInput");
        const usdInput = document.getElementById("convUsdInput");
        const idrInput = document.getElementById("convIdrInput");
        const otherInput = document.getElementById("convOtherInput");
        const otherCurrencySelect = document.getElementById("convOtherCurrency");
        const otherCode = otherCurrencySelect ? otherCurrencySelect.value : null;
        const otherRate = (this.customRates && otherCode) ? this.customRates[otherCode] : null;

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
        } else if (source === "other") {
            const otherVal = this.parseFormattedNumber(otherInput.value);
            if (!isNaN(otherVal) && this.btcPrice && otherRate) {
                const usdEquivalent = otherVal / otherRate;
                btc = usdEquivalent / this.btcPrice;
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
        if (source !== "other" && otherInput && this.btcPrice && otherRate) {
            const otherValue = btc * this.btcPrice * otherRate;
            otherInput.value = otherValue.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        this.isConverting = false;
    }
});
