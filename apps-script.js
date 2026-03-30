/**
 * ============================================================
 *  KPBS PANGALENGAN — Google Apps Script
 *  Salin kode ini ke Google Sheets > Extensions > Apps Script
 * ============================================================
 *
 *  STRUKTUR GOOGLE SHEETS:
 *  Buat 4 sheet tab dengan nama PERSIS seperti berikut:
 *
 *  📋 Sheet 1: "Kegiatan"
 *  Kolom (baris 1 = header):
 *  | judul | tanggal | kategori | deskripsi | youtubeId | fotoUrl | tampilDiHome |
 *
 *  Contoh isi:
 *  | RAK Pemilihan Pengurus | Januari 2025 | Rapat Anggota | Deskripsi... | o8JI_fcrnIw | | TRUE |
 *  | SILASE = SOLUSI | Maret 2025 | Produk | Deskripsi... | Nk9nz7Qurkg | | TRUE |
 *  | Kegiatan Baru | April 2025 | Pelatihan | Deskripsi... | | https://link-foto.jpg | FALSE |
 *
 *  📋 Sheet 2: "Pengurus"
 *  Kolom:
 *  | nama | jabatan | fotoUrl | urutan |
 *
 *  Contoh:
 *  | H. AUN GUNAWAN, SE | Ketua Umum | https://link-foto.jpg | 1 |
 *
 *  📋 Sheet 3: "Statistik"
 *  Kolom:
 *  | label | nilai | kategori |
 *
 *  Contoh:
 *  | Aktif        | 1688 | anggota |
 *  | Aktif Khusus | 336  | anggota |
 *  | Non Aktif    | 69   | anggota |
 *  | Induk        | 6871 | sapi    |
 *  | Dara         | 3658 | sapi    |
 *  | totalAnggota | 4.500+ | umum  |
 *  | totalSapi    | 15.000+ | umum |
 *  | produksiSusu | 20 Juta kg | umum |
 *
 *  📋 Sheet 4: "Pelayanan"
 *  Kolom:
 *  | judul | deskripsi | ikonUrl | urutan |
 *
 * ============================================================
 *  CARA DEPLOY:
 *  1. Buka Google Sheets kamu
 *  2. Klik menu Extensions > Apps Script
 *  3. Hapus kode default, paste kode ini
 *  4. Klik tombol Deploy > New Deployment
 *  5. Pilih type: Web App
 *  6. Execute as: Me
 *  7. Who has access: Anyone  ← penting!
 *  8. Klik Deploy, copy URL yang muncul
 *  9. Paste URL tersebut ke data.js di variabel SHEETS_API_URL
 * ============================================================
 */

function doGet(e) {
  const sheet = e.parameter.sheet || "kegiatan";

  // Allow CORS agar website bisa akses
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ws = ss.getSheetByName(sheet);

    if (!ws) {
      output.setContent(JSON.stringify({ error: `Sheet "${sheet}" tidak ditemukan` }));
      return output;
    }

    const data = ws.getDataRange().getValues();
    if (data.length < 2) {
      output.setContent(JSON.stringify([]));
      return output;
    }

    // Baris pertama = header
    const headers = data[0].map(h => String(h).trim());
    const rows = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Skip baris kosong
      if (row.every(cell => cell === "" || cell === null)) continue;

      const obj = {};
      headers.forEach((h, j) => {
        let val = row[j];
        // Konversi boolean string
        if (val === "TRUE" || val === true) val = true;
        else if (val === "FALSE" || val === false) val = false;
        // Konversi angka
        else if (typeof val === "number") val = val;
        // String bersih
        else val = String(val).trim();
        obj[h] = val;
      });
      rows.push(obj);
    }

    output.setContent(JSON.stringify(rows));
  } catch (err) {
    output.setContent(JSON.stringify({ error: err.message }));
  }

  return output;
}
