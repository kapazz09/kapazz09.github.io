// ==================================================
// KAPAZZ BITCOIN - RATING + KOMENTAR BACKEND
// Ditempel di Extensions > Apps Script pada Google Sheet
// "Kapazz Bitcoin Ratings".
//
// Pakai 2 sheet dalam 1 spreadsheet yang sama:
//   - "Ratings"  (sudah ada dari sebelumnya, tidak diubah)
//   - "Comments" (baru — dibuat OTOMATIS kalau belum ada,
//                 tidak perlu bikin manual)
//   - "Certificates" (verifikasi Sertifikat Belajar — juga dibuat
//                 OTOMATIS kalau belum ada). Kolom:
//                 ID | Nama | Tanggal Terbit | Jumlah Modul | Timestamp Server
// ==================================================

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action || '';

  // Tidak ada action / action=rating -> perilaku LAMA (kompatibel,
  // widget rating yang sudah jalan tidak perlu diubah sama sekali)
  if (action === '' || action === 'rating') {
    return handleRating(ss, e);
  }

  if (action === 'add_comment') {
    return handleAddComment(ss, e);
  }

  if (action === 'get_comments') {
    return handleGetComments(ss, e);
  }

  if (action === 'saveCertificate') {
    return handleSaveCertificate(ss, e);
  }

  if (action === 'verifyCertificate') {
    return handleVerifyCertificate(ss, e);
  }

  return jsonOutput({ error: 'Unknown action' });
}

// ---------- RATING (tidak diubah dari versi sebelumnya) ----------
function handleRating(ss, e) {
  const sheet = ss.getSheetByName('Ratings');

  if (e.parameter.rating) {
    const rating = Number(e.parameter.rating);
    if (rating >= 1 && rating <= 5) {
      sheet.appendRow([new Date(), rating]);
    }
  }

  const data = sheet.getDataRange().getValues();
  let sum = 0;
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    const r = Number(data[i][1]);
    if (r >= 1 && r <= 5) {
      sum += r;
      count++;
    }
  }
  const average = count > 0 ? (sum / count) : 0;

  return jsonOutput({ average: average, count: count });
}

// ---------- KOMENTAR ----------
function getOrCreateCommentsSheet(ss) {
  let sheet = ss.getSheetByName('Comments');
  if (!sheet) {
    sheet = ss.insertSheet('Comments');
    sheet.appendRow(['Timestamp', 'Name', 'Comment']);
  }
  return sheet;
}

function handleAddComment(ss, e) {
  const sheet = getOrCreateCommentsSheet(ss);

  let name = (e.parameter.name || '').toString().trim();
  let comment = (e.parameter.comment || '').toString().trim();

  // Batasi panjang biar tidak merusak tampilan
  name = name.slice(0, 50);
  comment = comment.slice(0, 200);

  if (!comment) {
    return jsonOutput({ error: 'Komentar tidak boleh kosong' });
  }
  if (!name) name = 'Anonim';

  sheet.appendRow([new Date(), name, comment]);

  // Langsung balikin daftar komentar terbaru setelah nambah
  return handleGetComments(ss, e);
}

function handleGetComments(ss, e) {
  const sheet = getOrCreateCommentsSheet(ss);
  const data = sheet.getDataRange().getValues();
  const limit = e.parameter.limit ? Number(e.parameter.limit) : 0;

  const comments = [];
  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];
    if (!row[2]) continue; // lewati baris kosong
    comments.push({
      timestamp: (row[0] instanceof Date) ? row[0].toISOString() : String(row[0]),
      name: row[1] || 'Anonim',
      comment: row[2] || ''
    });
    if (limit > 0 && comments.length >= limit) break;
  }

  return jsonOutput({ comments: comments, total: data.length - 1 });
}

// ---------- SERTIFIKAT BELAJAR: SIMPAN & VERIFIKASI ----------
// ID dibuat di sisi browser dengan format KAPAZZ-BTC-YYYYMMDD-XXXX
const CERT_ID_REGEX = /^KAPAZZ-BTC-\d{8}-[A-Z0-9]{4}$/;

function getOrCreateCertificatesSheet(ss) {
  let sheet = ss.getSheetByName('Certificates');
  if (!sheet) {
    sheet = ss.insertSheet('Certificates');
    sheet.appendRow(['ID', 'Nama', 'Tanggal Terbit', 'Jumlah Modul', 'Timestamp Server']);
  }
  return sheet;
}

function cleanCertText(value, maxLen) {
  return (value == null ? '' : value).toString()
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

// Cari baris yang berisi ID (tidak peka huruf besar/kecil).
// Return nomor baris, atau 0 kalau tidak ada.
function findCertificateRow(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0].toString().trim().toUpperCase() === id) return i + 2;
  }
  return 0;
}

// action=saveCertificate&id=...&nama=...&tanggalTerbit=...&jumlahModul=8
function handleSaveCertificate(ss, e) {
  const id = (e.parameter.id || '').toString().trim().toUpperCase();
  const nama = cleanCertText(e.parameter.nama, 30);
  const tanggal = cleanCertText(e.parameter.tanggalTerbit, 40);
  let jumlah = parseInt(e.parameter.jumlahModul, 10);
  if (!(jumlah >= 1 && jumlah <= 20)) jumlah = 8;

  if (!CERT_ID_REGEX.test(id)) {
    return jsonOutput({ status: 'error', error: 'Format Certificate ID tidak valid' });
  }
  if (!nama) {
    return jsonOutput({ status: 'error', error: 'Nama tidak boleh kosong' });
  }
  if (!tanggal) {
    return jsonOutput({ status: 'error', error: 'Tanggal terbit tidak boleh kosong' });
  }

  // Kunci supaya 2 permintaan bersamaan tidak lolos dari cek duplikat
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return jsonOutput({ status: 'error', error: 'Server sedang sibuk, coba lagi' });
  }

  try {
    const sheet = getOrCreateCertificatesSheet(ss);

    // ID sudah ada -> balas "duplicate" supaya browser bikin ID baru
    if (findCertificateRow(sheet, id) > 0) {
      return jsonOutput({ status: 'duplicate' });
    }

    const row = sheet.getLastRow() + 1;
    sheet.getRange(row, 2, 1, 2).setNumberFormat('@'); // Nama & Tanggal disimpan sebagai teks murni
    sheet.getRange(row, 1, 1, 5).setValues([[id, nama, tanggal, jumlah, new Date()]]);
    return jsonOutput({ status: 'success' });
  } finally {
    lock.releaseLock();
  }
}

// action=verifyCertificate&id=...
function handleVerifyCertificate(ss, e) {
  const id = (e.parameter.id || '').toString().trim().toUpperCase();
  if (!CERT_ID_REGEX.test(id)) {
    return jsonOutput({ found: false });
  }

  const sheet = getOrCreateCertificatesSheet(ss);
  const row = findCertificateRow(sheet, id);
  if (row < 1) {
    return jsonOutput({ found: false });
  }

  const r = sheet.getRange(row, 1, 1, 5).getValues()[0];
  let tanggal = r[2];
  if (tanggal instanceof Date) {
    tanggal = Utilities.formatDate(tanggal, Session.getScriptTimeZone(), 'd MMMM yyyy');
  }
  return jsonOutput({
    found: true,
    nama: r[1].toString(),
    tanggalTerbit: tanggal.toString(),
    jumlahModul: Number(r[3]) || 8
  });
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
