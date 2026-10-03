// GANTI NILAI DI SINI. Satu berkas ini yang kamu sentuh; index.html dan app.js tidak perlu diubah.
window.SITUS = {
  nama: 'adeli',
  peran: 'sysadmin',
  judul: 'Data diri',
  ringkas: 'Satu dua baris tentang kamu.',
  profil: [
    { label: 'Nama lengkap', nilai: 'Nama Kamu' },
    { label: 'Peran', nilai: 'Peran atau profesi' },
    { label: 'Domisili', nilai: 'Kota, negara' },
    { label: 'Surel', nilai: 'nama@contoh.id' },
    { label: 'Bahasa', nilai: 'Indonesia, Inggris' }
  ],
  keahlian: ['Contoh keahlian 1', 'Contoh keahlian 2', 'Contoh keahlian 3'],
  // Isi href dengan alamat http atau mailto. Yang masih kosong tampil sebagai "belum diisi", bukan tautan mati.
  tautan: [
    { label: 'Surel', href: 'mailto:nama@contoh.id' },
    { label: 'GitHub', href: '' },
    { label: 'Situs pribadi', href: '' }
  ]
};
