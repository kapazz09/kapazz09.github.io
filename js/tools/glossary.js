/*==================================================
    BITCOIN TOOLKIT - GLOSSARY
==================================================*/

Object.assign(BitcoinTools, {
    bindGlossaryEvents() {
        const glossarySearch = document.getElementById("glossarySearch");
        if (glossarySearch) glossarySearch.addEventListener("input", (e) => this.renderGlossary(e.target.value));
    },

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
    }
});
