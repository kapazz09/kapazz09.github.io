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

    // Deteksi tipe alamat dari prefix (dihitung di client, tanpa API)
    detectAddressType(address) {
        if (address.indexOf("bc1p") === 0) return "Taproot";
        if (address.indexOf("bc1q") === 0) return "Native SegWit";
        if (address.charAt(0) === "3") return "Nested SegWit";
        if (address.charAt(0) === "1") return "Legacy";
        return "Tidak diketahui";
    },

    formatWalletDate(unixSeconds) {
        return new Date(unixSeconds * 1000).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    },

    // Ambil MAKSIMAL 2 halaman transaksi (<=100 tx terbaru) -- sengaja tidak looping
    // tanpa batas supaya alamat dengan riwayat sangat panjang tidak membebani API.
    // Last Activity selalu akurat (tx terbaru ada di halaman 1). First Seen akurat
    // hanya kalau seluruh riwayat muat di halaman yang diambil; kalau tidak -> perkiraan.
    async fetchWalletHistory(address, txCount) {
        const page1 = await fetch("https://mempool.space/api/address/" + address + "/txs").then(r => {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
        });
        let all = page1;
        let truncated = txCount > page1.length;

        if (truncated && page1.length > 0) {
            try {
                const lastTxid = page1[page1.length - 1].txid;
                const page2 = await fetch("https://mempool.space/api/address/" + address + "/txs/chain/" + lastTxid).then(r => {
                    if (!r.ok) throw new Error("HTTP " + r.status);
                    return r.json();
                });
                all = all.concat(page2);
                truncated = txCount > all.length;
            } catch (e) {
                // halaman 2 gagal -> pakai halaman 1 saja, First Seen jadi perkiraan
            }
        }

        const confirmed = all.filter(tx => tx.status && tx.status.confirmed && tx.status.block_time);
        return {
            lastActivity: confirmed.length ? confirmed[0].status.block_time : null,
            oldest: confirmed.length ? confirmed[confirmed.length - 1].status.block_time : null,
            isApprox: truncated
        };
    },

    renderWalletUtxoList(utxos, address) {
        const listEl = document.getElementById("walletUtxoList");
        const moreBtn = document.getElementById("walletUtxoShowMoreBtn");
        const details = document.getElementById("walletUtxoDetails");
        if (!listEl || !details) return;

        if (!utxos.length) {
            details.style.display = "none";
            return;
        }

        const sorted = utxos.slice().sort((a, b) => b.value - a.value);
        const LIMIT = 10;
        let expanded = false;

        const draw = () => {
            const shown = expanded ? sorted : sorted.slice(0, LIMIT);
            listEl.innerHTML = shown.map(u =>
                '<a class="wallet-utxo-item" href="https://mempool.space/tx/' + encodeURIComponent(u.txid) +
                '" target="_blank" rel="noopener">' +
                '<span class="wallet-utxo-value">' + (u.value / 1e8).toFixed(8) + ' BTC</span>' +
                '<span class="wallet-utxo-meta">' + u.txid.slice(0, 8) + '\u2026 \u2197</span>' +
                '</a>'
            ).join("");
        };
        draw();

        if (sorted.length > LIMIT && moreBtn) {
            moreBtn.style.display = "block";
            moreBtn.textContent = "Lihat semua (" + sorted.length + ") \u2192";
            moreBtn.onclick = () => {
                expanded = !expanded;
                draw();
                moreBtn.textContent = expanded ? "Tampilkan lebih sedikit" : "Lihat semua (" + sorted.length + ") \u2192";
            };
        } else if (moreBtn) {
            moreBtn.style.display = "none";
        }

        details.style.display = "block";
    },

    loadWalletBalance() {
        const address = document.getElementById("walletAddressInput").value.trim();
        if (!address) {
            alert("Masukkan alamat Bitcoin terlebih dahulu.");
            return;
        }

        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        const setDisplay = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.style.display = value;
        };

        // Reset kondisi sisa pencarian sebelumnya
        setDisplay("walletFirstSeenRow", "");
        setDisplay("walletLastActivityRow", "");
        setDisplay("walletFallbackNote", "none");
        setDisplay("walletUtxoDetails", "none");

        const skeletonIds = ["walletBalance", "walletReceived", "walletSent", "walletTxCount", "walletUtxoCount",
            "walletAddressType", "walletFirstSeen", "walletLastActivity", "walletBalanceFiat"];
        skeletonIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = '<span class="skeleton-block short" style="height:12px;display:inline-block;"></span>';
            }
        });
        setDisplay("walletResult", "block");

        this.fetchWithFallback(
            "https://mempool.space/api/address/" + address,
            (data) => ({
                funded: data.chain_stats.funded_txo_sum,
                spent: data.chain_stats.spent_txo_sum,
                txCount: data.chain_stats.tx_count,
                source: "mempool"
            }),
            "https://blockchain.info/rawaddr/" + address + "?cors=true",
            (data) => ({
                funded: data.total_received,
                spent: data.total_sent,
                txCount: data.n_tx,
                source: "blockchain"
            })
        )
            .then(addressData => {
                const funded = addressData.funded;
                const spent = addressData.spent;
                const balanceBTC = (funded - spent) / 1e8;
                const isMempool = addressData.source === "mempool";

                setText("walletBalance", balanceBTC.toFixed(8) + " BTC");
                setText("walletReceived", (funded / 1e8).toFixed(8) + " BTC");
                setText("walletSent", (spent / 1e8).toFixed(8) + " BTC");
                setText("walletTxCount", addressData.txCount.toLocaleString("en-US"));
                setText("walletAddressType", this.detectAddressType(address));

                const mempoolLink = document.getElementById("walletMempoolLink");
                if (mempoolLink) mempoolLink.href = "https://mempool.space/address/" + encodeURIComponent(address);

                if (this.btcPrice) {
                    const usdValue = balanceBTC * this.btcPrice;
                    const idrValue = this.exchangeRate ? usdValue * this.exchangeRate : null;
                    setText("walletBalanceFiat",
                        "$" + usdValue.toLocaleString("en-US", { maximumFractionDigits: 2 }) +
                        (idrValue !== null ? " / Rp" + Math.round(idrValue).toLocaleString("id-ID") : ""));
                } else {
                    setText("walletBalanceFiat", "Buka DCA Calculator agar harga live termuat");
                }

                setDisplay("walletResult", "block");

                if (!isMempool) {
                    // MODE FALLBACK (blockchain.com): detail lanjutan hanya tersedia dari mempool.space
                    setDisplay("walletFirstSeenRow", "none");
                    setDisplay("walletLastActivityRow", "none");
                    setDisplay("walletFallbackNote", "block");

                    setText("walletUtxoCount", "Memuat...");
                    fetch("https://blockchain.info/unspent?active=" + address + "&cors=true")
                        .then(r => {
                            if (!r.ok) throw new Error("HTTP " + r.status);
                            return r.json();
                        })
                        .then(data => setText("walletUtxoCount", (data.unspent_outputs || []).length.toLocaleString("en-US")))
                        .catch(() => setText("walletUtxoCount", "Tidak dapat dimuat"));
                    return;
                }

                // MODE LENGKAP (mempool.space): 1x panggil /utxo dipakai untuk jumlah SEKALIGUS rincian
                setText("walletUtxoCount", "Memuat...");
                fetch("https://mempool.space/api/address/" + address + "/utxo")
                    .then(r => {
                        if (!r.ok) throw new Error("HTTP " + r.status);
                        return r.json();
                    })
                    .then(utxos => {
                        setText("walletUtxoCount", utxos.length.toLocaleString("en-US"));
                        this.renderWalletUtxoList(utxos, address);
                    })
                    .catch(() => {
                        setText("walletUtxoCount", "Tidak dapat dimuat (alamat terlalu aktif)");
                    });

                this.fetchWalletHistory(address, addressData.txCount)
                    .then(h => {
                        setText("walletLastActivity", h.lastActivity ? this.formatWalletDate(h.lastActivity) : "Belum ada transaksi terkonfirmasi");
                        if (!h.oldest) {
                            setText("walletFirstSeen", "Belum ada transaksi terkonfirmasi");
                        } else if (h.isApprox) {
                            setText("walletFirstSeen", "Sebelum " + this.formatWalletDate(h.oldest) + " (riwayat panjang)");
                        } else {
                            setText("walletFirstSeen", this.formatWalletDate(h.oldest));
                        }
                    })
                    .catch(() => {
                        setText("walletLastActivity", "Tidak dapat dimuat");
                        setText("walletFirstSeen", "Tidak dapat dimuat");
                    });
            })
            .catch(() => {
                setDisplay("walletResult", "none");
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
