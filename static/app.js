// Berkas ini mengisi halaman dari window.SITUS (static/config.js) dan menyalakan tombol tema.
// Tidak perlu diubah saat kamu mengganti isi data diri.
const cfg = window.SITUS || {};

for (const el of document.querySelectorAll('[data-cfg]')) {
  const nilai = cfg[el.dataset.cfg];
  if (typeof nilai === 'string' && nilai.trim()) el.textContent = nilai;
}
if (cfg.nama) document.title = cfg.nama;

// Tabel dibangun lewat DOM, bukan innerHTML, supaya teks dari config tidak menjadi HTML.
const baris = (label, nilai) => {
  const tr = document.createElement('tr');
  const th = document.createElement('th');
  const td = document.createElement('td');
  th.scope = 'row';
  th.textContent = label;
  td.textContent = nilai;
  tr.append(th, td);
  return tr;
};

const profil = Array.isArray(cfg.profil) ? cfg.profil.filter((p) => (p?.label || '').trim()) : [];
const isiProfil = document.getElementById('profil');
for (const p of profil) isiProfil.append(baris(p.label, p.nilai ?? ''));

const keahlian = Array.isArray(cfg.keahlian) ? cfg.keahlian.filter((k) => String(k).trim()) : [];
const isiKeahlian = document.getElementById('keahlian');
if (!keahlian.length) {
  const li = document.createElement('li');
  li.className = 'muted';
  li.textContent = 'Belum diisi.';
  isiKeahlian.append(li);
} else {
  for (const k of keahlian) {
    const li = document.createElement('li');
    li.textContent = k;
    isiKeahlian.append(li);
  }
}

// Tautan hanya jadi <a> kalau alamatnya benar-benar http, mailto, atau jalur di situs ini.
const tautan = Array.isArray(cfg.tautan) ? cfg.tautan.filter((t) => (t?.label || '').trim()) : [];
const isiTautan = document.getElementById('tautan');
const alamatSah = (href) => /^(https?:\/\/|mailto:)/i.test(href || '') || /^\/[^/]/.test(href || '');
if (!tautan.length) {
  const li = document.createElement('li');
  li.className = 'muted';
  li.textContent = 'Belum diisi.';
  isiTautan.append(li);
}
for (const t of tautan) {
  const li = document.createElement('li');
  if (alamatSah(t.href)) {
    const a = document.createElement('a');
    a.href = t.href;
    a.textContent = t.label;
    li.append(a);
  } else {
    li.append(document.createTextNode(`${t.label}: belum diisi`));
  }
  isiTautan.append(li);
}

// Keadaan kosong disebut sekali di bawah ringkasan.
if (!cfg.nama || profil.length === 0) {
  const kosong = document.getElementById('kosong');
  kosong.textContent = !cfg.nama ? 'Nama belum diisi.' : 'Data diri belum diisi.';
  kosong.hidden = false;
}

const tombol = document.getElementById('tema');
function pakaiTema(gelap) {
  document.documentElement.dataset.theme = gelap ? 'dark' : '';
  tombol.setAttribute('aria-pressed', String(gelap));
  tombol.textContent = gelap ? 'Mode terang' : 'Mode gelap';
}
pakaiTema(localStorage.getItem('tema') === 'gelap');
tombol.addEventListener('click', () => {
  const gelap = !document.documentElement.dataset.theme;
  pakaiTema(gelap);
  localStorage.setItem('tema', gelap ? 'gelap' : 'terang');
});
