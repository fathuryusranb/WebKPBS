// ============================================================
//  KPBS PANGALENGAN — DATA dari Google Sheets
//  Ganti URL di bawah dengan URL deploy Apps Script kamu
// ============================================================

var SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbwQLj0yZOhHSsH0mpZJ90pTfgvHQMSLVAN3h-tVWjo0COymyrvdv5ITy5X9eG9Fjho3/exec";

var KPBS = {
  _cache: {},

  _fetch: function(sheet) {
    var self = this;
    if (self._cache[sheet]) return Promise.resolve(self._cache[sheet]);
    return fetch(SHEETS_API_URL + '?sheet=' + sheet)
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        self._cache[sheet] = data;
        return data;
      });
  },

  getKegiatan: function() {
    return this._fetch('kegiatan').then(function(rows) {
      return rows.map(function(r) {
        r.tampilDiHome = (String(r.tampilDiHome).toUpperCase() === 'TRUE');
        return r;
      });
    });
  },

  getPengurus: function() {
    return this._fetch('pengurus').then(function(rows) {
      return rows.slice().sort(function(a, b) {
        return (+a.urutan || 0) - (+b.urutan || 0);
      });
    });
  },

  getPelayanan: function() {
    return this._fetch('pelayanan').then(function(rows) {
      return rows.slice().sort(function(a, b) {
        return (+a.urutan || 0) - (+b.urutan || 0);
      });
    });
  },

  getStatistik: function() {
    return this._fetch('statistik').then(function(rows) {

      function norm(s) { return String(s).toLowerCase().replace(/\s+/g, ''); }

      // Format angka: 25000000 → "25.000.000"
      function fmtAngka(val) {
        var n = parseFloat(String(val).replace(/[^0-9.]/g, ''));
        if (isNaN(n)) return String(val);
        return n.toLocaleString('id-ID');
      }

      var anggota = [], sapi = [], umum = {};

      rows.forEach(function(r) {
        // toleran typo header 'niai' atau 'nilai'
        var nilaiRaw = (r.nilai !== undefined && r.nilai !== null && r.nilai !== '')
          ? r.nilai : r.niai;

        var kat = norm(r.kategori);

        if (kat === 'anggota') {
          anggota.push({ label: r.label, nilai: +nilaiRaw || 0 });

        } else if (kat === 'sapi') {
          sapi.push({ label: r.label, nilai: +nilaiRaw || 0 });

        } else if (kat === 'umum') {
          var key = norm(r.label);
          var val = fmtAngka(nilaiRaw);
          if (key === 'totalanggota') umum.totalAnggota = val;
          if (key === 'totalsapi')    umum.totalSapi    = val;
          if (key === 'produksisusu') umum.produksiSusu = val;
        }
      });

      return { anggota: anggota, sapi: sapi, umum: umum };
    });
  }
};