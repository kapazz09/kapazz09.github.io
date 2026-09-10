/*==================================================
    KAPAZZ BITCOIN - DATA GLOSSARY UNTUK POPUP ISTILAH
    LOKAL untuk materi/on-chain-analysis/ saja — tidak
    dipakai bersama materi lain. Dipakai lewat fungsi
    initGlossaryPopups() di script.js materi ini.
==================================================*/

const glossaryData = {
    "on-chain analysis": "Proses mengumpulkan dan mempelajari data mentah yang tercatat langsung di blockchain (transaksi, pergerakan wallet, dll) untuk memahami aktivitas nyata di jaringan Bitcoin — bukan cuma melihat harga di layar exchange.",
    "whale": "Sebutan untuk wallet yang menyimpan Bitcoin dalam jumlah sangat besar. Pergerakan dana dari wallet whale sering dipantau karena berpotensi memengaruhi pasar, meski tidak selalu berarti niat jual/beli.",
    "OTC desk": "Singkatan dari Over-The-Counter desk — pihak yang memfasilitasi transaksi jual-beli Bitcoin dalam jumlah besar secara langsung antara dua pihak, di luar mekanisme order book exchange biasa.",
    "SOPR": "Spent Output Profit Ratio — rasio yang membandingkan harga jual dengan harga beli koin yang sedang dipindahkan saat ini. Nilai di atas 1 berarti rata-rata koin yang bergerak sedang untung, di bawah 1 berarti rata-rata rugi.",
    "MVRV": "Market Value to Realized Value — perbandingan antara nilai pasar Bitcoin saat ini dengan nilai realized (estimasi harga rata-rata saat tiap koin terakhir kali berpindah tangan). Nilai yang tinggi secara historis kadang diasosiasikan dengan pasar yang overheated.",
    "dormancy": "Metrik yang mengukur rata-rata usia (dalam hari) koin yang dibelanjakan/dipindahkan dalam suatu periode tertentu — menggambarkan seberapa 'lama diam' koin yang sedang aktif bergerak.",
    "Coin Days Destroyed": "Metrik yang memberi bobot lebih besar pada koin yang sudah lama tidak bergerak lalu tiba-tiba dipindahkan. Lonjakan Coin Days Destroyed sering menandakan holder jangka panjang mulai aktif kembali."
};
