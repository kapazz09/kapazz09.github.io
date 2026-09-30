/*==================================================
    BITCOIN TOOLKIT - LIGHTNING CHANNEL CAPACITY
==================================================*/

Object.assign(BitcoinTools, {
    bindChannelEvents() {
        const channelCalcBtn = document.getElementById("channelCalcBtn");
        if (channelCalcBtn) channelCalcBtn.addEventListener("click", () => this.calculateChannelCapacity());
    },

    //------------------------------------------------
    // CHANNEL CAPACITY CALCULATOR (Lightning)
    //------------------------------------------------

    calculateChannelCapacity() {
        const total = parseFloat(document.getElementById("channelTotal").value);
        const local = parseFloat(document.getElementById("channelLocal").value);

        if (!total || total <= 0 || isNaN(local) || local < 0 || local > total) {
            alert("Pastikan Local Balance tidak melebihi Total Kapasitas, dan kedua angka valid.");
            return;
        }

        const remote = total - local;
        const localPercent = (local / total) * 100;

        const barLocal = document.getElementById("channelBarLocal");
        const barRemote = document.getElementById("channelBarRemote");
        if (barLocal) barLocal.style.width = localPercent + "%";
        if (barRemote) barRemote.style.width = (100 - localPercent) + "%";

        document.getElementById("channelOutbound").textContent = local.toLocaleString("en-US") + " sat";
        document.getElementById("channelInbound").textContent = remote.toLocaleString("en-US") + " sat";

        this.renderChannelInsight(total);

        document.getElementById("channelResult").style.display = "block";
    },

    // Box "Apa Artinya Ini?" -- otomatis diperbarui tiap hasil dihitung ulang.
    renderChannelInsight(totalSat) {
        const box = document.getElementById("channelInsight");
        if (!box) return;

        const btcText = parseFloat((totalSat / 1e8).toFixed(8)).toString();

        box.innerHTML =
            '<h4>\u{1F4A1} Apa Artinya Ini?</h4>' +
            '<p>Artinya: channel Lightning dengan kapasitas <strong>' + btcText + ' BTC</strong> ' +
            '(' + totalSat.toLocaleString("en-US") + ' sat) ini adalah jumlah dana yang dikunci di awal ' +
            '(lewat 1 transaksi on-chain) supaya kedua pihak bisa saling kirim Bitcoin berkali-kali secara ' +
            'instan tanpa menyentuh blockchain lagi, sampai channel ini ditutup. Ini BUKAN batas transaksi \u2014 ' +
            'kamu bisa transaksi berkali-kali selama total nilainya tidak melebihi kapasitas ini.</p>' +
            '<a class="tool-insight-link" href="materi/lightning-network/index.html" target="_blank">' +
            '\u{1F517} Pelajari lebih lanjut soal Lightning Network di Materi #5 \u2192</a>';
    }
});
