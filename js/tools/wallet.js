/*==================================================
    BITCOIN TOOLKIT - WALLET BALANCE CHECKER
==================================================*/

Object.assign(BitcoinTools, {
    bindWalletEvents() {
        const walletCheckBtn = document.getElementById("walletCheckBtn");
        if (walletCheckBtn) walletCheckBtn.addEventListener("click", () => this.loadWalletBalance());

        const walletScanBtn = document.getElementById("walletScanBtn");
        if (walletScanBtn) walletScanBtn.addEventListener("click", () => this.startWalletScan());

        const walletScanCloseBtn = document.getElementById("walletScanCloseBtn");
        if (walletScanCloseBtn) walletScanCloseBtn.addEventListener("click", () => this.stopWalletScan());

        const walletScanUploadBtn = document.getElementById("walletScanUploadBtn");
        const walletScanFileInput = document.getElementById("walletScanFileInput");
        if (walletScanUploadBtn && walletScanFileInput) {
            walletScanUploadBtn.addEventListener("click", () => walletScanFileInput.click());
            walletScanFileInput.addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (file) this.scanWalletQrFromFile(file);
                walletScanFileInput.value = "";
            });
        }
    },

    //------------------------------------------------
    // WALLET BALANCE CHECKER
    //------------------------------------------------

    loadWalletBalance() {
        const address = document.getElementById("walletAddressInput").value.trim();
        if (!address) {
            alert("Masukkan alamat Bitcoin terlebih dahulu.");
            return;
        }

        const skeletonIds = ["walletBalance", "walletReceived", "walletTxCount", "walletUtxoCount", "walletBalanceFiat"];
        skeletonIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = '<span class="skeleton-block short" style="height:12px;display:inline-block;"></span>';
            }
        });
        const resultCardEarly = document.getElementById("walletResult");
        if (resultCardEarly) resultCardEarly.style.display = "block";

        fetch("https://mempool.space/api/address/" + address)
            .then(res => {
                if (!res.ok) throw new Error("not found");
                return res.json();
            })
            .then(addressData => {
                const funded = addressData.chain_stats.funded_txo_sum;
                const spent = addressData.chain_stats.spent_txo_sum;
                const balance = funded - spent;
                const txCount = addressData.chain_stats.tx_count;
                const balanceBTC = balance / 1e8;

                const setText = (id, text) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = text;
                };

                setText("walletBalance", balanceBTC.toFixed(8) + " BTC");
                setText("walletReceived", (funded / 1e8).toFixed(8) + " BTC");
                setText("walletTxCount", txCount.toLocaleString("en-US"));

                if (this.btcPrice) {
                    const usdValue = balanceBTC * this.btcPrice;
                    const idrValue = this.exchangeRate ? usdValue * this.exchangeRate : null;
                    setText("walletBalanceFiat",
                        "$" + usdValue.toLocaleString("en-US", { maximumFractionDigits: 2 }) +
                        (idrValue !== null ? " / Rp" + Math.round(idrValue).toLocaleString("id-ID") : ""));
                } else {
                    setText("walletBalanceFiat", "Buka DCA Calculator agar harga live termuat");
                }

                const resultCard = document.getElementById("walletResult");
                if (resultCard) resultCard.style.display = "block";

                setText("walletUtxoCount", "Memuat...");
                fetch("https://mempool.space/api/address/" + address + "/utxo")
                    .then(res => {
                        if (!res.ok) throw new Error("utxo fetch failed");
                        return res.json();
                    })
                    .then(utxoData => {
                        setText("walletUtxoCount", utxoData.length.toLocaleString("en-US"));
                    })
                    .catch(() => {
                        setText("walletUtxoCount", "Tidak dapat dimuat (alamat terlalu aktif)");
                    });
            })
            .catch(() => {
                const resultCard = document.getElementById("walletResult");
                if (resultCard) resultCard.style.display = "none";
                alert("Alamat tidak ditemukan atau gagal memuat data. Pastikan alamat valid.");
            });
    },

    //------------------------------------------------
    // SCAN QR ALAMAT BITCOIN (kamera)
    //------------------------------------------------

    startWalletScan() {
        if (typeof Html5Qrcode === "undefined") {
            alert("Fitur scan QR belum siap dimuat. Coba refresh halaman.");
            return;
        }

        const readerDiv = document.getElementById("qrReaderWallet");
        const controls = document.getElementById("walletScanControls");
        if (readerDiv) readerDiv.style.display = "block";
        if (controls) controls.style.display = "flex";

        // Beri jeda sebentar supaya browser selesai menghitung layout div
        // sebelum Html5Qrcode mulai mengukur dimensi kontainer (mencegah
        // area scan salah ukuran walau video kamera sudah terlihat normal).
        setTimeout(() => {
            this.html5QrCode = new Html5Qrcode("qrReaderWallet");
            this.html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                        const size = Math.floor(minEdge * 0.7);
                        return { width: size, height: size };
                    }
                },
                (decodedText) => {
                    let address = decodedText.trim();
                    if (address.toLowerCase().indexOf("bitcoin:") === 0) {
                        address = address.substring(8).split("?")[0];
                    }
                    const input = document.getElementById("walletAddressInput");
                    if (input) input.value = address;
                    this.stopWalletScan();
                },
                () => {
                    // diabaikan — normal terjadi berkali-kali selagi kamera mencari QR code
                }
            ).catch(() => {
                // Kamera gagal dibuka (izin ditolak, tidak ada kamera, dsb) — sembunyikan
                // area kamera yang kosong, tapi biarkan opsi "Upload dari Galeri" tetap terbuka.
                if (readerDiv) readerDiv.style.display = "none";
                console.warn("Kamera tidak tersedia, gunakan upload dari galeri.");
            });
        }, 150);
    },

    stopWalletScan() {
        const readerDiv = document.getElementById("qrReaderWallet");
        const controls = document.getElementById("walletScanControls");
        if (this.html5QrCode && this.html5QrCode.isScanning) {
            this.html5QrCode.stop().then(() => {
                this.html5QrCode.clear();
                if (readerDiv) readerDiv.style.display = "none";
                if (controls) controls.style.display = "none";
            }).catch(() => { });
        } else {
            if (readerDiv) readerDiv.style.display = "none";
            if (controls) controls.style.display = "none";
        }
    },

    // Baca QR code dari gambar yang diupload user (galeri/file explorer),
    // sebagai alternatif kalau kamera tidak tersedia/tidak diizinkan.
    scanWalletQrFromFile(file) {
        if (typeof Html5Qrcode === "undefined") {
            alert("Fitur scan QR belum siap dimuat. Coba refresh halaman.");
            return;
        }

        const proceedWithScan = () => {
            if (!this.html5QrCode) {
                this.html5QrCode = new Html5Qrcode("qrReaderWallet");
            }
            this.html5QrCode.scanFile(file, false)
                .then(decodedText => {
                    let address = decodedText.trim();
                    if (address.toLowerCase().indexOf("bitcoin:") === 0) {
                        address = address.substring(8).split("?")[0];
                    }
                    const input = document.getElementById("walletAddressInput");
                    if (input) input.value = address;
                })
                .catch(() => {
                    alert("Tidak bisa membaca QR code dari gambar itu. Coba gambar lain atau masukkan alamat manual.");
                });
        };

        // Kalau kamera sedang aktif, hentikan dulu supaya tidak bentrok
        // sebelum memproses file yang diupload.
        if (this.html5QrCode && this.html5QrCode.isScanning) {
            this.html5QrCode.stop().then(() => {
                this.html5QrCode.clear();
                proceedWithScan();
            }).catch(() => proceedWithScan());
        } else {
            proceedWithScan();
        }
    }
});
