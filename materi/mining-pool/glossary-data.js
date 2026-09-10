/*==================================================
    KAPAZZ BITCOIN - DATA GLOSSARY UNTUK POPUP ISTILAH
    Khusus materi/mining-pool/ — LOKAL/MANDIRI, tidak
    dipakai bersama materi lain. Dipakai lewat fungsi
    initGlossaryPopups() di script.js materi ini.
==================================================*/

const glossaryData = {
    "proof-of-work": "Mekanisme yang mengharuskan miner melakukan kerja komputasi nyata (mencoba angka acak berkali-kali) sebelum boleh menambahkan blok baru ke blockchain — inilah yang membuat blockchain sulit dimanipulasi.",
    "nonce": "Angka acak yang dicoba-coba miner berulang kali, digabung dengan data blok, untuk mencari hasil hash yang berada di bawah target kesulitan jaringan.",
    "hash": "Fungsi yang mengubah data blok (termasuk nonce) menjadi rangkaian angka & huruf dengan panjang tetap — hasilnya acak dan tidak bisa diprediksi tanpa benar-benar menjalankan hitungannya.",
    "halving": "Peristiwa pemotongan reward block subsidy jadi separuh, terjadi tiap 210.000 blok (sekitar 4 tahun sekali) — bagian dari desain suplai tetap Bitcoin yang dibatasi maksimal 21 juta koin.",
    "block subsidy": "Bagian reward miner yang berasal dari koin baru yang diciptakan sistem (bukan dari fee transaksi) — nilainya terus mengecil separuh tiap kali halving terjadi.",
    "mining pool": "Kumpulan banyak miner yang menggabungkan hashrate mereka supaya peluang menemukan blok lebih tinggi, lalu reward yang didapat dibagi proporsional sesuai kontribusi kerja masing-masing anggota.",
    "hashrate": "Ukuran seberapa banyak percobaan hash yang bisa dilakukan suatu perangkat atau jaringan per detik — makin tinggi hashrate, makin besar peluang menemukan blok valid.",
    "asic": "Application-Specific Integrated Circuit — chip yang dirancang khusus hanya untuk satu tugas (mining Bitcoin), jauh lebih cepat dan hemat energi dibanding CPU, GPU, atau FPGA untuk pekerjaan ini.",
    "stranded energy": "Energi listrik berlebih yang sulit disalurkan atau dijual ke jaringan utama (misalnya gas flare dari sumur minyak, atau surplus musiman dari pembangkit hidro) — sering dimanfaatkan operasi mining karena harganya sangat murah.",
    "share": "Bukti kerja kecil yang dikirim miner ke mining pool — hasil hash yang belum tentu memenuhi target kesulitan penuh jaringan, tapi cukup untuk membuktikan kontribusi kerja nyata pada pool.",
    "stratum": "Protokol komunikasi standar antara perangkat miner dan server mining pool, dipakai untuk mengirim pekerjaan (job) dan menerima share dari miner.",
    "job negotiation": "Fitur di Stratum V2 yang memungkinkan miner individu ikut menyusun sendiri isi calon blok (memilih transaksi mana yang masuk), bukan sepenuhnya diserahkan ke operator pool."
};
