/*==================================================
    BITCOIN TOOLKIT - UTXO & FEE CALCULATOR
==================================================*/

Object.assign(BitcoinTools, {
    bindUtxoEvents() {
        const loadFeeRateBtn = document.getElementById("loadFeeRateBtn");
        if (loadFeeRateBtn) loadFeeRateBtn.addEventListener("click", () => this.loadFeeRate());

        const utxoCalcBtn = document.getElementById("utxoCalcBtn");
        if (utxoCalcBtn) utxoCalcBtn.addEventListener("click", () => this.calculateUTXO());
    },

    //------------------------------------------------
    // UTXO & FEE CALCULATOR
    //------------------------------------------------

    loadFeeRate() {
        const info = document.getElementById("feeRateInfo");
        if (info) info.innerHTML = '<span class="skeleton-block short" style="height:10px;"></span>';

        fetch("https://mempool.space/api/v1/fees/recommended")
            .then(res => res.json())
            .then(data => {
                this.utxoFeeTiers = data; // simpan semua tier (fastestFee, halfHourFee, dst) untuk perbandingan di box insight
                const feeInput = document.getElementById("utxoFeeRate");
                if (feeInput) feeInput.value = data.halfHourFee;
                if (info) info.textContent = "Fee rate saat ini: " + data.halfHourFee + " sat/vB (dimuat otomatis)";
            })
            .catch(() => {
                if (info) info.textContent = "Gagal memuat fee rate. Silakan isi manual.";
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
        const feeIdr = (feeUsd !== null && this.exchangeRate) ? feeUsd * this.exchangeRate : null;

        document.getElementById("utxoSize").textContent = vBytes.toFixed(1) + " vBytes";
        document.getElementById("utxoFeeSat").textContent = Math.round(feeSats) + " sat";
        document.getElementById("utxoFeeUsd").textContent = feeUsd !== null
            ? "$" + feeUsd.toFixed(4) + (feeIdr !== null ? " / Rp" + Math.round(feeIdr).toLocaleString("id-ID") : "")
            : "Refresh price dulu di DCA Calculator";

        this.renderUtxoInsight(inputs, outputs, feeRate, vBytes, feeSats);

        document.getElementById("utxoResult").style.display = "block";
    },

    // Box "Apa Artinya Ini?" -- kalimat perbandingan tier "Cepat" hanya muncul
    // kalau data tier sudah dimuat DAN fee rate user lebih rendah dari tier itu.
    renderUtxoInsight(inputs, outputs, feeRate, vBytes, feeSats) {
        const box = document.getElementById("utxoInsight");
        if (!box) return;

        let html =
            '<h4>\u{1F4A1} Apa Artinya Ini?</h4>' +
            '<p>Artinya: transaksi dengan <strong>' + inputs + ' input</strong> dan <strong>' + outputs +
            ' output</strong> ini membutuhkan sekitar <strong>' + Math.round(feeSats).toLocaleString("en-US") +
            ' satoshi</strong> untuk dikirim di fee rate <strong>' + feeRate + ' sat/vB</strong> saat ini.</p>';

        const fastest = this.utxoFeeTiers && Number(this.utxoFeeTiers.fastestFee);
        if (fastest && fastest > feeRate) {
            const multiple = Math.round((fastest / feeRate) * 10) / 10;
            const feeAtFastest = Math.round(vBytes * fastest);
            html +=
                '<p>Kalau kamu pilih tingkat fee \'Cepat\' saat ini (' + fastest + ' sat/vB), biaya yang sama bisa ' +
                'jadi sekitar <strong>' + multiple + 'x</strong> lebih mahal (~' +
                feeAtFastest.toLocaleString("en-US") + ' sats).</p>';
        }

        box.innerHTML = html;
    }
});
