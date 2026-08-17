// ==================================================
// KAPAZZ BITCOIN - RATING WIDGET BACKEND
// Ditempel di Extensions > Apps Script pada Google Sheet
// "Kapazz Bitcoin Ratings" (sheet bernama "Ratings").
// ==================================================

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ratings');

  // Kalau ada parameter ?rating=1-5 di URL, catat rating baru dulu
  if (e.parameter.rating) {
    const rating = Number(e.parameter.rating);
    if (rating >= 1 && rating <= 5) {
      sheet.appendRow([new Date(), rating]);
    }
  }

  // Hitung rata-rata & jumlah rating, lalu kembalikan sebagai JSON
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

  const result = { average: average, count: count };

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
