/*==================================================
    KAPAZZ BITCOIN - DATA GLOSSARY UNTUK POPUP ISTILAH
    Khusus halaman materi/privasi-keamanan/index.html.
    File ini LOKAL untuk folder materi ini saja — tidak
    dipakai bersama materi lain. Dipakai lewat fungsi
    initGlossaryPopups() di script.js.
==================================================*/

const glossaryData = {
    "address reuse": "Kebiasaan memakai alamat wallet yang sama secara berulang untuk menerima Bitcoin. Ini kebiasaan paling umum dilakukan pemula, tapi paling berdampak besar ke privasi karena membuat semua transaksi mudah dikaitkan jadi satu profil.",
    "hd wallet": "Hierarchical Deterministic Wallet — jenis wallet yang otomatis menghasilkan banyak alamat baru dari satu seed phrase yang sama, mengikuti standar BIP32. Membuat penggunaan alamat baru tiap transaksi jadi otomatis tanpa perlu dikelola manual.",
    "coinjoin": "Teknik privasi yang menggabungkan input transaksi dari beberapa pengguna jadi satu transaksi besar, lalu memecahnya lagi jadi output masing-masing — membuat pengamat luar sulit menentukan input mana yang terhubung ke output mana.",
    "kyc/aml": "Aturan yang mewajibkan penyedia layanan finansial (termasuk exchange kripto) memverifikasi identitas pengguna (KYC — Know Your Customer) dan memantau transaksi mencurigakan untuk mencegah pencucian uang (AML — Anti-Money Laundering).",
    "chain analysis": "Teknik menganalisis pola transaksi di blockchain publik untuk melacak asal-usul dana, mengaitkan alamat-alamat yang diduga milik entitas yang sama, dan mengidentifikasi dana yang pernah melewati layanan tertentu seperti mixer atau CoinJoin.",
    "malware": "Perangkat lunak berbahaya yang dirancang untuk menyusup ke perangkat tanpa sepengetahuan pemiliknya, misalnya untuk mencuri data, memata-matai aktivitas, atau mencuri seed phrase dan private key.",
    "phishing": "Teknik penipuan yang menyamar sebagai pihak resmi (misalnya 'support' wallet atau exchange) untuk menipu korban agar membagikan informasi sensitif seperti seed phrase, biasanya lewat link atau aplikasi palsu yang tampilannya mirip aslinya."
};
