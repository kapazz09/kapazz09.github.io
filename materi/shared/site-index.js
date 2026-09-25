/*==================================================
    KAPAZZ BITCOIN - INDEX GABUNGAN 8 MATERI
    Dipakai oleh materi/shared/quick-nav.js di SEMUA
    halaman materi supaya fitur cari & "Materi Lainnya"
    bisa lintas-materi (nemuin istilah/section yang
    dibahas di materi LAIN, bukan cuma yang lagi dibuka).

    PENTING: kalau ada materi yang direvisi (section
    ditambah/diubah, istilah baru ditandai popup), cukup
    update file INI SAJA -- tidak perlu ubah kode di
    tiap halaman materi satu per satu.
==================================================*/

const MATERI_LIST = [
    { id: "bitcoin-intro", num: 1, title: "Apa itu Bitcoin", url: "https://youtube.com/playlist?list=PL_5dSqXuoyfxWUJh27-Y8WDAWxnMZv7pP&si=o0ZjGl55S-p7SHPE", external: true },
    { id: "self-custody", num: 2, title: "Self Custody Cold Wallet", folder: "self-custody" },
    { id: "utxo-fee", num: 3, title: "UTXO, Fee, Alamat Wallet", folder: "utxo-fee-alamat" },
    { id: "privasi-keamanan", num: 4, title: "Privasi dan Keamanan", folder: "privasi-keamanan" },
    { id: "lightning-network", num: 5, title: "Lightning Network", folder: "lightning-network" },
    { id: "bip", num: 6, title: "Bitcoin Improvement Proposal (BIP)", folder: "bip" },
    { id: "mining-pool", num: 7, title: "Mining dan Mining Pool", folder: "mining-pool" },
    { id: "on-chain-analysis", num: 8, title: "On Chain Analysis", folder: "on-chain-analysis" }
];

// materiId merujuk ke MATERI_LIST[].id. Daftar terms diambil dari
// istilah yang ditandai popup (data-term) di tiap section aslinya.
const MATERI_TOPIC_INDEX = [
    // ---------- 2. Self Custody Cold Wallet ----------
    { materiId: "self-custody", sectionId: "section-1", sectionTitle: "Kenapa Self-Custody Itu Penting", terms: ["non-custodial", "private key", "self-custody"] },
    { materiId: "self-custody", sectionId: "section-2", sectionTitle: "Hot Wallet vs Cold Wallet", terms: ["cold wallet", "hot wallet"] },
    { materiId: "self-custody", sectionId: "section-3", sectionTitle: "Kenapa Air-Gapped Adalah Level Tertinggi Cold Storage", terms: ["air-gapped"] },
    { materiId: "self-custody", sectionId: "section-4", sectionTitle: "Tingkatan Keamanan Berdasarkan Cara Koneksi", terms: ["secure element"] },
    { materiId: "self-custody", sectionId: "section-5", sectionTitle: "Seed Phrase & BIP39: Kunci dari Segala Kunci", terms: ["BIP39", "diceware", "dictionary attack", "entropy", "mnemonic", "passphrase", "seed phrase"] },
    { materiId: "self-custody", sectionId: "section-6", sectionTitle: "Kenapa Backup Kertas Tidak Cukup: Metal Backup", terms: [] },
    { materiId: "self-custody", sectionId: "section-7", sectionTitle: "Recovery Test: Langkah yang Sering Dilewatkan Pemula", terms: [] },
    { materiId: "self-custody", sectionId: "section-8", sectionTitle: "Legacy: Rencana Warisan untuk Keluarga", terms: [] },
    { materiId: "self-custody", sectionId: "section-9", sectionTitle: "Kesalahan Umum Pemula", terms: [] },

    // ---------- 3. UTXO, Fee, Alamat Wallet ----------
    { materiId: "utxo-fee", sectionId: "section-1", sectionTitle: "Apa Itu UTXO?", terms: ["UTXO"] },
    { materiId: "utxo-fee", sectionId: "section-2", sectionTitle: "Konsolidasi UTXO", terms: ["fee rate", "vBytes"] },
    { materiId: "utxo-fee", sectionId: "section-3", sectionTitle: "Perbedaan UTXO Besar vs UTXO Kecil", terms: ["coin control"] },
    { materiId: "utxo-fee", sectionId: "section-4", sectionTitle: "Bagaimana Fee Transaksi Bitcoin Dihitung", terms: [] },
    { materiId: "utxo-fee", sectionId: "section-5", sectionTitle: "Kondisi Jaringan: Sepi vs Ramai", terms: ["mempool"] },
    { materiId: "utxo-fee", sectionId: "section-6", sectionTitle: "4 Jenis Alamat Wallet Bitcoin", terms: ["Legacy", "Native SegWit", "Nested SegWit", "SegWit", "Taproot"] },
    { materiId: "utxo-fee", sectionId: "section-7", sectionTitle: "Menghubungkan Kembali ke UTXO", terms: [] },

    // ---------- 4. Privasi dan Keamanan ----------
    { materiId: "privasi-keamanan", sectionId: "section-1", sectionTitle: "Privasi vs Keamanan: Dua Hal yang Berbeda", terms: [] },
    { materiId: "privasi-keamanan", sectionId: "section-2", sectionTitle: "Address Reuse: Kebiasaan Dasar yang Paling Berdampak", terms: ["HD wallet", "address reuse"] },
    { materiId: "privasi-keamanan", sectionId: "section-3", sectionTitle: "CoinJoin: Teknik Privasi Lanjutan", terms: ["CoinJoin"] },
    { materiId: "privasi-keamanan", sectionId: "section-4", sectionTitle: "Manfaat dan Risiko Praktis", terms: ["KYC/AML", "chain analysis"] },
    { materiId: "privasi-keamanan", sectionId: "section-5", sectionTitle: "Keamanan Perangkat: Lapisan yang Sering Diabaikan", terms: ["malware", "phishing"] },
    { materiId: "privasi-keamanan", sectionId: "section-6", sectionTitle: "Uji Pemahaman", terms: [] },

    // ---------- 5. Lightning Network ----------
    { materiId: "lightning-network", sectionId: "section-1", sectionTitle: "Asal Mula: Kenapa Lightning Network Dibuat", terms: [] },
    { materiId: "lightning-network", sectionId: "section-2", sectionTitle: "Cara Lightning Beroperasi di Bawah Jaringan Utama", terms: ["layer 2", "off-chain", "on-chain"] },
    { materiId: "lightning-network", sectionId: "section-3", sectionTitle: "Bagaimana Channel Lightning Bekerja", terms: ["channel", "routing"] },
    { materiId: "lightning-network", sectionId: "section-4", sectionTitle: "Alamat di Lightning, Berbeda dengan On-Chain", terms: ["bolt12", "invoice", "lightning address"] },
    { materiId: "lightning-network", sectionId: "section-5", sectionTitle: "Custodial vs Non-Custodial Wallet di Lightning", terms: [] },
    { materiId: "lightning-network", sectionId: "section-6", sectionTitle: "Kenapa Memakai Lightning, Bukan On-Chain?", terms: [] },
    { materiId: "lightning-network", sectionId: "section-7", sectionTitle: "Seberapa Besar Adopsi Lightning Saat Ini", terms: [] },
    { materiId: "lightning-network", sectionId: "section-8", sectionTitle: "Cek Pemahaman", terms: [] },

    // ---------- 6. Bitcoin Improvement Proposal (BIP) ----------
    { materiId: "bip", sectionId: "section-1", sectionTitle: "Apa Itu BIP?", terms: ["bip", "node"] },
    { materiId: "bip", sectionId: "section-2", sectionTitle: "BIP-BIP Landmark yang Sejauh Ini Saya Pahami", terms: ["bech32", "hd wallet", "p2sh", "schnorr signature", "segwit", "taproot", "timelock"] },
    { materiId: "bip", sectionId: "section-3", sectionTitle: "BIP360: Proposal yang Masih Dipertimbangkan", terms: ["key-path", "komputer kuantum", "p2mr", "script-path"] },
    { materiId: "bip", sectionId: "section-4", sectionTitle: "Status Saat Ini: Masih Dipertimbangkan", terms: [] },
    { materiId: "bip", sectionId: "section-5", sectionTitle: "Cek Pemahaman", terms: [] },

    // ---------- 7. Mining dan Mining Pool ----------
    { materiId: "mining-pool", sectionId: "section-1", sectionTitle: "Apa Itu Proses Mining", terms: ["hash", "nonce", "proof-of-work"] },
    { materiId: "mining-pool", sectionId: "section-2", sectionTitle: "Reward Mining: dari Awal hingga Sekarang", terms: ["block subsidy", "halving"] },
    { materiId: "mining-pool", sectionId: "section-3", sectionTitle: "Solo Mining vs Mining Pool", terms: ["hashrate", "mining pool"] },
    { materiId: "mining-pool", sectionId: "section-4", sectionTitle: "Alat Mining dari Masa ke Masa", terms: ["asic"] },
    { materiId: "mining-pool", sectionId: "section-5", sectionTitle: "Listrik yang Dipakai", terms: ["stranded energy"] },
    { materiId: "mining-pool", sectionId: "section-6", sectionTitle: "Dalam Mining Pool, Fee Dibagi Berdasarkan Apa?", terms: ["share"] },
    { materiId: "mining-pool", sectionId: "section-7", sectionTitle: "Stratum V1 vs V2", terms: ["job negotiation", "stratum"] },
    { materiId: "mining-pool", sectionId: "section-8", sectionTitle: "Kenapa Tetap Antusias Meski Biaya Sangat Besar", terms: [] },
    { materiId: "mining-pool", sectionId: "section-9", sectionTitle: "Cek Pemahaman", terms: [] },

    // ---------- 8. On Chain Analysis ----------
    { materiId: "on-chain-analysis", sectionId: "section-1", sectionTitle: "Apa Itu On-Chain Analysis", terms: ["on-chain analysis"] },
    { materiId: "on-chain-analysis", sectionId: "section-2", sectionTitle: "Menganalisis Kepadatan Transaksi Blockchain", terms: [] },
    { materiId: "on-chain-analysis", sectionId: "section-3", sectionTitle: "Mendeteksi Transaksi Besar & Aliran ke/dari Exchange", terms: ["OTC desk", "whale"] },
    { materiId: "on-chain-analysis", sectionId: "section-4", sectionTitle: "Membaca Sentimen Pasar Lewat Data On-Chain", terms: ["MVRV", "SOPR"] },
    { materiId: "on-chain-analysis", sectionId: "section-5", sectionTitle: "Hash Rate & Tingkat Kesulitan sebagai Indikator Kesehatan Jaringan", terms: [] },
    { materiId: "on-chain-analysis", sectionId: "section-6", sectionTitle: "Dormancy & Coin Days Destroyed", terms: ["Coin Days Destroyed", "dormancy"] },
    { materiId: "on-chain-analysis", sectionId: "section-7", sectionTitle: "Uji Pemahaman", terms: [] }
];
