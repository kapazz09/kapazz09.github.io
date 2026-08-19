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

        document.getElementById("channelResult").style.display = "block";
    }
});
