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
//                 ID | Nama | Tanggal Terbit | Jumlah Modul | Timestamp Server |
//                 Skor Ujian | Nilai Akhir   (2 kolom terakhir ditambah di AKHIR;
//                 data lama tetap aman, kolom skor kosong = sertifikat lama).
//                 Skor dicatat dari hasil ujian di SERVER (certToken), bukan dari browser.
//   - "Soal" (bank soal Ujian Akhir, 49 soal, baris 1 header). Kolom:
//                 ID | Materi | Tipe | Pertanyaan | Opsi A | Opsi B | Opsi C |
//                 Kunci | Penjelasan | Aktif
//                 Kunci jawaban & penjelasan TIDAK PERNAH dikirim ke browser;
//                 soal diundi dan DINILAI di server (startExam / submitExam).
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

  if (action === 'startExam') {
    return handleStartExam(ss);
  }

  if (action === 'saveCertificate') {
    return handleSaveCertificate(ss, e);
  }

  if (action === 'verifyCertificate') {
    return handleVerifyCertificate(ss, e);
  }

  return jsonOutput({ error: 'Unknown action' });
}

// submitExam dikirim lewat POST (isi: JSON {examId, answers}); browser memakai
// Content-Type text/plain supaya tidak memicu preflight CORS.
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let body = {};
  try {
    body = JSON.parse((e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return jsonOutput({ status: 'error', error: 'Permintaan tidak valid' });
  }
  if (!body || typeof body !== 'object') body = {};
  const action = (e.parameter && e.parameter.action) || body.action || '';

  if (action === 'submitExam') {
    return handleSubmitExam(body);
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

// ---------- UJIAN AKHIR: SOAL DARI SHEET "Soal", DINILAI DI SERVER ----------
const EXAM_TOTAL = 21;
const EXAM_PASS_MIN = 16;
const EXAM_MATERI = ['self-custody', 'utxo-fee', 'privasi-keamanan', 'lightning-network',
  'bip', 'mining-pool', 'on-chain-analysis'];
const EXAM_KASUS_PER_MATERI = 2;
const EXAM_JEBAKAN_PER_MATERI = 1;

const EXAM_SESSION_TTL = 90 * 60;   // detik: sesi ujian (kunci jawaban per soal)
const EXAM_RESULT_TTL = 10 * 60;    // detik: catatan hasil (kirim ulang aman)
const CERT_TOKEN_TTL = 30 * 60;     // detik: token pembuatan sertifikat
const SOAL_CACHE_TTL = 10 * 60;     // detik: bank soal hasil baca sheet
const SOAL_CACHE_CHUNK = 30000;     // karakter per key (batas cache 100 KB per key)
const SOAL_CACHE_MAX_CHUNKS = 20;

const EXAM_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const CERT_TOKEN_REGEX = /^[0-9a-f]{64}$/;

// Baca tab "Soal" -> array soal AKTIF (tanpa kolom Penjelasan). Hasil di-cache 10 menit
// supaya startExam tidak membuka spreadsheet tiap kali. Cache hanya hidup di server.
function getSoalBank(ss) {
  const cache = CacheService.getScriptCache();
  const meta = cache.get('soalbank:meta');
  if (meta) {
    const n = parseInt(meta, 10);
    if (n >= 1 && n <= SOAL_CACHE_MAX_CHUNKS) {
      const keys = [];
      for (let i = 0; i < n; i++) keys.push('soalbank:' + i);
      const got = cache.getAll(keys);
      let json = '';
      let complete = true;
      for (let i = 0; i < n; i++) {
        const part = got['soalbank:' + i];
        if (part == null) { complete = false; break; }
        json += part;
      }
      if (complete) {
        try { return JSON.parse(json); } catch (err) { /* cache rusak -> baca ulang dari sheet */ }
      }
    }
  }

  const bank = readSoalFromSheet(ss);

  try {
    const json = JSON.stringify(bank);
    const chunks = Math.ceil(json.length / SOAL_CACHE_CHUNK);
    if (chunks >= 1 && chunks <= SOAL_CACHE_MAX_CHUNKS) {
      const put = {};
      for (let i = 0; i < chunks; i++) {
        put['soalbank:' + i] = json.slice(i * SOAL_CACHE_CHUNK, (i + 1) * SOAL_CACHE_CHUNK);
      }
      put['soalbank:meta'] = String(chunks);
      cache.putAll(put, SOAL_CACHE_TTL);
    }
  } catch (err) {
    // cache gagal tidak fatal: soal tetap dilayani dari hasil baca sheet
  }
  return bank;
}

function readSoalFromSheet(ss) {
  const sheet = ss.getSheetByName('Soal');
  if (!sheet) throw new Error('Tab "Soal" tidak ditemukan');
  const data = sheet.getDataRange().getValues();
  const bank = [];
  const seen = {};
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (String(r[9] == null ? '' : r[9]).trim().toLowerCase() !== 'ya') continue;

    const id = String(r[0] == null ? '' : r[0]).trim();
    const materi = String(r[1] == null ? '' : r[1]).trim().toLowerCase();
    const tipe = String(r[2] == null ? '' : r[2]).trim().toLowerCase();
    const q = String(r[3] == null ? '' : r[3]).trim();
    const kunci = String(r[7] == null ? '' : r[7]).trim().toUpperCase();
    if (!id || !q || seen[id]) continue;
    if (tipe !== 'kasus' && tipe !== 'jebakan') continue;

    // Opsi kosong dilewati, tapi huruf kunci (A/B/C) tetap dipetakan ke kolom aslinya
    const opts = [];
    let keyIdx = -1;
    const keyLetter = ['A', 'B', 'C'].indexOf(kunci);
    for (let c = 4; c <= 6; c++) {
      const t = String(r[c] == null ? '' : r[c]).trim();
      if (t === '') continue;
      if (c - 4 === keyLetter) keyIdx = opts.length;
      opts.push(t);
    }
    const expectedOpts = (tipe === 'jebakan') ? 2 : 3;
    if (opts.length !== expectedOpts || keyIdx < 0) {
      Logger.log('Soal ' + id + ' dilewati: jumlah opsi atau kunci tidak valid');
      continue;
    }
    seen[id] = true;
    bank.push({ id: id, materi: materi, tipe: tipe, q: q, opts: opts, key: keyIdx });
  }
  return bank;
}

// Jalankan MANUAL dari editor Apps Script setelah mengedit soal di sheet "Soal"
function clearSoalCache() {
  const cache = CacheService.getScriptCache();
  const keys = ['soalbank:meta'];
  for (let i = 0; i < SOAL_CACHE_MAX_CHUNKS; i++) keys.push('soalbank:' + i);
  cache.removeAll(keys);
  Logger.log('Cache bank soal dihapus. startExam berikutnya membaca ulang sheet "Soal".');
}

function shuffleArray(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Susun satu ujian: tiap materi 2 kasus + 1 jebakan (acak, tanpa duplikat), urutan 21 soal
// diacak, posisi pilihan diacak. Return { questions: [{q, options}], keys: [posisiKunci] }
function buildExam(bank) {
  const picked = [];
  for (let m = 0; m < EXAM_MATERI.length; m++) {
    const materi = EXAM_MATERI[m];
    const kasus = bank.filter(function (s) { return s.materi === materi && s.tipe === 'kasus'; });
    const jebakan = bank.filter(function (s) { return s.materi === materi && s.tipe === 'jebakan'; });
    if (kasus.length < EXAM_KASUS_PER_MATERI || jebakan.length < EXAM_JEBAKAN_PER_MATERI) {
      throw new Error('bank soal tidak lengkap untuk materi ' + materi);
    }
    shuffleArray(kasus).slice(0, EXAM_KASUS_PER_MATERI).forEach(function (s) { picked.push(s); });
    shuffleArray(jebakan).slice(0, EXAM_JEBAKAN_PER_MATERI).forEach(function (s) { picked.push(s); });
  }

  const questions = [];
  const keys = [];
  shuffleArray(picked).forEach(function (s) {
    const order = shuffleArray(s.opts.map(function (text, idx) { return { text: text, idx: idx }; }));
    let keyPos = -1;
    order.forEach(function (o, pos) { if (o.idx === s.key) keyPos = pos; });
    questions.push({ q: s.q, options: order.map(function (o) { return o.text; }) });
    keys.push(keyPos);
  });
  return { questions: questions, keys: keys };
}

// action=startExam
// Balasan HANYA examId + soal (teks pertanyaan & teks pilihan, sudah diacak).
// Tidak ada kunci, penjelasan, ID soal, tipe, atau materi.
function handleStartExam(ss) {
  let exam;
  try {
    exam = buildExam(getSoalBank(ss));
  } catch (err) {
    return jsonOutput({ status: 'error', error: err.message });
  }
  if (exam.questions.length !== EXAM_TOTAL) {
    return jsonOutput({ status: 'error', error: 'Jumlah soal ujian tidak sesuai' });
  }

  const examId = Utilities.getUuid();
  CacheService.getScriptCache().put('exam:' + examId, JSON.stringify(exam.keys), EXAM_SESSION_TTL);
  return jsonOutput({ status: 'success', examId: examId, questions: exam.questions });
}

// POST submitExam: { examId, answers: [21 angka indeks pilihan pada urutan yang diterima klien] }
// Balasan: skor, total, passed (+ certToken kalau lulus). Tidak ada info soal mana yang benar/salah.
function handleSubmitExam(body) {
  const examId = (body.examId == null ? '' : body.examId).toString().trim().toLowerCase();
  if (!EXAM_ID_REGEX.test(examId)) {
    return jsonOutput({ status: 'expired' });
  }
  if (!Array.isArray(body.answers)) {
    return jsonOutput({ status: 'error', error: 'Jawaban tidak valid' });
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return jsonOutput({ status: 'error', error: 'Server sedang sibuk, coba lagi' });
  }

  try {
    const cache = CacheService.getScriptCache();

    // Kirim ulang examId yang sama -> hasil yang sama (respons sebelumnya mungkin hilang)
    const savedResult = cache.get('result:' + examId);
    if (savedResult) {
      return ContentService.createTextOutput(savedResult).setMimeType(ContentService.MimeType.JSON);
    }

    const session = cache.get('exam:' + examId);
    if (!session) {
      return jsonOutput({ status: 'expired' });
    }
    let keys;
    try { keys = JSON.parse(session); } catch (err) { keys = null; }
    if (!Array.isArray(keys) || keys.length !== EXAM_TOTAL) {
      return jsonOutput({ status: 'expired' });
    }

    // Jawaban kosong / bukan bilangan bulat / di luar jangkauan = salah
    let score = 0;
    for (let i = 0; i < EXAM_TOTAL; i++) {
      const a = body.answers[i];
      if (typeof a === 'number' && Math.floor(a) === a && a === keys[i]) score++;
    }
    const passed = score >= EXAM_PASS_MIN;

    const result = { status: 'success', score: score, total: EXAM_TOTAL, passed: passed };
    if (passed) {
      const certToken = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
      result.certToken = certToken;
      cache.put('cert:' + certToken, JSON.stringify({ score: score, usedId: null }), CERT_TOKEN_TTL);
    }

    const out = JSON.stringify(result);
    cache.put('result:' + examId, out, EXAM_RESULT_TTL);
    cache.remove('exam:' + examId);   // sesi sekali pakai
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// ---------- SERTIFIKAT BELAJAR: SIMPAN & VERIFIKASI ----------
// ID dibuat di sisi browser dengan format KAPAZZ-BTC-YYYYMMDD-XXXX
const CERT_ID_REGEX = /^KAPAZZ-BTC-\d{8}-[A-Z0-9]{4}$/;

function getOrCreateCertificatesSheet(ss) {
  let sheet = ss.getSheetByName('Certificates');
  if (!sheet) {
    sheet = ss.insertSheet('Certificates');
    sheet.appendRow(['ID', 'Nama', 'Tanggal Terbit', 'Jumlah Modul', 'Timestamp Server', 'Skor Ujian', 'Nilai Akhir']);
  } else {
    // Sheet lama (5 kolom): isi judul 2 kolom baru di akhir kalau masih kosong
    if (sheet.getRange(1, 6).getValue() === '') sheet.getRange(1, 6).setValue('Skor Ujian');
    if (sheet.getRange(1, 7).getValue() === '') sheet.getRange(1, 7).setValue('Nilai Akhir');
  }
  return sheet;
}

// Skor ujian valid = bilangan bulat 16 sampai 21 (standar lulus 16 dari 21 soal)
function parseCertScore(value) {
  const text = (value == null ? '' : value).toString().trim();
  if (!/^\d+$/.test(text)) return null;
  const n = parseInt(text, 10);
  return (n >= 16 && n <= 21) ? n : null;
}

// Nilai akhir dihitung di SERVER (skor/21*100, satu desimal); nilai dari browser diabaikan
function calcFinalScore(score) {
  return Math.round(score / 21 * 1000) / 10;
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

// action=saveCertificate&id=...&nama=...&tanggalTerbit=...&jumlahModul=8&certToken=...
// certToken didapat dari submitExam (hanya kalau lulus). Skor DIAMBIL DARI RECORD TOKEN di
// server; parameter skor dari browser diabaikan sepenuhnya.
function handleSaveCertificate(ss, e) {
  const id = (e.parameter.id || '').toString().trim().toUpperCase();
  const nama = cleanCertText(e.parameter.nama, 30);
  const tanggal = cleanCertText(e.parameter.tanggalTerbit, 40);
  const certToken = (e.parameter.certToken || '').toString().trim().toLowerCase();
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
  if (!CERT_TOKEN_REGEX.test(certToken)) {
    return jsonOutput({ status: 'invalid_token', error: 'Token sertifikat tidak valid atau sudah kedaluwarsa' });
  }

  // Kunci supaya 2 permintaan bersamaan tidak lolos dari cek duplikat / pemakaian token
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return jsonOutput({ status: 'error', error: 'Server sedang sibuk, coba lagi' });
  }

  try {
    const cache = CacheService.getScriptCache();
    const raw = cache.get('cert:' + certToken);
    let rec = null;
    if (raw) {
      try { rec = JSON.parse(raw); } catch (err) { rec = null; }
    }
    if (!rec) {
      return jsonOutput({ status: 'invalid_token', error: 'Token sertifikat tidak valid atau sudah kedaluwarsa' });
    }

    // Token sudah terpakai: ID sama = permintaan ulang (idempoten, sukses); ID beda = ditolak
    if (rec.usedId) {
      if (rec.usedId === id) return jsonOutput({ status: 'success' });
      return jsonOutput({ status: 'invalid_token', error: 'Token sertifikat sudah dipakai' });
    }

    const skor = parseCertScore(rec.score);
    if (skor === null) {
      return jsonOutput({ status: 'invalid_token', error: 'Token sertifikat tidak valid' });
    }
    const nilaiAkhir = calcFinalScore(skor);

    const sheet = getOrCreateCertificatesSheet(ss);

    // ID sudah ada -> balas "duplicate" supaya browser bikin ID baru (token belum terpakai)
    if (findCertificateRow(sheet, id) > 0) {
      return jsonOutput({ status: 'duplicate' });
    }

    const row = sheet.getLastRow() + 1;
    sheet.getRange(row, 2, 1, 2).setNumberFormat('@'); // Nama & Tanggal disimpan sebagai teks murni
    sheet.getRange(row, 1, 1, 7).setValues([[id, nama, tanggal, jumlah, new Date(), skor, nilaiAkhir]]);
    sheet.getRange(row, 6).setNumberFormat('0');
    sheet.getRange(row, 7).setNumberFormat('0.0');

    // Token TERPAKAI setelah baris sukses disimpan
    rec.usedId = id;
    cache.put('cert:' + certToken, JSON.stringify(rec), CERT_TOKEN_TTL);
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

  const r = sheet.getRange(row, 1, 1, 7).getValues()[0];
  let tanggal = r[2];
  if (tanggal instanceof Date) {
    tanggal = Utilities.formatDate(tanggal, Session.getScriptTimeZone(), 'd MMMM yyyy');
  }

  // Sertifikat lama tidak punya skor (kolom kosong) -> skor & nilaiAkhir = null, tetap valid
  const skor = parseCertScore(r[5]);
  let nilaiAkhir = null;
  if (skor !== null) {
    nilaiAkhir = (r[6] !== '' && !isNaN(Number(r[6]))) ? Number(r[6]) : calcFinalScore(skor);
  }

  return jsonOutput({
    found: true,
    nama: r[1].toString(),
    tanggalTerbit: tanggal.toString(),
    jumlahModul: Number(r[3]) || 8,
    skor: skor,
    nilaiAkhir: nilaiAkhir
  });
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
