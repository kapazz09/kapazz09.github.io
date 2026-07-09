/*==================================================
    BITCOIN TOOLKIT
    Version : 3.0
    Author  : Kapazz09
==================================================*/

const BitcoinTools = {

    //------------------------------------------------
    // GLOBAL
    //------------------------------------------------

    btcPrice: 0,
    exchangeRate: 0,
    currency: "USD",
    autoRefresh: null,
    networkHashrateHs: 0,

    quizData: [
        { q: "Siapa pencipta Bitcoin?", options: ["Satoshi Nakamoto", "Vitalik Buterin", "Elon Musk", "Craig Wright"], answer: 0 },
        { q: "Berapa maksimal total suplai Bitcoin?", options: ["21 juta", "100 juta", "1 miliar", "Tidak terbatas"], answer: 0 },
        { q: "Mekanisme konsensus apa yang dipakai Bitcoin?", options: ["Proof of Stake", "Proof of Work", "Proof of Authority", "Proof of History"], answer: 1 },
        { q: "Satuan terkecil Bitcoin disebut?", options: ["Gwei", "Satoshi", "Wei", "Litoshi"], answer: 1 },
        { q: "Kira-kira berapa lama waktu untuk 1 blok baru Bitcoin ditambang?", options: ["1 menit", "10 menit", "1 jam", "1 hari"], answer: 1 }
    ],
    quizIndex: 0,
    quizScore: 0,

    //------------------------------------------------
    // INIT
    //------------------------------------------------

    init() {
        this.bindEvents();
        this.loadPrice();
        this.renderQuiz();
        this.loadFearGreed();
        this.loadMempoolStatus();
        this.autoRefresh = setInterval(() => {
            this.loadPrice();
            this.loadFearGreed();
            this.loadMempoolStatus();
        }, 300000);
    },

    //------------------------------------------------
    // EVENTS
    //------------------------------------------------

    bindEvents() {
        const calcBtn = document.querySelector(".calculate-btn");
        if (calcBtn) {
            calcBtn.addEventListener("click", () => {
                this.calculateDCA();
            });
        }

        const refreshBtn = document.getElementById("refreshPriceBtn");
        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => {
                this.loadPrice();
            });
        }

        const currencyBtn = document.getElementById("currencyBtn");
        if (currencyBtn) {
            currencyBtn.addEventListener("click", () => {
                this.toggleCurrency();
            });
        }

        const copyBtn = document.getElementById("copyResultBtn");
        if (copyBtn) {
            copyBtn.addEventListener("click", () => {
                this.copyResult();
            });
        }

        // --- BTC <-> Satoshi Converter ---
        const satBtcInput = document.getElementById("satBtcInput");
        const satSatInput = document.getElementById("satSatInput");
        if (satBtcInput && satSatInput) {
            satBtcInput.addEventListener("input", () => this.convertFromBTC());
            satSatInput.addEventListener("input", () => this.convertFromSat());
        }

        // --- Price Converter (BTC / USD / IDR) ---
        const priceBtcInput = document.getElementById("priceBtcInput");
        const priceUsdInput = document.getElementById("priceUsdInput");
        const priceIdrInput = document.getElementById("priceIdrInput");
        if (priceBtcInput && priceUsdInput && priceIdrInput) {
            priceBtcInput.addEventListener("input", () => this.convertPrice("btc"));
            priceUsdInput.addEventListener("input", () => this.convertPrice("usd"));
            priceIdrInput.addEventListener("input", () => this.convertPrice("idr"));
        }

        // --- Lightning Fee Estimator ---
        const feeCalcBtn = document.getElementById("feeCalcBtn");
        if (feeCalcBtn) {
            feeCalcBtn.addEventListener("click", () => this.calculateLightningFee());
        }

        // --- Mining Profit ---
        const loadNetworkBtn = document.getElementById("loadNetworkBtn");
        if (loadNetworkBtn) {
            loadNetworkBtn.addEventListener("click", () => this.loadNetworkHashrate());
        }
        const miningCalcBtn = document.getElementById("miningCalcBtn");
        if (miningCalcBtn) {
            miningCalcBtn.addEventListener("click", () => this.calculateMiningProfit());
        }

        // --- UTXO Calculator ---
        const loadFeeRateBtn = document.getElementById("loadFeeRateBtn");
        if (loadFeeRateBtn) {
            loadFeeRateBtn.addEventListener("click", () => this.loadFeeRate());
        }
        const utxoCalcBtn = document.getElementById("utxoCalcBtn");
        if (utxoCalcBtn) {
            utxoCalcBtn.addEventListener("click", () => this.calculateUTXO());
        }

        // --- Average Buy ---
        const addAvgRowBtn = document.getElementById("addAvgRowBtn");
        if (addAvgRowBtn) {
            addAvgRowBtn.addEventListener("click", () => this.addAvgRow());
        }
        const avgCalcBtn = document.getElementById("avgCalcBtn");
        if (avgCalcBtn) {
            avgCalcBtn.addEventListener("click", () => this.calculateAverageBuy());
        }
    },

    //------------------------------------------------
    // LOAD BTC PRICE
    //------------------------------------------------

    async loadPrice() {
        try {
            const response = await fetch(
                "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,idr"
            );
            const data = await response.json();
            this.btcPrice = data.bitcoin.usd;
            this.exchangeRate = data.bitcoin.idr / data.bitcoin.usd;

            this.updatePriceDisplay();
            console.log("BTC :", this.btcPrice);
        } catch (error) {
            console.error("Price Error :", error);
            this.showOfflinePrice();
        }
    },

    //------------------------------------------------
    // UPDATE PRICE DISPLAY
    //------------------------------------------------

    updatePriceDisplay() {
        const input = document.getElementById("btcPrice");
        if (!input) return;

        if (this.currency === "USD") {
            input.value = this.btcPrice.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } else {
            input.value = Math.round(
                this.btcPrice * this.exchangeRate
            ).toLocaleString("id-ID");
        }
    },

    //------------------------------------------------
    // OFFLINE
    //------------------------------------------------

    showOfflinePrice() {
        const input = document.getElementById("btcPrice");
        if (!input) return;
        input.value = "Unable to load";
    },

    //------------------------------------------------
    // CHANGE CURRENCY (juga ganti simbol $ <-> Rp)
    //------------------------------------------------

    toggleCurrency() {
        const oldCurrency = this.currency;
        this.currency = this.currency === "USD" ? "IDR" : "USD";

        const btn = document.getElementById("currencyBtn");
        if (btn) btn.textContent = this.currency;

        const symbol = this.currency === "USD" ? "$" : "Rp";
        const monthlySymbol = document.getElementById("monthlySymbol");
        const priceSymbol = document.getElementById("priceSymbol");
        if (monthlySymbol) monthlySymbol.textContent = symbol;
        if (priceSymbol) priceSymbol.textContent = symbol;

        // Konversi nilai Monthly Investment mengikuti perubahan mata uang
        const monthlyInput = document.getElementById("dcaMonthly");
        if (monthlyInput && monthlyInput.value && this.exchangeRate) {
            const val = parseFloat(monthlyInput.value);
            if (!isNaN(val)) {
                if (oldCurrency === "USD" && this.currency === "IDR") {
                    monthlyInput.value = Math.round(val * this.exchangeRate);
                } else if (oldCurrency === "IDR" && this.currency === "USD") {
                    monthlyInput.value = (val / this.exchangeRate).toFixed(2);
                }
            }
        }

        this.updatePriceDisplay();
    },

    //------------------------------------------------
    // DCA CALCULATOR
    //------------------------------------------------

    calculateDCA() {
        const monthlyInput = document.getElementById("dcaMonthly");
        const yearsInput = document.getElementById("dcaYears");
        const resultCard = document.getElementById("dcaResult");

        const monthlyRaw = parseFloat(monthlyInput.value);
        const years = parseFloat(yearsInput.value);

        if (!monthlyRaw || !years || monthlyRaw <= 0 || years <= 0) {
            alert("Mohon isi Monthly Investment dan Investment Period dengan angka yang valid.");
            return;
        }

        if (!this.btcPrice || this.btcPrice === 0) {
            alert("Harga BTC belum termuat. Coba klik 'Refresh Price' dulu.");
            return;
        }

        // Konversi input ke USD dulu (kalkulasi internal selalu dalam USD)
        let monthlyUSD = monthlyRaw;
        if (this.currency === "IDR" && this.exchangeRate) {
            monthlyUSD = monthlyRaw / this.exchangeRate;
        }

        const totalMonths = years * 12;
        const totalInvestedUSD = monthlyUSD * totalMonths;

        // Catatan: memakai harga BTC SAAT INI sebagai estimasi tetap tiap bulan
        // (simplifikasi, bukan data historis harga).
        const btcAccumulated = totalInvestedUSD / this.btcPrice;
        const currentValueUSD = btcAccumulated * this.btcPrice;
        const averageBuyPriceUSD = this.btcPrice;
        const profitLossUSD = currentValueUSD - totalInvestedUSD;
        const profitPercent = (profitLossUSD / totalInvestedUSD) * 100;

        const symbol = this.currency === "USD" ? "$" : "Rp";
        const toDisplay = (usdVal) => {
            if (this.currency === "IDR" && this.exchangeRate) {
                return symbol + Math.round(usdVal * this.exchangeRate).toLocaleString("id-ID");
            }
            return symbol + usdVal.toLocaleString("en-US", { maximumFractionDigits: 2 });
        };

        document.getElementById("totalInvested").textContent = toDisplay(totalInvestedUSD);
        document.getElementById("btcAccumulated").textContent = btcAccumulated.toFixed(8) + " BTC";
        document.getElementById("currentValue").textContent = toDisplay(currentValueUSD);
        document.getElementById("averageBuy").textContent = toDisplay(averageBuyPriceUSD);

        const absProfitDisplay = this.currency === "IDR" && this.exchangeRate
            ? Math.round(Math.abs(profitLossUSD) * this.exchangeRate).toLocaleString("id-ID")
            : Math.abs(profitLossUSD).toLocaleString("en-US", { maximumFractionDigits: 2 });

        document.getElementById("profitLoss").textContent = (profitLossUSD >= 0 ? "+" : "-") + symbol + absProfitDisplay;
        document.getElementById("profitPercent").textContent = (profitPercent >= 0 ? "+" : "") + profitPercent.toFixed(2) + "%";

        resultCard.style.display = "block";
    },

    //------------------------------------------------
    // COPY RESULT
    //------------------------------------------------

    copyResult() {
        const totalInvested = document.getElementById("totalInvested").textContent;
        const btcAccumulated = document.getElementById("btcAccumulated").textContent;
        const currentValue = document.getElementById("currentValue").textContent;
        const averageBuy = document.getElementById("averageBuy").textContent;
        const profitLoss = document.getElementById("profitLoss").textContent;
        const profitPercent = document.getElementById("profitPercent").textContent;

        const text =
            "DCA Calculator Result\n" +
            "----------------------\n" +
            "Total Invested: " + totalInvested + "\n" +
            "BTC Accumulated: " + btcAccumulated + "\n" +
            "Current Value: " + currentValue + "\n" +
            "Average Buy Price: " + averageBuy + "\n" +
            "Profit/Loss: " + profitLoss + "\n" +
            "Profit (%): " + profitPercent;

        navigator.clipboard.writeText(text).then(() => {
            alert("Hasil berhasil disalin ke clipboard!");
        }).catch(() => {
            alert("Gagal menyalin. Silakan salin manual.");
        });
    },

    //------------------------------------------------
    // BTC <-> SATOSHI CONVERTER
    //------------------------------------------------

    convertFromBTC() {
        const btcInput = document.getElementById("satBtcInput");
        const satInput = document.getElementById("satSatInput");
        const btcVal = parseFloat(btcInput.value);
        if (isNaN(btcVal)) {
            satInput.value = "";
            return;
        }
        satInput.value = Math.round(btcVal * 100000000);
    },

    convertFromSat() {
        const btcInput = document.getElementById("satBtcInput");
        const satInput = document.getElementById("satSatInput");
        const satVal = parseFloat(satInput.value);
        if (isNaN(satVal)) {
            btcInput.value = "";
            return;
        }
        btcInput.value = (satVal / 100000000).toFixed(8);
    },

    //------------------------------------------------
    // PRICE CONVERTER (BTC / USD / IDR)
    //------------------------------------------------

    convertPrice(source) {
        if (!this.btcPrice || this.btcPrice === 0) {
            alert("Harga BTC belum termuat. Buka tool 'DCA Calculator' dan klik 'Refresh Price' dulu.");
            return;
        }

        const idrRate = this.exchangeRate || 0;
        const btcInput = document.getElementById("priceBtcInput");
        const usdInput = document.getElementById("priceUsdInput");
        const idrInput = document.getElementById("priceIdrInput");

        if (source === "btc") {
            const btc = parseFloat(btcInput.value);
            if (isNaN(btc)) return;
            const usd = btc * this.btcPrice;
            usdInput.value = usd.toFixed(2);
            if (idrRate) idrInput.value = Math.round(usd * idrRate);
        } else if (source === "usd") {
            const usd = parseFloat(usdInput.value);
            if (isNaN(usd)) return;
            const btc = usd / this.btcPrice;
            btcInput.value = btc.toFixed(8);
            if (idrRate) idrInput.value = Math.round(usd * idrRate);
        } else if (source === "idr") {
            if (!idrRate) return;
            const idr = parseFloat(idrInput.value);
            if (isNaN(idr)) return;
            const usd = idr / idrRate;
            btcInput.value = (usd / this.btcPrice).toFixed(8);
            usdInput.value = usd.toFixed(2);
        }
    },

    //------------------------------------------------
    // LIGHTNING FEE ESTIMATOR
    //------------------------------------------------

    calculateLightningFee() {
        const satInput = document.getElementById("feeSatInput");
        const sat = parseFloat(satInput.value);

        if (!sat || sat <= 0) {
            alert("Masukkan jumlah sat yang valid.");
            return;
        }

        const baseFee = 1;
        const feeRatePercent = 0.05;

        const rateFee = sat * (feeRatePercent / 100);
        const total = baseFee + rateFee;

        document.getElementById("feeBase").textContent = baseFee + " sat";
        document.getElementById("feeRate").textContent = rateFee.toFixed(2) + " sat";
        document.getElementById("feeTotal").textContent = total.toFixed(2) + " sat";

        document.getElementById("feeResult").style.display = "block";
    },

    //------------------------------------------------
    // MINING PROFIT CALCULATOR
    //------------------------------------------------

    loadNetworkHashrate() {
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
        const elecCost = parseFloat(document.getElementById("miningElecCost").value);
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
            alert("Harga BTC belum termuat. Buka DCA Calculator dan klik 'Refresh Price' dulu.");
            return;
        }

        const yourHashrateHs = hashrateTH * 1e12;
        const share = yourHashrateHs / this.networkHashrateHs;
        const blocksPerDay = 144;
        const blockReward = 3.125; // reward per block pasca-halving 2024

        let dailyBTC = share * blocksPerDay * blockReward;
        dailyBTC = dailyBTC * (1 - poolFee / 100);

        const dailyRevenueUSD = dailyBTC * this.btcPrice;
        const dailyKWh = (powerW / 1000) * 24;
        const dailyCostUSD = dailyKWh * elecCost;
        const dailyProfitUSD = dailyRevenueUSD - dailyCostUSD;

        document.getElementById("miningBTC").textContent = dailyBTC.toFixed(8) + " BTC";
        document.getElementById("miningRevenue").textContent = "$" + dailyRevenueUSD.toFixed(2);
        document.getElementById("miningCost").textContent = "$" + dailyCostUSD.toFixed(2);
        document.getElementById("miningProfit").textContent = (dailyProfitUSD >= 0 ? "+$" : "-$") + Math.abs(dailyProfitUSD).toFixed(2);

        document.getElementById("miningResult").style.display = "block";
    },

    //------------------------------------------------
    // UTXO & FEE CALCULATOR
    //------------------------------------------------

    loadFeeRate() {
        fetch("https://mempool.space/api/v1/fees/recommended")
            .then(res => res.json())
            .then(data => {
                const feeInput = document.getElementById("utxoFeeRate");
                if (feeInput) feeInput.value = data.halfHourFee;
            })
            .catch(() => {
                alert("Gagal memuat fee rate. Silakan isi manual.");
            });
    },

    calculateUTXO() {
        const inputs = parseFloat(document.getElementById("utxoInputs").value);
        const outputs = parseFloat(document.getElementById("utxoOutputs").value);
        const feeRate = parseFloat(document.getElementById("utxoFeeRate").value);

        if (!inputs || !outputs || !feeRate || inputs <= 0 || outputs <= 0 || feeRate <= 0) {
            alert("Mohon isi semua kolom dengan angka yang valid.");
            return;
        }

        const vBytes = 10.5 + (inputs * 68) + (outputs * 31);
        const feeSats = vBytes * feeRate;
        const feeUsd = this.btcPrice ? (feeSats / 1e8) * this.btcPrice : null;

        document.getElementById("utxoSize").textContent = vBytes.toFixed(1) + " vBytes";
        document.getElementById("utxoFeeSat").textContent = Math.round(feeSats) + " sat";
        document.getElementById("utxoFeeUsd").textContent = feeUsd !== null
            ? "$" + feeUsd.toFixed(4)
            : "Refresh price dulu di DCA Calculator";

        document.getElementById("utxoResult").style.display = "block";
    },

    //------------------------------------------------
    // AVERAGE BUY CALCULATOR
    //------------------------------------------------

    addAvgRow() {
        const container = document.getElementById("avgBuyRows");
        const row = document.createElement("div");
        row.className = "avg-buy-row";
        row.innerHTML =
            '<div class="input-box"><span>$</span><input type="number" class="avgAmountUSD" placeholder="Amount Spent"></div>' +
            '<div class="input-box"><span>@</span><input type="number" class="avgPriceAtBuy" placeholder="BTC Price saat beli"></div>';
        container.appendChild(row);
    },

    calculateAverageBuy() {
        const amountInputs = document.querySelectorAll(".avgAmountUSD");
        const priceInputs = document.querySelectorAll(".avgPriceAtBuy");

        let totalSpent = 0;
        let totalBTC = 0;

        for (let i = 0; i < amountInputs.length; i++) {
            const amount = parseFloat(amountInputs[i].value);
            const price = parseFloat(priceInputs[i].value);
            if (amount > 0 && price > 0) {
                totalSpent += amount;
                totalBTC += amount / price;
            }
        }

        if (totalBTC === 0) {
            alert("Isi minimal 1 baris transaksi dengan angka yang valid.");
            return;
        }

        const avgPrice = totalSpent / totalBTC;

        document.getElementById("avgTotalSpent").textContent = "$" + totalSpent.toLocaleString("en-US", { maximumFractionDigits: 2 });
        document.getElementById("avgTotalBTC").textContent = totalBTC.toFixed(8) + " BTC";
        document.getElementById("avgPrice").textContent = "$" + avgPrice.toLocaleString("en-US", { maximumFractionDigits: 2 });

        if (this.btcPrice) {
            const currentValue = totalBTC * this.btcPrice;
            const profitLoss = currentValue - totalSpent;
            document.getElementById("avgCurrentPrice").textContent = "$" + this.btcPrice.toLocaleString("en-US", { maximumFractionDigits: 2 });
            document.getElementById("avgProfitLoss").textContent = (profitLoss >= 0 ? "+$" : "-$") + Math.abs(profitLoss).toLocaleString("en-US", { maximumFractionDigits: 2 });
        } else {
            document.getElementById("avgCurrentPrice").textContent = "Refresh price dulu";
            document.getElementById("avgProfitLoss").textContent = "-";
        }

        document.getElementById("avgResult").style.display = "block";
    },

    //------------------------------------------------
    // BITCOIN QUIZ
    //------------------------------------------------

    renderQuiz() {
        const container = document.getElementById("quizContainer");
        if (!container) return;

        if (this.quizIndex >= this.quizData.length) {
            container.innerHTML =
                '<h3>Selesai!</h3>' +
                '<p>Skor Anda: ' + this.quizScore + ' / ' + this.quizData.length + '</p>' +
                '<button class="calculate-btn" onclick="BitcoinTools.restartQuiz()">Ulangi Quiz</button>';
            return;
        }

        const current = this.quizData[this.quizIndex];
        let optionsHTML = "";
        current.options.forEach((opt, i) => {
            optionsHTML += '<button class="tool-btn quiz-option" onclick="BitcoinTools.answerQuiz(' + i + ')">' + opt + '</button>';
        });

        container.innerHTML =
            '<p style="color:#888;font-size:13px;">Soal ' + (this.quizIndex + 1) + ' dari ' + this.quizData.length + '</p>' +
            '<h3 style="margin-bottom:20px;">' + current.q + '</h3>' +
            optionsHTML;
    },

    answerQuiz(selectedIndex) {
        const current = this.quizData[this.quizIndex];
        if (selectedIndex === current.answer) {
            this.quizScore++;
            alert("Benar!");
        } else {
            alert("Kurang tepat. Jawaban yang benar: " + current.options[current.answer]);
        }
        this.quizIndex++;
        this.renderQuiz();
    },

    restartQuiz() {
        this.quizIndex = 0;
        this.quizScore = 0;
        this.renderQuiz();
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
