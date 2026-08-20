// ==================================================
// KAPAZZ BITCOIN - RATING + KOMENTAR BACKEND
// Ditempel di Extensions > Apps Script pada Google Sheet
// "Kapazz Bitcoin Ratings".
//
// Pakai 2 sheet dalam 1 spreadsheet yang sama:
//   - "Ratings"  (sudah ada dari sebelumnya, tidak diubah)
//   - "Comments" (baru — dibuat OTOMATIS kalau belum ada,
//                 tidak perlu bikin manual)
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

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
