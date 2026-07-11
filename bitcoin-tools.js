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
        { q: "Siapa nama yang digunakan sebagai pencipta Bitcoin?", options: ["Vitalik Buterin", "Craig Wright", "Satoshi Nakamoto", "Hal Finney"], answer: 2 },
        { q: "Whitepaper Bitcoin pertama kali dipublikasikan pada tahun?", options: ["2005", "2008", "2010", "2013"], answer: 1 },
        { q: "Apa judul asli whitepaper Bitcoin?", options: ["Digital Gold: The Bitcoin Whitepaper", "Bitcoin: The Future of Digital Money", "Blockchain: A Decentralized Ledger System", "Bitcoin: A Peer-to-Peer Electronic Cash System"], answer: 3 },
        { q: "Blok pertama Bitcoin (genesis block) ditambang pada tahun?", options: ["2007", "2008", "2009", "2011"], answer: 2 },
        { q: "Masalah utama apa yang ingin dipecahkan oleh Bitcoin?", options: ["Lambatnya koneksi internet global", "Double-spending (pengeluaran ganda) tanpa perlu pihak ketiga tepercaya", "Kurangnya aplikasi mobile banking", "Mahalnya biaya kertas untuk mencetak uang"], answer: 1 },
        { q: "Bitcoin paling tepat digambarkan sebagai?", options: ["Mata uang digital resmi yang diterbitkan pemerintah", "Saham perusahaan teknologi", "Mata uang digital terdesentralisasi tanpa otoritas pusat", "Stablecoin yang nilainya dipatok ke dolar AS"], answer: 2 },
        { q: "Berapa jumlah maksimum suplai Bitcoin yang akan pernah ada?", options: ["1 miliar", "100 juta", "21 juta", "Tidak terbatas"], answer: 2 },
        { q: "Kemunculan Bitcoin erat kaitannya dengan peristiwa global apa?", options: ["Pandemi COVID-19", "Perang Dunia II", "Gelembung dot-com akhir 1990-an", "Krisis keuangan global 2008"], answer: 3 },
        { q: "Prinsip utama self-custody adalah?", options: ["Menyimpan Bitcoin di exchange besar agar lebih aman", "Selalu menggunakan wallet custodial untuk kemudahan", "Kamu sendiri yang memegang private key, bukan pihak ketiga", "Membagikan seed phrase ke banyak orang agar tidak hilang"], answer: 2 },
        { q: "Wallet air-gapped berkomunikasi dengan HP/komputer lewat apa?", options: ["QR code", "Bluetooth", "Kabel USB", "WiFi"], answer: 0 },
        { q: "Apa fungsi utama BIP39 passphrase (\"kata ke-25\")?", options: ["Mempercepat proses transaksi", "Membuat wallet tersembunyi yang berbeda dari seed phrase yang sama", "Mengganti seed phrase secara otomatis", "Menurunkan biaya fee transaksi"], answer: 1 },
        { q: "Kenapa metal seed backup lebih disarankan dibanding kertas?", options: ["Lebih murah harganya", "Lebih mudah difoto untuk disimpan digital", "Tahan api, air, dan tidak lapuk dimakan waktu", "Bisa dipakai sebagai kartu identitas"], answer: 2 },
        { q: "Berapa jumlah lokasi backup seed phrase yang disarankan dalam materi ini?", options: ["1 lokasi", "2 lokasi", "3 lokasi terpisah", "5 lokasi"], answer: 2 },
        { q: "Risiko utama menyimpan passphrase hanya di kepala (tanpa catatan fisik)?", options: ["Passphrase bisa dicuri lewat internet", "Dana hilang permanen kalau passphrase terlupa", "Wallet akan otomatis terkunci setelah 1 tahun", "Tidak ada risiko sama sekali"], answer: 1 },
        { q: "UTXO adalah singkatan dari?", options: ["Unspent Transaction Output", "Universal Transaction Order", "Unified Transfer Exchange Option", "Unique Transaction Origin"], answer: 0 },
        { q: "Konsolidasi UTXO sebaiknya dilakukan pada kondisi jaringan seperti apa?", options: ["Saat jaringan sedang ramai (fee tinggi)", "Saat fee rate sedang rendah (jaringan sepi)", "Kapan saja, tidak berpengaruh", "Hanya saat harga Bitcoin naik"], answer: 1 },
        { q: "Rumus dasar fee transaksi Bitcoin adalah?", options: ["Jumlah BTC yang dikirim x harga pasar", "Ukuran transaksi (vBytes) x fee rate (sat/vByte)", "Jumlah alamat penerima x 2", "Waktu transaksi dikirim x kecepatan internet"], answer: 1 },
        { q: "Alamat Bitcoin yang diawali \"bc1q\" disebut?", options: ["Legacy (P2PKH)", "Nested SegWit", "Native SegWit", "Taproot"], answer: 2 },
        { q: "Kenapa Native SegWit direkomendasikan untuk pemakaian sehari-hari saat ini?", options: ["Karena satu-satunya format yang didukung Bitcoin", "Karena hanya bisa dipakai exchange besar", "Karena tidak dikenakan fee sama sekali", "Karena efisien dan kompatibilitasnya paling luas saat ini"], answer: 3 },
        { q: "Fee rate (sat/vByte) pada dasarnya ditentukan oleh?", options: ["Kepadatan mempool (jaringan sepi/ramai)", "Jenis alamat yang dipakai", "Jumlah Bitcoin yang dimiliki pengirim", "Lokasi geografis pengirim"], answer: 0 },
        { q: "Perbedaan mendasar antara privasi dan keamanan dalam konteks Bitcoin?", options: ["Privasi soal siapa yang tahu aktivitasmu; keamanan soal siapa yang bisa mengakses dananya", "Keduanya adalah hal yang persis sama", "Privasi hanya berlaku untuk exchange, keamanan untuk wallet", "Privasi soal harga Bitcoin, keamanan soal kecepatan transaksi"], answer: 0 },
        { q: "Risiko utama dari address reuse (memakai alamat yang sama berulang kali)?", options: ["Fee transaksi otomatis lebih mahal", "Semua transaksi jadi mudah dikaitkan menjadi satu profil aktivitas", "Wallet akan otomatis terkunci", "Alamat tersebut akan kadaluarsa"], answer: 1 },
        { q: "CoinJoin adalah teknik yang bekerja dengan cara?", options: ["Menyimpan Bitcoin di banyak exchange sekaligus", "Menukar Bitcoin dengan mata uang lain secara otomatis", "Menggabungkan input dari beberapa pengguna dalam satu transaksi", "Mengenkripsi seed phrase dengan kata sandi tambahan"], answer: 2 },
        { q: "Apa risiko praktis yang perlu diketahui sebelum memakai CoinJoin?", options: ["Tidak ada risiko sama sekali", "CoinJoin hanya bisa dipakai satu kali seumur hidup", "CoinJoin akan menghapus seluruh riwayat transaksi", "Dana yang pernah di-mix bisa ditandai atau dibekukan sementara oleh sebagian exchange"], answer: 3 },
        { q: "Kenapa penting untuk tidak sembarangan mengklik link di perangkat yang dipakai untuk wallet?", options: ["Supaya kuota internet tidak boros", "Untuk mencegah malware/phishing mencuri akses ke wallet atau seed phrase", "Karena link akan otomatis membeli Bitcoin", "Karena akan mengubah alamat wallet secara otomatis"], answer: 1 },
        { q: "Kenapa disarankan memisahkan perangkat untuk wallet dari perangkat untuk browsing bebas?", options: ["Untuk mengurangi risiko malware dari kebiasaan sehari-hari menjangkau", "wallet Supaya baterai HP lebih awet", "Karena wallet tidak bisa dipasang di HP yang sama dengan aplikasi lain", "Supaya bisa dipakai dua orang sekaligus"], answer: 0 },
        { q: "Whitepaper Lightning Network ditulis oleh Joseph Poon dan Thaddeus Dryja pada tahun?", options: ["2012", "2015", "2018", "2021"], answer: 1 },
        { q: "Kenapa Lightning Network disebut \"Layer 2\"?", options: ["Karena beroperasi di atas (di lapisan tambahan) Bitcoin mainnet", "Karena hanya bisa dipakai lapisan kedua masyarakat", "Karena butuh dua wallet sekaligus", "Karena hanya mendukung dua jenis koin"], answer: 0 },
        { q: "Bagian mana dari siklus channel Lightning yang tercatat di blockchain utama (on-chain)?", options: ["Semua transaksi di dalam channel", "Tidak ada sama sekali yang tercatat on-chain", "Hanya saat channel dibuka dan ditutup", "Hanya transaksi di atas 1 BTC"], answer: 2 },
        { q: "Kode invoice pembayaran Lightning umumnya diawali dengan?", options: ["bc1q", "lnbc", "0x", "3"], answer: 1 },
        { q: "Yang mana dari berikut ini adalah contoh wallet Lightning custodial?", options: ["Phoenix", "Breez", "Zeus", "Wallet of Satoshi"], answer: 3 },
        { q: "Apa keunggulan utama Lightning Network dibanding transaksi on-chain biasa?", options: ["Lebih aman dari serangan kuantum", "Mendukung lebih banyak jenis koin", "Fee mendekati nol dan kecepatan transaksi instan", "Tidak membutuhkan wallet sama sekali"], answer: 2 },
        { q: "BIP adalah singkatan dari?", options: ["Bitcoin Investment Plan", "Blockchain Integration Protocol", "Bitcoin Improvement Proposal", "Bitcoin Internal Policy"], answer: 2 },
        { q: "BIP 16 memungkinkan fitur apa di Bitcoin?", options: ["Segregated Witness (SegWit)", "Pay-to-Script-Hash (P2SH), termasuk alamat multisig", "Taproot", "Lightning Network"], answer: 1 },
        { q: "BIP 32, 39, dan 44 secara bersama membentuk standar untuk?", options: ["HD Wallet (satu seed phrase menghasilkan banyak alamat)", "Mining pool", "Format alamat Bech32", "Timelock transaksi"], answer: 0 },
        { q: "BIP 141 mengacu pada fitur apa?", options: ["Taproot", "BIP360", "Lightning Network", "Segregated Witness (SegWit)"], answer: 3 },
        { q: "BIP 340, 341, dan 342 memperkenalkan fitur apa?", options: ["Schnorr Signature dan Taproot", "Format alamat Legacy", "Sistem mining pool PPLNS", "Protokol Stratum V2"], answer: 0 },
        { q: "BIP360 diajukan untuk mengantisipasi ancaman apa di masa depan?", options: ["Serangan phishing", "Komputer kuantum yang berpotensi membalikkan private key dari kunci publik yang terekspos", "Kenaikan fee transaksi", "Kepadatan mempool yang berlebihan"], answer: 1 },
        { q: "Proses mencari nonce yang menghasilkan hash valid dalam mining disebut mekanisme?", options: ["Proof-of-Stake", "Proof-of-Work", "Proof-of-Authority", "Proof-of-Capacity"], answer: 1 },
        { q: "Berapa reward per blok saat Bitcoin pertama kali diluncurkan (2009)?", options: ["6.25 BTC", "12.5 BTC", "25 BTC", "50 BTC"], answer: 3 },
        { q: "Kenapa solo mining sangat sulit dilakukan operasi kecil saat ini?", options: ["Karena dilarang secara hukum di semua negara", "Karena hanya satu orang yang boleh mining per hari", "Karena tingkat kesulitan jaringan sudah sangat tinggi", "Karena solo mining sudah dihapus dari protokol Bitcoin"], answer: 2 },
        { q: "Dalam model pembayaran mining pool, apa arti PPLNS?", options: ["Pay Per Last N Shares", "Pay Per Live Node Server", "Profit Per Long-term Node Sharing", "Payout Per Late Network Submission"], answer: 0 },
        { q: "Alat mining yang paling efisien dan dipakai luas saat ini adalah?", options: ["CPU", "GPU", "FPGA", "ASIC"], answer: 3 },
        { q: "Perbedaan utama Stratum V2 dibanding V1?", options: ["V2 tidak membutuhkan listrik sama sekali", "V2 memungkinkan miner individu menyusun sendiri isi calon blok", "V2 menghapus konsep mining pool sepenuhnya", "V2 hanya bisa dipakai di luar negeri"], answer: 1 },
        { q: "SOPR (Spent Output Profit Ratio) digunakan untuk mengukur?", options: ["Kecepatan transaksi jaringan", "Rasio rata-rata untung/rugi koin yang sedang dibelanjakan", "Jumlah node aktif di jaringan", "Tingkat kesulitan mining"], answer: 1 },
        { q: "MVRV (Market Value to Realized Value) membandingkan apa?", options: ["Nilai pasar saat ini dengan nilai realized (harga rata-rata saat koin terakhir berpindah)", "Harga Bitcoin dengan harga emas", "Jumlah transaksi hari ini dengan kemarin", "Kapasitas blok dengan jumlah transaksi"], answer: 0 },
        { q: "Metrik Dormancy / Coin Days Destroyed (CDD) menyoroti perilaku?", options: ["Miner yang baru bergabung", "Pemegang jangka panjang yang koinnya lama tidak bergerak lalu tiba-tiba dipindahkan", "Kecepatan konfirmasi blok", "Jumlah alamat baru yang dibuat setiap hari"], answer: 1 },
        { q: "Kenapa pergerakan dana whale ke/dari exchange harus dibaca hati-hati?", options: ["Karena datanya selalu salah", "Karena whale tidak pernah memindahkan dana", "Karena wallet besar bisa juga milik custodian/institusi, bukan pasti niat jual/beli", "Karena exchange tidak menerima dana besar"], answer: 2 },
        { q: "Dalam konteks on-chain analysis, hash rate dan tingkat kesulitan berfungsi sebagai indikator?", options: ["Sentimen media sosial", "Harga Bitcoin di masa depan secara pasti", "Jumlah pengguna baru", "Kesehatan dan keamanan jaringan"], answer: 3 },
        { q: "Secara umum, on-chain analysis memanfaatkan sifat blockchain yang?", options: ["Tertutup dan hanya bisa diakses exchange", "Terenkripsi penuh dan tidak bisa dianalisis", "Transparan, sehingga semua transaksi bisa dipelajari siapa saja", "Hanya bisa diakses oleh miner"], answer: 2 }
    ],
    quizIndex: 0,
    quizScore: 0,
    quizPlaying: [],
    quizQuestionCount: 15,

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

    startQuiz() {
        // Acak urutan seluruh 50 soal, lalu ambil 15 soal pertama untuk sesi ini
        const shuffled = [...this.quizData].sort(() => Math.random() - 0.5);
        this.quizPlaying = shuffled.slice(0, this.quizQuestionCount);
        this.quizIndex = 0;
        this.quizScore = 0;
        this.renderQuiz();
    },

    renderQuiz() {
        const container = document.getElementById("quizContainer");
        if (!container) return;

        // Kalau belum ada sesi berjalan, tampilkan tombol mulai
        if (this.quizPlaying.length === 0) {
            container.innerHTML =
                '<p style="color:#888;">Kuis berisi ' + this.quizQuestionCount + ' soal acak dari total 50 soal materi Bitcoin.</p>' +
                '<button class="calculate-btn" onclick="BitcoinTools.startQuiz()">Mulai Quiz</button>';
            return;
        }

        if (this.quizIndex >= this.quizPlaying.length) {
            const total = this.quizPlaying.length;
            const percent = (this.quizScore / total) * 100;
            const resultMsg = percent >= 70
                ? "Solid! Anda paham dasar-dasar Bitcoin dengan baik 🔥"
                : "Kembali Mempelajari Materi yang ada agar menjadi Bitcoiner";

            container.innerHTML =
                '<h3>Selesai!</h3>' +
                '<p>Skor Anda: ' + this.quizScore + ' / ' + total + ' (' + percent.toFixed(0) + '%)</p>' +
                '<p style="font-weight:700;margin-top:10px;">' + resultMsg + '</p>' +
                '<button class="calculate-btn" onclick="BitcoinTools.startQuiz()">Main Lagi</button>';
            return;
        }

        const current = this.quizPlaying[this.quizIndex];
        let optionsHTML = "";
        current.options.forEach((opt, i) => {
            optionsHTML += '<button class="tool-btn quiz-option" onclick="BitcoinTools.answerQuiz(' + i + ')">' + opt + '</button>';
        });

        container.innerHTML =
            '<p style="color:#888;font-size:13px;">Soal ' + (this.quizIndex + 1) + ' dari ' + this.quizPlaying.length + '</p>' +
            '<h3 style="margin-bottom:20px;">' + current.q + '</h3>' +
            optionsHTML;
    },

    answerQuiz(selectedIndex) {
        const current = this.quizPlaying[this.quizIndex];
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
        this.startQuiz();
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
