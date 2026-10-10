// ==================================================
// BANK SOAL UJIAN AKHIR (21 soal: 3 soal x 7 materi)
// Materi #1 (video "Apa itu Bitcoin") tidak punya soal ujian.
// Tiap soal: materi, q (pertanyaan), options, answer (indeks jawaban
// benar di options), explanation (muncul di review setelah ujian).
// Dipakai oleh js/exam.js
// ==================================================
const EXAM_QUESTIONS = [
    // ---------- self-custody ----------
    {
        materi: 'self-custody',
        q: `Hardware wallet yang tetap konek USB saat transaksi otomatis SAMA TIDAK AMANNYA dengan hot wallet biasa. Benar atau salah?`,
        options: [`Benar`, `Salah`],
        answer: 1,
        explanation: `Hardware wallet USB tetap ada momen fisik konek ke perangkat online saat transaksi, beda dari air-gapped yang sama sekali tidak pernah konek — tapi ini tidak otomatis sama tidak amannya dengan hot wallet, karena private key tetap tersimpan di secure element.`
    },
    {
        materi: 'self-custody',
        q: `Kamu bikin passphrase pakai nama kucing peliharaanmu karena gampang diingat. Kenapa ini pilihan buruk?`,
        options: [`Terlalu pendek`, `Berkaitan dengan data yang bisa ditelusuri orang lain`, `Hewan peliharaan tidak valid`],
        answer: 1,
        explanation: `Data yang 'familiar' bagimu sering juga mudah ditelusuri orang lain lewat medsos/orang terdekat — passphrase kuat harus tidak berkaitan dengan data pribadi yang bisa dicari.`
    },
    {
        materi: 'self-custody',
        q: `Kenapa 3 salinan metal backup harus di 3 LOKASI GEOGRAFIS berbeda, bukan cuma 3 tempat beda di rumah yang sama?`,
        options: [`Biar rapi`, `Supaya 1 bencana lokal tidak menghapus lebih dari 1 salinan sekaligus`, `Lebih mudah diakses`],
        answer: 1,
        explanation: `Tujuan 3 lokasi berbeda secara geografis adalah supaya 1 kejadian buruk (kebakaran, bencana) tidak menghapus lebih dari 1 salinan backup sekaligus.`
    },

    // ---------- utxo-fee-alamat ----------
    {
        materi: 'utxo-fee-alamat',
        q: `Pakai alamat Taproot dibanding Legacy otomatis bikin fee RATE (sat/vByte) lebih murah saat jaringan ramai. Benar/salah?`,
        options: [`Benar`, `Salah`],
        answer: 1,
        explanation: `Jenis alamat (Legacy/SegWit/Taproot) hanya memengaruhi ukuran transaksi (vBytes), bukan fee rate (sat/vByte) yang ditentukan kepadatan mempool.`
    },
    {
        materi: 'utxo-fee-alamat',
        q: `Kamu sengaja simpan beberapa UTXO terpisah demi privasi, bukan dikonsolidasi. Istilah untuk ini?`,
        options: [`Coin control`, `Fee optimization`, `Address reuse`],
        answer: 0,
        explanation: `Coin control adalah istilah untuk memilih secara manual UTXO mana yang dipakai sebagai input transaksi, biasanya demi privasi.`
    },
    {
        materi: 'utxo-fee-alamat',
        q: `Mempool penuh karena harga BTC naik tajam. Yang paling mungkin terjadi ke fee rate?`,
        options: [`Turun`, `Naik karena transaksi bersaing ruang blok terbatas`, `Tidak terpengaruh`],
        answer: 1,
        explanation: `Saat mempool penuh, transaksi bersaing memperebutkan ruang blok terbatas sehingga fee rate naik.`
    },

    // ---------- privasi-keamanan ----------
    {
        materi: 'privasi-keamanan',
        q: `Karena blockchain transparan penuh, privasi di Bitcoin itu mustahil dicapai sama sekali. Benar/salah?`,
        options: [`Benar`, `Salah`],
        answer: 1,
        explanation: `Privasi dalam Bitcoin bukan soal menyembunyikan transaksi (itu memang transparan), tapi soal membuat alamat sulit dikaitkan ke identitas nyata.`
    },
    {
        materi: 'privasi-keamanan',
        q: `Kamu bagikan 1 alamat yang sama berkali-kali di medsos buat terima donasi. Dampaknya?`,
        options: [`Tidak ada`, `Semua donasi bisa dikaitkan jadi 1 profil`, `Transaksi lebih mahal`],
        answer: 1,
        explanation: `Address reuse membuat semua transaksi ke alamat yang sama bisa dikaitkan jadi satu profil aktivitas.`
    },
    {
        materi: 'privasi-keamanan',
        q: `Dana hasil CoinJoin-mu ditandai exchange untuk verifikasi tambahan. Kenapa?`,
        options: [`CoinJoin ilegal`, `Sebagian exchange pakai chain analysis mendeteksi dana pernah di-mix (aturan KYC/AML)`, `Dana otomatis hilang`],
        answer: 1,
        explanation: `Sebagian exchange yang tunduk aturan KYC/AML menggunakan chain analysis untuk mendeteksi dana yang pernah melewati CoinJoin/mixer.`
    },

    // ---------- lightning-network ----------
    {
        materi: 'lightning-network',
        q: `Selama channel terbuka, SETIAP transaksi di dalamnya tetap tercatat 1-1 di blockchain utama. Benar/salah?`,
        options: [`Benar`, `Salah`],
        answer: 1,
        explanation: `Selama channel terbuka, transaksi terjadi off-chain — blockchain hanya dicatat saat channel dibuka dan ditutup.`
    },
    {
        materi: 'lightning-network',
        q: `Mau bayar orang yang tidak punya channel langsung denganmu. Bagaimana tetap instan?`,
        options: [`Harus buka channel baru`, `Pembayaran 'melompat' lewat channel lain (routing)`, `Tidak bisa, harus on-chain`],
        answer: 1,
        explanation: `Routing memungkinkan pembayaran 'melompat' lewat beberapa channel yang saling terhubung tanpa perlu buka channel langsung.`
    },
    {
        materi: 'lightning-network',
        q: `Mau terima bayaran berkali-kali dari orang beda tanpa generate kode baru tiap kali. Format paling cocok?`,
        options: [`Invoice sekali pakai`, `Lightning Address (nama@domain)`, `Alamat on-chain`],
        answer: 1,
        explanation: `Lightning Address bergaya email bisa dipakai berulang untuk menerima pembayaran, beda dari invoice yang umumnya sekali pakai.`
    },

    // ---------- bip ----------
    {
        materi: 'bip',
        q: `BIP360 sudah resmi mengganti skema tanda tangan Bitcoin dengan algoritma tahan-kuantum sepenuhnya. Benar/salah?`,
        options: [`Benar`, `Salah`],
        answer: 1,
        explanation: `BIP360 baru mengusulkan P2MR yang menghapus jalur key-path rentan — belum mengganti skema tanda tangan sepenuhnya dengan algoritma tahan-kuantum.`
    },
    {
        materi: 'bip',
        q: `Wallet mau dukung multisig tanpa 1 kunci publik tunggal. BIP fondasi awalnya?`,
        options: [`BIP39`, `BIP16 (P2SH)`, `BIP173`],
        answer: 1,
        explanation: `BIP16 (Pay-to-Script-Hash) adalah fondasi awal yang memungkinkan alamat merepresentasikan skrip kompleks seperti multisig.`
    },
    {
        materi: 'bip',
        q: `Transaksi multisig kompleks tapi tampilannya sama persis transaksi biasa di blockchain. Fitur BIP mana?`,
        options: [`Timelock`, `Taproot (BIP341)`, `SegWit`],
        answer: 1,
        explanation: `Taproot (BIP341) membuat transaksi kompleks terlihat sama seperti transaksi biasa di blockchain, meningkatkan privasi dan efisiensi.`
    },

    // ---------- mining-pool ----------
    {
        materi: 'mining-pool',
        q: `Miner bisa langsung hitung nonce yang tepat tanpa coba berkali-kali, asal komputernya canggih. Benar/salah?`,
        options: [`Benar`, `Salah`],
        answer: 1,
        explanation: `Hasil hash bersifat acak dan tidak bisa diprediksi — satu-satunya cara menemukan nonce valid adalah mencoba berkali-kali (trial and error).`
    },
    {
        materi: 'mining-pool',
        q: `Solo mining pakai 1 perangkat kecil di rumah. Yang paling mungkin terjadi?`,
        options: [`Pasti dapat blok beberapa hari`, `Bisa bertahun-tahun tanpa dapat 1 blok pun`, `Reward dibagi otomatis`],
        answer: 1,
        explanation: `Dengan tingkat kesulitan jaringan saat ini, solo mining skala kecil bisa bertahun-tahun tanpa pernah menemukan satu blok pun.`
    },
    {
        materi: 'mining-pool',
        q: `Pool mengizinkan miner individu susun sendiri isi calon blok (job negotiation). Protokol apa ini?`,
        options: [`Stratum V1`, `Stratum V2`, `Proof-of-Work`],
        answer: 1,
        explanation: `Stratum V2 mengembalikan kendali penyusunan isi blok ke miner individu lewat mekanisme job negotiation.`
    },

    // ---------- on-chain-analysis ----------
    {
        materi: 'on-chain-analysis',
        q: `MVRV sangat tinggi PASTI berarti harga BTC segera turun drastis. Benar/salah?`,
        options: [`Benar`, `Salah`],
        answer: 1,
        explanation: `MVRV tinggi secara historis berbarengan dengan fase pasar overheated, tapi ini bukan formula pasti untuk memprediksi harga.`
    },
    {
        materi: 'on-chain-analysis',
        q: `Coin Days Destroyed (CDD) melonjak tajam hari ini. Artinya?`,
        options: [`Banyak wallet baru transaksi`, `Holder lama yang diam mulai bergerak`, `Harga pasti naik`],
        answer: 1,
        explanation: `Coin Days Destroyed yang melonjak menandakan koin yang sudah lama diam (holder lama) mulai bergerak kembali.`
    },
    {
        materi: 'on-chain-analysis',
        q: `Hash rate turun tajam & berkelanjutan (bukan fluktuasi harian). Penyebab paling mungkin?`,
        options: [`Bitcoin dihentikan`, `Tekanan ekonomi pada miner (harga BTC turun/listrik naik)`, `Jaringan diretas`],
        answer: 1,
        explanation: `Penurunan hash rate tajam dan berkelanjutan sering jadi sinyal tekanan ekonomi pada miner, misalnya harga BTC turun atau biaya listrik naik.`
    }
];
