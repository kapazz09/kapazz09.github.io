/*==================================================
    BITCOIN TOOLKIT - BITCOIN QUIZ
==================================================*/

Object.assign(BitcoinTools, {
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
            const isHighScore = percent >= 80;
            const resultMsg = percent >= 70
                ? "Solid! Anda paham dasar-dasar Bitcoin dengan baik \u{1F525}"
                : "Kembali Mempelajari Materi yang ada agar menjadi Bitcoiner";

            container.innerHTML =
                '<h3>Selesai!</h3>' +
                '<p class="' + (isHighScore ? 'quiz-score-pop' : '') + '">Skor Anda: ' + this.quizScore + ' / ' + total + ' (' + percent.toFixed(0) + '%)' + (isHighScore ? ' \u{1F389}' : '') + '</p>' +
                '<p style="font-weight:700;margin-top:10px;">' + resultMsg + '</p>' +
                '<button class="calculate-btn" onclick="BitcoinTools.startQuiz()">Main Lagi</button>';

            if (isHighScore) this.fireConfetti();
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
    }
});
