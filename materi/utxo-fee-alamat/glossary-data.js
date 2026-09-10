/*==================================================
    KAPAZZ BITCOIN - DATA GLOSSARY UNTUK POPUP ISTILAH
    Materi: UTXO Management, Coin Control & Fee Transaksi
    File ini LOKAL/MANDIRI untuk folder materi/utxo-fee-alamat/
    sendiri — bukan file shared dengan materi lain.
==================================================*/

const glossaryData = {
    "UTXO": "Unspent Transaction Output — potongan output transaksi Bitcoin sebelumnya yang belum dibelanjakan. Ini yang sebenarnya tersimpan di blockchain, bukan 'saldo' dalam bentuk satu angka tunggal.",
    "coin control": "Fitur di sebagian wallet yang memungkinkan kamu memilih SENDIRI UTXO mana yang dipakai sebagai input transaksi, bukan diserahkan otomatis ke algoritma wallet.",
    "vBytes": "Satuan ukuran 'berat' data sebuah transaksi Bitcoin (virtual bytes). Makin banyak input/output atau makin tidak efisien jenis alamatnya, makin besar angka vBytes-nya.",
    "fee rate": "Harga per satuan ukuran transaksi, dinyatakan dalam sat/vByte (satoshi per vByte). Nilainya naik-turun mengikuti seberapa padat antrean di mempool saat itu.",
    "mempool": "Ruang tunggu sementara berisi transaksi-transaksi yang sudah disiarkan ke jaringan tapi belum masuk ke dalam blok. Miner memilih transaksi dari sini, biasanya memprioritaskan fee rate tertinggi.",
    "Legacy": "Format alamat Bitcoin paling awal (P2PKH), diawali angka '1', sejak 2009. Paling kompatibel di semua wallet, tapi paling boros vBytes sehingga fee-nya paling mahal untuk transaksi yang sama.",
    "SegWit": "Segregated Witness — upgrade protokol Bitcoin tahun 2017 yang memisahkan data tanda tangan dari data transaksi utama, sehingga transaksi jadi lebih hemat vBytes dibanding format Legacy.",
    "Nested SegWit": "Format alamat P2SH-P2WPKH, diawali angka '3', dibuat tahun 2017 sebagai jembatan — teknis sudah SegWit tapi dibungkus format Legacy supaya tetap kompatibel dengan sistem lama.",
    "Native SegWit": "Format alamat P2WPKH, diawali 'bc1q', diperkenalkan 2017 tanpa pembungkus Legacy. Kombinasi efisiensi vBytes yang baik dan kompatibilitas luas — jenis yang paling umum dipakai saat ini.",
    "Taproot": "Format alamat P2TR paling baru, diawali 'bc1p', aktif akhir 2021. Lebih efisien untuk transaksi kompleks (seperti multisig) dan privasi lebih baik, tapi adopsinya masih bertahap."
};
