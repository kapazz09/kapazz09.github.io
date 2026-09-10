/*==================================================
    KAPAZZ BITCOIN - DATA GLOSSARY UNTUK POPUP ISTILAH
    Dipakai di semua halaman "materi/.../index.html" lewat
    fungsi initGlossaryPopups() (lihat script.js tiap
    materi). Tambahkan istilah baru di sini tiap kali
    materi baru butuh istilah yang belum ada.
==================================================*/

const glossaryData = {
    "private key": "Kunci rahasia yang membuktikan kamu pemilik sah suatu alamat Bitcoin. Siapa pun yang pegang private key ini, dialah yang punya kendali penuh atas dana di alamat itu.",
    "self-custody": "Prinsip menyimpan Bitcoin dengan private key yang kamu pegang sendiri, bukan dititipkan ke pihak ketiga seperti exchange.",
    "non-custodial": "Jenis wallet yang private key-nya sepenuhnya ada di tangan kamu sendiri — tidak ada pihak lain yang bisa mengakses atau membekukan dananya.",
    "hot wallet": "Wallet yang terhubung ke internet (misalnya aplikasi di HP), praktis untuk transaksi harian tapi lebih rentan malware atau hack jarak jauh.",
    "cold wallet": "Perangkat penyimpanan Bitcoin yang private key-nya sepenuhnya offline, jauh lebih aman dari serangan online — cocok untuk simpanan jangka panjang.",
    "air-gapped": "Perangkat yang secara fisik tidak pernah punya jalur komunikasi digital ke internet (tanpa USB data, Bluetooth, atau WiFi) — transfer data hanya lewat QR code atau kartu SD yang dipindai manual.",
    "secure element": "Chip khusus di dalam hardware wallet yang dirancang tahan terhadap upaya ekstraksi data, tempat private key disimpan supaya tidak bisa dibaca langsung meski perangkatnya dibongkar paksa.",
    "seed phrase": "Rangkaian 12-24 kata (mengikuti standar BIP39) yang menjadi cadangan utama untuk memulihkan akses ke sebuah wallet Bitcoin.",
    "BIP39": "Standar yang mengatur cara mengubah angka acak (entropy) menjadi seed phrase 12/24 kata yang mudah dicatat manusia, dan cara mengubahnya kembali jadi seed di dalam wallet.",
    "entropy": "Angka acak berkualitas tinggi yang jadi titik awal pembuatan seed phrase — makin acak sumbernya, makin sulit ditebak siapa pun.",
    "mnemonic": "Istilah lain untuk seed phrase — rangkaian kata yang mewakili angka acak (entropy) supaya lebih mudah diingat dan dicatat manusia dibanding angka mentah.",
    "passphrase": "Kata atau kalimat tambahan opsional (sering disebut 'kata ke-25') yang, digabung dengan seed phrase, menghasilkan wallet yang sepenuhnya berbeda dan tersembunyi.",
    "dictionary attack": "Metode menebak kata sandi/passphrase dengan mencoba satu per satu kata dari kamus atau daftar frasa populer — makin umum kata yang dipakai, makin cepat metode ini berhasil.",
    "diceware": "Metode membuat passphrase acak dengan melempar dadu untuk memilih kata dari daftar kata baku, supaya hasilnya benar-benar acak dan tidak mudah ditebak."
};
