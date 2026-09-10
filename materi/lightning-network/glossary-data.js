/*==================================================
    KAPAZZ BITCOIN - DATA GLOSSARY UNTUK POPUP ISTILAH
    Khusus materi "Bitcoin Lightning Network".
    File ini LOKAL/MANDIRI di folder materi ini sendiri —
    tidak dipakai bersama materi lain. Dipakai lewat
    fungsi initGlossaryPopups() di script.js.
==================================================*/

const glossaryData = {
    "layer 2": "Lapisan tambahan yang beroperasi 'di atas' blockchain utama (Layer 1), memanfaatkan keamanannya tanpa perlu mencatat tiap transaksi kecil langsung ke blockchain.",
    "off-chain": "Transaksi yang terjadi di luar blockchain utama — dalam konteks Lightning, ini berarti perpindahan saldo di dalam channel yang tidak langsung tercatat ke Bitcoin mainnet, sehingga bisa instan dan hampir tanpa biaya.",
    "on-chain": "Transaksi yang tercatat langsung dan permanen di blockchain Bitcoin (Layer 1) — dalam Lightning, ini hanya terjadi saat channel dibuka dan ditutup.",
    "channel": "Wadah dana yang dikunci bersama oleh dua pihak lewat satu transaksi on-chain, tempat mereka bisa bertransaksi berkali-kali secara off-chain sampai channel-nya ditutup.",
    "routing": "Proses 'melompatkan' pembayaran Lightning lewat beberapa channel yang saling terhubung untuk sampai ke tujuan yang tidak punya channel langsung denganmu, tetap off-chain dan dalam hitungan detik.",
    "invoice": "Alamat pembayaran Lightning sekali pakai (diawali 'lnbc...') yang dibuat khusus untuk satu transaksi, sudah berisi jumlah dan batas waktu tertentu — beda dari alamat on-chain yang bisa dipakai berulang.",
    "lightning address": "Alamat Lightning bergaya email (misalnya nama@walletku.com) yang lebih mudah dibagikan dan diingat dibanding invoice yang panjang dan sekali pakai.",
    "bolt12": "Protokol Lightning yang lebih baru, mulai memperkenalkan alamat statis yang bisa dipakai berulang dengan aman — berbeda dari invoice BOLT11 klasik yang sekali pakai.",
    "custodial": "Jenis layanan atau wallet di mana private key dan channel-nya dipegang serta dikelola oleh pihak penyedia, bukan oleh pengguna sendiri.",
    "non-custodial": "Jenis wallet di mana private key dan channel Lightning sepenuhnya dipegang dan dikendalikan oleh pengguna sendiri, bukan pihak ketiga."
};
