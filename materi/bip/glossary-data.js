/*==================================================
    KAPAZZ BITCOIN - DATA GLOSSARY UNTUK POPUP ISTILAH
    Materi 6: Bitcoin Improvement Proposal (BIP)
    File ini LOKAL untuk folder materi/bip/ saja —
    tidak dipakai bersama materi lain.
==================================================*/

const glossaryData = {
    "bip": "Bitcoin Improvement Proposal — dokumen formal berisi usulan perubahan atau penambahan fitur pada protokol Bitcoin. Bisa diajukan siapa saja, tapi tidak otomatis diterima atau dipakai.",
    "node": "Komputer yang menjalankan software Bitcoin dan memvalidasi aturan protokolnya sendiri — termasuk yang menentukan aturan/perubahan mana yang mau diikuti atau ditolak.",
    "p2sh": "Pay-to-Script-Hash — jenis alamat Bitcoin yang merepresentasikan skrip kompleks (misalnya multisig, butuh beberapa tanda tangan), bukan cuma satu kunci publik tunggal. Diperkenalkan lewat BIP16.",
    "hd wallet": "Hierarchical Deterministic Wallet — wallet yang bisa menghasilkan banyak alamat secara deterministik dari satu seed phrase yang sama, mengikuti standar BIP32/BIP39/BIP44.",
    "timelock": "Mekanisme yang mengunci dana Bitcoin sampai waktu atau ketinggian blok tertentu tercapai, sebelum dana itu bisa dibelanjakan.",
    "segwit": "Segregated Witness — pemisahan data tanda tangan (witness) dari data transaksi utama, mengurangi ukuran transaksi secara efektif sekaligus memperbaiki bug transaction malleability.",
    "bech32": "Format alamat Bitcoin yang diawali bc1..., lebih tahan kesalahan ketik (ada deteksi error bawaan) dan lebih efisien data dibanding format Legacy.",
    "schnorr signature": "Skema tanda tangan digital yang lebih efisien dari ECDSA dan mendukung penggabungan beberapa tanda tangan menjadi satu tanda tangan tunggal.",
    "taproot": "Upgrade protokol Bitcoin yang membuat transaksi kompleks seperti multisig terlihat sama seperti transaksi biasa di blockchain, sehingga privasi dan efisiensinya lebih baik.",
    "komputer kuantum": "Jenis komputer masa depan yang secara teoretis punya kemampuan hitung jauh lebih besar dari komputer biasa, dan berpotensi memecahkan sebagian skema kriptografi yang dipakai saat ini.",
    "key-path": "Jalur pembelanjaan tercepat pada alamat Taproot — cukup satu tanda tangan Schnorr langsung, tanpa membuka detail skrip apa pun. Jalur inilah yang membuat kunci publik terekspos di blockchain.",
    "script-path": "Jalur pembelanjaan alternatif pada alamat Taproot yang membuka salah satu cabang skrip tersembunyi, dipakai kalau kondisi tertentu diperlukan (misalnya multisig atau timelock).",
    "p2mr": "Pay-to-Merkle-Root — jenis output baru yang diusulkan lewat BIP360, mirip Taproot tapi tanpa jalur key-path, hanya bisa dibelanjakan lewat script-path yang berkomitmen ke Merkle root."
};
