/*==================================================
    BITCOIN TOOLKIT
    Version : 4.0
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
    html5QrCode: null,
    isConverting: false,
    historicalCache: {},

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

    glossaryData: [
        { term: "UTXO", def: "Unspent Transaction Output — sisa dana dari transaksi sebelumnya yang belum dibelanjakan." },
        { term: "Satoshi (sat)", def: "Satuan terkecil Bitcoin. 1 BTC = 100.000.000 satoshi." },
        { term: "Self-Custody", def: "Prinsip di mana pemilik Bitcoin memegang sendiri private key-nya, bukan dipegang pihak ketiga seperti exchange." },
        { term: "Seed Phrase", def: "Rangkaian 12-24 kata yang menjadi kunci utama untuk memulihkan akses ke wallet Bitcoin." },
        { term: "Cold Wallet", def: "Wallet yang tidak terhubung ke internet, dipakai untuk menyimpan Bitcoin secara aman jangka panjang." },
        { term: "Hot Wallet", def: "Wallet yang terhubung ke internet, biasanya dipakai untuk transaksi sehari-hari." },
        { term: "Private Key", def: "Kunci rahasia yang membuktikan kepemilikan atas Bitcoin di suatu alamat." },
        { term: "Public Key / Address", def: "Alamat yang bisa dibagikan ke orang lain untuk menerima Bitcoin." },
        { term: "Lightning Network", def: "Layer 2 di atas Bitcoin yang memungkinkan transaksi cepat dan murah lewat channel pembayaran." },
        { term: "Mempool", def: "Kumpulan transaksi yang sudah disiarkan tapi belum masuk ke dalam blok manapun." },
        { term: "Halving", def: "Peristiwa setiap sekitar 4 tahun di mana reward blok mining dipotong setengah." },
        { term: "Proof of Work", def: "Mekanisme konsensus Bitcoin yang mengharuskan miner memecahkan teka-teki komputasi untuk menambang blok." },
        { term: "Hash Rate", def: "Total daya komputasi yang dipakai untuk menambang dan mengamankan jaringan Bitcoin." },
        { term: "Node", def: "Komputer yang menyimpan salinan blockchain dan memvalidasi transaksi secara independen." },
        { term: "Fee Rate (sat/vB)", def: "Biaya yang dibayarkan per unit ukuran transaksi (vByte) agar transaksi diproses lebih cepat." },
        { term: "Address Reuse", def: "Praktik memakai alamat Bitcoin yang sama berulang kali, mengurangi privasi." },
        { term: "CoinJoin", def: "Teknik menggabungkan beberapa transaksi dari pengguna berbeda untuk meningkatkan privasi." },
        { term: "BIP", def: "Bitcoin Improvement Proposal — dokumen resmi usulan perubahan/penambahan pada protokol Bitcoin." },
        { term: "SegWit", def: "Segregated Witness — upgrade protokol yang memisahkan data tanda tangan dari data transaksi utama." },
        { term: "Taproot", def: "Upgrade Bitcoin yang meningkatkan privasi dan efisiensi smart contract sederhana di Bitcoin." },
        { term: "Inbound Liquidity", def: "Kapasitas channel Lightning untuk menerima pembayaran masuk." },
        { term: "Outbound Liquidity", def: "Kapasitas channel Lightning untuk mengirim pembayaran keluar." },
        { term: "DCA (Dollar Cost Averaging)", def: "Strategi investasi dengan membeli aset secara rutin dalam jumlah tetap, tanpa memedulikan harga naik/turun." },
        { term: "ASIC", def: "Application-Specific Integrated Circuit — perangkat keras khusus yang dirancang hanya untuk mining Bitcoin." },
        { term: "Genesis Block", def: "Blok pertama yang pernah ditambang dalam sejarah blockchain Bitcoin." },
        { term: "Blockchain", def: "Buku besar digital terdistribusi yang mencatat semua transaksi Bitcoin secara permanen dan transparan." },
        { term: "Decentralization", def: "Prinsip di mana tidak ada satu pihak pun yang mengontrol seluruh jaringan Bitcoin." },
        { term: "Full Node", def: "Komputer yang menyimpan seluruh riwayat blockchain dan memverifikasi setiap transaksi secara independen, tanpa bergantung pihak lain." },
        { term: "Pruned Node", def: "Full node yang menghapus data blok lama setelah diverifikasi, untuk menghemat ruang penyimpanan." },
        { term: "Multisig (Multi-signature)", def: "Alamat Bitcoin yang membutuhkan lebih dari satu kunci privat untuk mengotorisasi transaksi, meningkatkan keamanan." },
        { term: "Mining Pool", def: "Kelompok miner yang menggabungkan daya komputasi untuk memperbesar peluang mendapat reward, lalu dibagi sesuai kontribusi." },
        { term: "Difficulty Adjustment", def: "Penyesuaian otomatis tingkat kesulitan mining setiap ~2 minggu agar waktu antar blok tetap sekitar 10 menit." },
        { term: "Block Reward", def: "Bitcoin baru yang diberikan kepada miner sebagai imbalan berhasil menambang sebuah blok." },
        { term: "Consensus", def: "Mekanisme di mana seluruh node jaringan sepakat pada satu versi blockchain yang valid." },
        { term: "HODL", def: "Istilah slang komunitas crypto untuk menahan (tidak menjual) aset dalam jangka panjang, apapun kondisi pasar." },
        { term: "FOMO", def: "Fear of Missing Out — rasa takut ketinggalan, sering mendorong keputusan beli/jual impulsif saat harga bergerak cepat." },
        { term: "Stablecoin", def: "Cryptocurrency yang nilainya dipatok ke aset stabil seperti dolar AS, contohnya USDT dan USDC." },
        { term: "Altcoin", def: "Sebutan untuk semua cryptocurrency selain Bitcoin." },
        { term: "Custodial Wallet", def: "Wallet yang private key-nya dipegang pihak ketiga (misal exchange), bukan oleh pemilik aset sendiri." },
        { term: "Non-Custodial Wallet", def: "Wallet yang private key-nya sepenuhnya dikontrol oleh pemilik aset — inti dari prinsip self-custody." },
        { term: "Replace-By-Fee (RBF)", def: "Fitur yang memungkinkan transaksi belum terkonfirmasi diganti dengan versi fee lebih tinggi agar diproses lebih cepat." },
        { term: "Dust", def: "Jumlah Bitcoin yang sangat kecil, seringkali lebih murah fee untuk membelanjakannya daripada nilai dust itu sendiri." },
        { term: "Merkle Tree", def: "Struktur data yang merangkum seluruh transaksi dalam satu blok menjadi satu hash ringkas, mempercepat proses verifikasi." },
        { term: "51% Attack", def: "Skenario saat satu pihak menguasai lebih dari separuh hash rate jaringan, berpotensi memanipulasi transaksi." },
        { term: "KYC (Know Your Customer)", def: "Proses verifikasi identitas yang biasanya diwajibkan exchange sebelum pengguna bisa bertransaksi." }
    ],

    //------------------------------------------------
    // INIT
    //------------------------------------------------

    init() {
        this.bindEvents();
        this.loadPrice();
        this.renderQuiz();
        this.loadFearGreed();
        this.loadMempoolStatus();
        this.loadHalvingData();
        this.renderGlossary("");
        this.autoRefresh = setInterval(() => {
            this.loadPrice();
            this.loadFearGreed();
            this.loadMempoolStatus();
        }, 300000);
    },

    //------------------------------------------------
    // FORMAT ANGKA RIBUAN (untuk kolom USD & IDR)
    // Format tampilan: 2.000.000  |  Desimal pakai koma: 12.345,67
    //------------------------------------------------

    formatNumberInput(el) {
        const cursorPos = el.selectionStart;
        const oldValue = el.value;

        // Hitung posisi kursor berdasarkan jumlah karakter signifikan (angka & koma)
        let sigBefore = 0;
        for (let i = 0; i < cursorPos; i++) {
            if (/[0-9,]/.test(oldValue[i])) sigBefore++;
        }

        // Semua titik dianggap pemisah ribuan lama -> buang, lalu dibuat ulang.
        // Koma adalah satu-satunya pemisah desimal yang didukung.
        let raw = oldValue.replace(/\./g, '');
        const commaIdx = raw.indexOf(',');
        let intPart = commaIdx === -1 ? raw : raw.slice(0, commaIdx);
        let decPart = commaIdx === -1 ? null : raw.slice(commaIdx + 1).replace(/,/g, '');

        intPart = intPart.replace(/[^0-9]/g, '');
        if (decPart !== null) decPart = decPart.replace(/[^0-9]/g, '');

        intPart = intPart.replace(/^0+(?=\d)/, '');

        let formattedInt;
        if (intPart === '') {
            formattedInt = (decPart !== null) ? '0' : '';
        } else {
            formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }

        let formatted = formattedInt;
        if (decPart !== null) formatted += ',' + decPart;

        el.value = formatted;

        if (formatted === '') {
            el.setSelectionRange(0, 0);
            return;
        }

        let count = 0;
        let newPos = formatted.length;
        for (let i = 0; i < formatted.length; i++) {
            if (/[0-9,]/.test(formatted[i])) count++;
            if (count >= sigBefore) { newPos = i + 1; break; }
        }
        if (sigBefore === 0) newPos = 0;
        el.setSelectionRange(newPos, newPos);
    },

    // Ubah "2.000.000,5" jadi angka JS biasa 2000000.5
    parseFormattedNumber(str) {
        if (!str) return NaN;
        const cleaned = str.replace(/\./g, '').replace(',', '.');
        return parseFloat(cleaned);
    },

    //------------------------------------------------
    // EVENTS
    //------------------------------------------------

    bindEvents() {
        const calcBtn = document.getElementById("dcaCalcBtn");
        if (calcBtn) calcBtn.addEventListener("click", () => this.calculateDCA());

        const refreshBtn = document.getElementById("refreshPriceBtn");
        if (refreshBtn) refreshBtn.addEventListener("click", () => this.loadPrice());

        const copyBtn = document.getElementById("copyResultBtn");
        if (copyBtn) copyBtn.addEventListener("click", () => this.copyResult());

        const convBtc = document.getElementById("convBtcInput");
        const convSat = document.getElementById("convSatInput");
        const convUsd = document.getElementById("convUsdInput");
        const convIdr = document.getElementById("convIdrInput");
        if (convBtc) convBtc.addEventListener("input", () => this.convertCurrency("btc"));
        if (convSat) convSat.addEventListener("input", () => this.convertCurrency("sat"));
        if (convUsd) convUsd.addEventListener("input", () => { this.formatNumberInput(convUsd); this.convertCurrency("usd"); });
        if (convIdr) convIdr.addEventListener("input", () => { this.formatNumberInput(convIdr); this.convertCurrency("idr"); });

        const channelCalcBtn = document.getElementById("channelCalcBtn");
        if (channelCalcBtn) channelCalcBtn.addEventListener("click", () => this.calculateChannelCapacity());

        const loadNetworkBtn = document.getElementById("loadNetworkBtn");
        if (loadNetworkBtn) loadNetworkBtn.addEventListener("click", () => this.loadNetworkHashrate());

        const miningCalcBtn = document.getElementById("miningCalcBtn");
        if (miningCalcBtn) miningCalcBtn.addEventListener("click", () => this.calculateMiningProfit());

        const loadFeeRateBtn = document.getElementById("loadFeeRateBtn");
        if (loadFeeRateBtn) loadFeeRateBtn.addEventListener("click", () => this.loadFeeRate());

        const utxoCalcBtn = document.getElementById("utxoCalcBtn");
        if (utxoCalcBtn) utxoCalcBtn.addEventListener("click", () => this.calculateUTXO());

        const addAvgRowBtn = document.getElementById("addAvgRowBtn");
        if (addAvgRowBtn) addAvgRowBtn.addEventListener("click", () => this.addAvgRow());

        const avgCalcBtn = document.getElementById("avgCalcBtn");
        if (avgCalcBtn) avgCalcBtn.addEventListener("click", () => this.calculateAverageBuy());

        const avgRowsContainer = document.getElementById("avgBuyRows");
        if (avgRowsContainer) {
            avgRowsContainer.addEventListener("change", (e) => {
                if (e.target.classList.contains("avgDate")) {
                    this.onAvgDateChange(e.target.closest(".avg-buy-row"));
                }
            });
            avgRowsContainer.addEventListener("input", (e) => {
                if (e.target.classList.contains("avgAmount")) {
                    this.formatNumberInput(e.target);
                }
            });
        }

        const dcaAmountInput = document.getElementById("dcaAmount");
        if (dcaAmountInput) dcaAmountInput.addEventListener("input", () => this.formatNumberInput(dcaAmountInput));

        const miningElecCostInput = document.getElementById("miningElecCost");
        if (miningElecCostInput) miningElecCostInput.addEventListener("input", () => this.formatNumberInput(miningElecCostInput));

        const walletCheckBtn = document.getElementById("walletCheckBtn");
        if (walletCheckBtn) walletCheckBtn.addEventListener("click", () => this.loadWalletBalance());

        const glossarySearch = document.getElementById("glossarySearch");
        if (glossarySearch) glossarySearch.addEventListener("input", (e) => this.renderGlossary(e.target.value));

        const walletScanBtn = document.getElementById("walletScanBtn");
        if (walletScanBtn) walletScanBtn.addEventListener("click", () => this.startWalletScan());

        const walletScanCloseBtn = document.getElementById("walletScanCloseBtn");
        if (walletScanCloseBtn) walletScanCloseBtn.addEventListener("click", () => this.stopWalletScan());
    },

    //------------------------------------------------
    // LOAD BTC PRICE (live, dipakai semua tool)
    //------------------------------------------------

    async loadPrice() {
        try {
            const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,idr");
            const data = await response.json();
            this.btcPrice = data.bitcoin.usd;
            this.exchangeRate = data.bitcoin.idr / data.bitcoin.usd;
            this.updatePriceDisplay();
        } catch (error) {
            console.error("Price Error :", error);
            this.showOfflinePrice();
        }
    },

    updatePriceDisplay() {
        const display = document.getElementById("dcaLivePriceDisplay");
        if (!display) return;
        const idrText = this.exchangeRate
            ? " / Rp" + Math.round(this.btcPrice * this.exchangeRate).toLocaleString("id-ID")
            : "";
        display.textContent = "$" + this.btcPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + idrText;
    },

    showOfflinePrice() {
        const display = document.getElementById("dcaLivePriceDisplay");
        if (display) display.textContent = "Gagal memuat harga";
    },

    //------------------------------------------------
    // DCA CALCULATOR (Simulasi Historis)
    //------------------------------------------------

    // Data harga historis BTC sekarang disimpan LOKAL di file
    // btc-price-history.json (2013 - sekarang, harga rata-rata harian dari
    // Open/High/Low/Close). Tidak ada panggilan API sama sekali untuk data
    // historis -> tidak ada lagi masalah CORS/rate-limit/proxy down.
    // File ini di-update manual sekitar 1x/bulan.
    async loadLocalPriceHistory() {
        if (this.priceHistoryCache) return this.priceHistoryCache;

        const res = await fetch("btc-price-history.json");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (!json.prices) throw new Error("Format btc-price-history.json tidak sesuai");

        this.priceHistoryCache = json.prices;
        this.priceHistoryLastUpdated = json.lastUpdated;
        return this.priceHistoryCache;
    },

    async fetchDailyHistoryRange(fromDate, toDate) {
        return await this.loadLocalPriceHistory();
    },

    // Cari harga di tanggal tsb; kalau kosong (misal gap data, atau tanggal
    // lebih baru dari data terakhir yang di-update), mundur maksimal 60 hari
    // untuk cari tanggal terdekat yang tersedia.
    lookupHistoricalPrice(map, dateStr) {
        if (map[dateStr] !== undefined) return map[dateStr];
        const d = new Date(dateStr + "T00:00:00Z");
        for (let i = 0; i < 60; i++) {
            d.setUTCDate(d.getUTCDate() - 1);
            const key = d.toISOString().slice(0, 10);
            if (map[key] !== undefined) return map[key];
        }
        return null;
    },

    toDateInputFormat(d) {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return y + "-" + m + "-" + day;
    },

    // Rata-rata harga harian dari [startDate, endDateExclusive) — dipakai
    // supaya pembelian Mingguan/Bulanan mencerminkan rata-rata harga
    // sepanjang periode itu, bukan cuma harga di 1 tanggal persis.
    averagePriceForPeriod(map, startDate, endDateExclusive) {
        let sum = 0;
        let count = 0;
        const d = new Date(startDate);
        while (d < endDateExclusive) {
            const key = this.toDateInputFormat(d);
            if (map[key] !== undefined) {
                sum += map[key];
                count++;
            }
            d.setUTCDate(d.getUTCDate() + 1);
        }
        if (count === 0) {
            return this.lookupHistoricalPrice(map, this.toDateInputFormat(startDate));
        }
        return sum / count;
    },

    calculateDCA() {
        const amount = this.parseFormattedNumber(document.getElementById("dcaAmount").value);
        const currency = document.getElementById("dcaCurrencySelect").value;
        const frequency = document.getElementById("dcaFrequency").value;
        const startDateStr = document.getElementById("dcaStartDate").value;
        const endDateStr = document.getElementById("dcaEndDate").value;

        if (!amount || amount <= 0 || !startDateStr || !endDateStr) {
            alert("Mohon isi Jumlah per Pembelian, Tanggal Mulai, dan Tanggal Akhir dengan benar.");
            return;
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (startDate >= endDate) {
            alert("Tanggal Mulai harus lebih awal dari Tanggal Akhir.");
            return;
        }
        if (!this.btcPrice) {
            alert("Harga BTC live belum termuat. Klik 'Refresh Live Price' dulu.");
            return;
        }

        const purchaseDates = [];
        let cursor = new Date(startDate);
        while (cursor <= endDate) {
            purchaseDates.push(new Date(cursor));
            if (frequency === "daily") cursor.setUTCDate(cursor.getUTCDate() + 1);
            else if (frequency === "weekly") cursor.setUTCDate(cursor.getUTCDate() + 7);
            else cursor.setUTCMonth(cursor.getUTCMonth() + 1);
        }

        if (purchaseDates.length === 0) {
            alert("Tidak ada tanggal pembelian dalam rentang ini.");
            return;
        }
        if (purchaseDates.length > 3650) {
            alert("Rentang tanggal dan frekuensi ini menghasilkan terlalu banyak pembelian (" + purchaseDates.length + "x). Perpendek rentang atau pilih frekuensi lebih jarang.");
            return;
        }

        const btn = document.getElementById("dcaCalcBtn");
        const originalBtnText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Memuat data historis...";

        (async () => {
            let totalBTC = 0;
            let totalSpentUSD = 0;
            let totalSpentIDR = 0;
            let failedCount = 0;

            let usdMap = {};
            try {
                usdMap = await this.fetchDailyHistoryRange(startDate, endDate);
                if (Object.keys(usdMap).length === 0) throw new Error("empty");
            } catch (e) {
                throw new Error("Gagal memuat file btc-price-history.json. Pastikan file itu ada di folder yang sama dengan index.html, dan kamu membuka situs ini lewat server (Live Server/http), bukan langsung buka file HTML dari File Explorer.");
            }

            purchaseDates.forEach((date, i) => {
                let usdPrice;
                if (frequency === "daily") {
                    // Harian: harga hari itu saja (sudah rata-rata Open/High/Low/Close hari itu)
                    usdPrice = this.lookupHistoricalPrice(usdMap, this.toDateInputFormat(date));
                } else {
                    // Mingguan/Bulanan: rata-rata harga sepanjang periode itu
                    // (dari tanggal pembelian ini sampai sebelum tanggal pembelian berikutnya)
                    const periodEnd = (i + 1 < purchaseDates.length)
                        ? purchaseDates[i + 1]
                        : new Date(endDate.getTime() + 86400000);
                    usdPrice = this.averagePriceForPeriod(usdMap, date, periodEnd);
                }

                if (usdPrice === null || usdPrice === undefined || !this.exchangeRate) {
                    failedCount++;
                    return;
                }

                const idrPrice = usdPrice * this.exchangeRate;

                const btcBought = currency === "usd" ? (amount / usdPrice) : (amount / idrPrice);
                totalBTC += btcBought;
                totalSpentUSD += btcBought * usdPrice;
                totalSpentIDR += btcBought * idrPrice;
            });

            if (totalBTC === 0) {
                alert("Gagal memuat data historis untuk semua tanggal. Coba lagi sebentar lagi.");
                return;
            }

            const avgPriceUSD = totalSpentUSD / totalBTC;
            const avgPriceIDR = totalSpentIDR / totalBTC;
            const currentValueUSD = totalBTC * this.btcPrice;
            const currentValueIDR = this.exchangeRate ? totalBTC * this.btcPrice * this.exchangeRate : 0;
            const profitLossUSD = currentValueUSD - totalSpentUSD;
            const profitLossIDR = currentValueIDR - totalSpentIDR;
            const profitPercent = (profitLossUSD / totalSpentUSD) * 100;

            let purchaseCountText = purchaseDates.length + "x pembelian";
            if (failedCount > 0) {
                purchaseCountText += " (" + failedCount + "x gagal dimuat, tidak dihitung)";
            }
            purchaseCountText += " — nilai Rp estimasi (kurs saat ini)";

            document.getElementById("dcaPurchaseCount").textContent = purchaseCountText;
            document.getElementById("totalInvested").textContent =
                "$" + totalSpentUSD.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(totalSpentIDR).toLocaleString("id-ID");
            document.getElementById("btcAccumulated").textContent = totalBTC.toFixed(8) + " BTC";
            document.getElementById("averageBuy").textContent =
                "$" + avgPriceUSD.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(avgPriceIDR).toLocaleString("id-ID");
            document.getElementById("currentValue").textContent =
                "$" + currentValueUSD.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(currentValueIDR).toLocaleString("id-ID");
            document.getElementById("profitLoss").textContent =
                (profitLossUSD >= 0 ? "+$" : "-$") + Math.abs(profitLossUSD).toLocaleString("en-US", { maximumFractionDigits: 2 }) +
                " / " + (profitLossIDR >= 0 ? "+Rp" : "-Rp") + Math.abs(Math.round(profitLossIDR)).toLocaleString("id-ID");
            document.getElementById("profitPercent").textContent = (profitPercent >= 0 ? "+" : "") + profitPercent.toFixed(2) + "%";

            document.getElementById("dcaResult").style.display = "block";
        })().catch((e) => {
            alert(e.message || "Terjadi kesalahan saat memuat data historis. Coba lagi.");
        }).finally(() => {
            btn.disabled = false;
            btn.textContent = originalBtnText;
        });
    },

    copyResult() {
        const purchaseCount = document.getElementById("dcaPurchaseCount").textContent;
        const totalInvested = document.getElementById("totalInvested").textContent;
        const btcAccumulated = document.getElementById("btcAccumulated").textContent;
        const currentValue = document.getElementById("currentValue").textContent;
        const averageBuy = document.getElementById("averageBuy").textContent;
        const profitLoss = document.getElementById("profitLoss").textContent;
        const profitPercent = document.getElementById("profitPercent").textContent;

        const text = "DCA Simulator Result\n----------------------\nJumlah Pembelian: " + purchaseCount +
            "\nTotal Invest: " + totalInvested + "\nBTC Terkumpul: " + btcAccumulated + "\nAverage Buy: " + averageBuy +
            "\nNilai Sekarang: " + currentValue + "\nProfit/Loss: " + profitLoss + "\nProfit (%): " + profitPercent;

        navigator.clipboard.writeText(text).then(() => {
            alert("Hasil berhasil disalin ke clipboard!");
        }).catch(() => {
            alert("Gagal menyalin. Silakan salin manual.");
        });
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
        const elecCost = this.parseFormattedNumber(document.getElementById("miningElecCost").value);
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
        const blockReward = 3.125;

        let dailyBTC = share * blocksPerDay * blockReward;
        dailyBTC = dailyBTC * (1 - poolFee / 100);

        const dailyRevenueUSD = dailyBTC * this.btcPrice;
        const dailyKWh = (powerW / 1000) * 24;
        const dailyCostUSD = dailyKWh * elecCost;
        const dailyProfitUSD = dailyRevenueUSD - dailyCostUSD;

        const idrRate = this.exchangeRate || 0;
        const fmt = (usd) => "$" + usd.toFixed(2) + (idrRate ? " / Rp" + Math.round(usd * idrRate).toLocaleString("id-ID") : "");

        document.getElementById("miningBTC").textContent = dailyBTC.toFixed(8) + " BTC";
        document.getElementById("miningRevenue").textContent = fmt(dailyRevenueUSD);
        document.getElementById("miningCost").textContent = fmt(dailyCostUSD);
        document.getElementById("miningProfit").textContent = (dailyProfitUSD >= 0 ? "+" : "-") + fmt(Math.abs(dailyProfitUSD));

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
        const feeIdr = (feeUsd !== null && this.exchangeRate) ? feeUsd * this.exchangeRate : null;

        document.getElementById("utxoSize").textContent = vBytes.toFixed(1) + " vBytes";
        document.getElementById("utxoFeeSat").textContent = Math.round(feeSats) + " sat";
        document.getElementById("utxoFeeUsd").textContent = feeUsd !== null
            ? "$" + feeUsd.toFixed(4) + (feeIdr !== null ? " / Rp" + Math.round(feeIdr).toLocaleString("id-ID") : "")
            : "Refresh price dulu di DCA Calculator";

        document.getElementById("utxoResult").style.display = "block";
    },

    //------------------------------------------------
    // AVERAGE BUY CALCULATOR (Opsi A: harga historis otomatis)
    //------------------------------------------------

    addAvgRow() {
        const container = document.getElementById("avgBuyRows");
        const row = document.createElement("div");
        row.className = "avg-buy-row";
        row.innerHTML =
            '<input type="date" class="avgDate">' +
            '<div class="input-box">' +
            '<select class="avgCurrency"><option value="usd">$</option><option value="idr">Rp</option></select>' +
            '<input type="text" inputmode="decimal" class="avgAmount" placeholder="Jumlah dibelanjakan">' +
            '</div>' +
            '<p class="avgFetchedPrice">Pilih tanggal untuk memuat harga</p>';
        container.appendChild(row);
    },

    async fetchHistoricalPrice(dateInputValue) {
        if (this.historicalCache[dateInputValue]) {
            return this.historicalCache[dateInputValue];
        }

        const priceMap = await this.loadLocalPriceHistory();
        const usd = this.lookupHistoricalPrice(priceMap, dateInputValue);
        if (usd === null) {
            throw new Error("Tidak ada data harga untuk tanggal ini di btc-price-history.json (di luar rentang data yang tersimpan).");
        }

        const idr = this.exchangeRate ? usd * this.exchangeRate : null;

        const result = { usd, idr };
        this.historicalCache[dateInputValue] = result;
        return result;
    },

    async onAvgDateChange(rowEl) {
        const dateInput = rowEl.querySelector(".avgDate");
        const priceDisplay = rowEl.querySelector(".avgFetchedPrice");
        if (!dateInput.value) return;

        priceDisplay.textContent = "Memuat harga historis...";
        try {
            const price = await this.fetchHistoricalPrice(dateInput.value);
            rowEl.dataset.priceUsd = price.usd;
            rowEl.dataset.priceIdr = price.idr;
            priceDisplay.textContent = "Harga saat itu: $" + price.usd.toLocaleString("en-US", { maximumFractionDigits: 2 }) +
                " / Rp" + Math.round(price.idr).toLocaleString("id-ID");
        } catch (e) {
            priceDisplay.textContent = "Gagal memuat harga untuk tanggal ini. Coba tanggal lain.";
        }
    },

    calculateAverageBuy() {
        const rows = document.querySelectorAll("#avgBuyRows .avg-buy-row");
        let totalBTC = 0;
        let totalSpentUSD = 0;
        let totalSpentIDR = 0;
        let validCount = 0;

        rows.forEach(row => {
            const amountInput = row.querySelector(".avgAmount");
            const currencySelect = row.querySelector(".avgCurrency");
            const amount = this.parseFormattedNumber(amountInput.value);
            const currency = currencySelect.value;
            const priceUsd = parseFloat(row.dataset.priceUsd);
            const priceIdr = parseFloat(row.dataset.priceIdr);

            if (!amount || amount <= 0 || !priceUsd || !priceIdr) return;

            let btcBought;
            if (currency === "usd") {
                btcBought = amount / priceUsd;
            } else {
                btcBought = amount / priceIdr;
            }

            totalBTC += btcBought;
            totalSpentUSD += btcBought * priceUsd;
            totalSpentIDR += btcBought * priceIdr;
            validCount++;
        });

        if (validCount === 0 || totalBTC === 0) {
            alert("Isi minimal 1 baris dengan tanggal dan jumlah, pastikan harga historis sudah termuat (lihat teks di bawah tanggal).");
            return;
        }
        if (!this.btcPrice) {
            alert("Harga BTC live belum termuat. Buka DCA Calculator dan klik 'Refresh Price' dulu.");
            return;
        }

        const avgPriceUSD = totalSpentUSD / totalBTC;
        const avgPriceIDR = totalSpentIDR / totalBTC;
        const currentValueUSD = totalBTC * this.btcPrice;
        const currentValueIDR = totalBTC * this.btcPrice * this.exchangeRate;
        const profitLossUSD = currentValueUSD - totalSpentUSD;
        const profitLossIDR = currentValueIDR - totalSpentIDR;
        const profitPercent = (profitLossUSD / totalSpentUSD) * 100;

        document.getElementById("avgTotalSpent").textContent =
            "$" + totalSpentUSD.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(totalSpentIDR).toLocaleString("id-ID");
        document.getElementById("avgTotalBTC").textContent = totalBTC.toFixed(8) + " BTC";
        document.getElementById("avgPrice").textContent =
            "$" + avgPriceUSD.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(avgPriceIDR).toLocaleString("id-ID");
        document.getElementById("avgCurrentPrice").textContent =
            "$" + this.btcPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " / Rp" + Math.round(this.btcPrice * this.exchangeRate).toLocaleString("id-ID");
        document.getElementById("avgProfitLoss").textContent =
            (profitLossUSD >= 0 ? "+$" : "-$") + Math.abs(profitLossUSD).toLocaleString("en-US", { maximumFractionDigits: 2 }) +
            " / " + (profitLossIDR >= 0 ? "+Rp" : "-Rp") + Math.abs(Math.round(profitLossIDR)).toLocaleString("id-ID") +
            " (" + (profitPercent >= 0 ? "+" : "") + profitPercent.toFixed(2) + "%)";

        document.getElementById("avgResult").style.display = "block";
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
                    setText("walletBalanceFiat", "Refresh price dulu di DCA Calculator");
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
        const closeBtn = document.getElementById("walletScanCloseBtn");
        if (readerDiv) readerDiv.style.display = "block";
        if (closeBtn) closeBtn.style.display = "inline-block";

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
                alert("Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan, atau masukkan alamat secara manual.");
                if (readerDiv) readerDiv.style.display = "none";
                if (closeBtn) closeBtn.style.display = "none";
            });
        }, 150);
    },

    stopWalletScan() {
        if (this.html5QrCode) {
            this.html5QrCode.stop().then(() => {
                this.html5QrCode.clear();
                const readerDiv = document.getElementById("qrReaderWallet");
                const closeBtn = document.getElementById("walletScanCloseBtn");
                if (readerDiv) readerDiv.style.display = "none";
                if (closeBtn) closeBtn.style.display = "none";
            }).catch(() => { });
        }
    },

    //------------------------------------------------
    // HALVING COUNTDOWN
    //------------------------------------------------

    loadHalvingData() {
        const container = document.getElementById("halvingContainer");
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
    },

    //------------------------------------------------
    // BITCOIN GLOSSARY
    //------------------------------------------------

    renderGlossary(filter) {
        const container = document.getElementById("glossaryList");
        if (!container) return;
        const filterLower = (filter || "").toLowerCase();
        const filtered = this.glossaryData.filter(item => item.term.toLowerCase().includes(filterLower));

        if (filtered.length === 0) {
            container.innerHTML = '<p style="color:#888;">Istilah tidak ditemukan.</p>';
            return;
        }

        container.innerHTML = filtered.map(item =>
            '<div class="glossary-item"><strong>' + item.term + '</strong><p>' + item.def + '</p></div>'
        ).join("");
    },

    //------------------------------------------------
    // BITCOIN QUIZ
    //------------------------------------------------

    startQuiz() {
        const shuffled = [...this.quizData].sort(() => Math.random() - 0.5);
        this.quizPlaying = shuffled.slice(0, this.quizQuestionCount);
        this.quizIndex = 0;
        this.quizScore = 0;
        this.renderQuiz();
    },

    renderQuiz() {
        const container = document.getElementById("quizContainer");
        if (!container) return;

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
                ? "Solid! Anda paham dasar-dasar Bitcoin dengan baik \u{1F525}"
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
            '<h3 style="margin-bottom:20px;">' + current.q + '</h3>' + optionsHTML;
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
