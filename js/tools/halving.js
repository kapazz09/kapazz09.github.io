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
        fetch("https://mempool.space/api/blocks/tip/height")
            .then(res => res.json())
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
    }
});
