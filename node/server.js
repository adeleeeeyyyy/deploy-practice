// Server Node tanpa paket luar: cukup `node server.js`.
// Ubah isi data diri di node/config.json, tidak perlu menyentuh berkas ini.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(HERE, 'public');
const CONFIG = path.join(HERE, 'config.json');
const PORT = Number(process.env.PORT) || 3080;

const TIPE = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

// Isi config.json dipakai mentah, jadi disaring dulu. Jalur relatif dipakai kalau bisa.
export function tautanBersih(alamat) {
  const a = String(alamat ?? '').trim();
  if (/^(https?:\/\/|mailto:)/i.test(a)) return a;
  if (/^\/[^/]/.test(a)) return a;
  return null;
}

export function profilBersih(daftar) {
  if (!Array.isArray(daftar)) return [];
  return daftar
    .map((p) => ({ label: String(p?.label ?? '').trim(), nilai: String(p?.nilai ?? '').trim() }))
    .filter((p) => p.label !== '' && p.nilai !== '');
}

export function keahlianBersih(daftar) {
  if (!Array.isArray(daftar)) return [];
  return daftar.map((k) => String(k ?? '').trim()).filter((k) => k !== '');
}

export function tautanDaftar(daftar) {
  if (!Array.isArray(daftar)) return [];
  return daftar
    .map((t) => ({ label: String(t?.label ?? '').trim(), alamat: tautanBersih(t?.alamat) }))
    .filter((t) => t.label !== '');
}

function kirim(res, kode, tipe, isi) {
  res.writeHead(kode, { 'content-type': tipe, 'content-length': Buffer.byteLength(isi) });
  res.end(isi);
}

function kirimJson(res, kode, isi) {
  kirim(res, kode, 'application/json; charset=utf-8', JSON.stringify(isi));
}

function apiInfo(res) {
  let konfigurasi;
  try {
    konfigurasi = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  } catch (err) {
    // Keadaan gagal: sebut berkas dan penyebabnya, jangan kirim halaman kosong.
    return kirimJson(res, 500, { pesan: `node/config.json tidak bisa dibaca: ${err.message}` });
  }
  kirimJson(res, 200, {
    nama: konfigurasi.nama ?? '',
    peran: konfigurasi.peran ?? '',
    ringkas: konfigurasi.ringkas ?? '',
    profil: profilBersih(konfigurasi.profil),
    keahlian: keahlianBersih(konfigurasi.keahlian),
    tautan: tautanDaftar(konfigurasi.tautan),
  });
}

// Satu-satunya penjaga jalur berkas: di luar folder public berarti null.
// Buang garis miring di depan dulu, karena resolve() memperlakukannya sebagai akar sendiri.
export function berkasDiPublic(relatif) {
  const target = path.resolve(PUBLIC, String(relatif).replace(/^[/\\]+/, ''));
  return target === PUBLIC || target.startsWith(PUBLIC + path.sep) ? target : null;
}

function berkasStatis(res, relatif) {
  let target;
  try {
    target = berkasDiPublic(decodeURIComponent(relatif));
  } catch {
    return kirim(res, 400, 'text/plain; charset=utf-8', 'Alamat permintaan tidak bisa dibaca.');
  }
  if (!target) {
    return kirim(res, 403, 'text/plain; charset=utf-8', 'Di luar folder public.');
  }
  fs.readFile(target, (err, buf) => {
    if (err) {
      const pesan = err.code === 'ENOENT' ? 'Berkas tidak ada di node/public.' : 'Berkas tidak bisa dibaca.';
      return kirim(res, err.code === 'ENOENT' ? 404 : 500, 'text/plain; charset=utf-8', pesan);
    }
    kirim(res, 200, TIPE[path.extname(target)] ?? 'application/octet-stream', buf);
  });
}

const server = http.createServer((req, res) => {
  const jalur = new URL(req.url, 'http://localhost').pathname;
  if (jalur === '/api/info') return apiInfo(res);
  berkasStatis(res, jalur === '/' ? 'index.html' : jalur);
});

server.on('error', (err) => {
  console.error(`Node gagal jalan di port ${PORT}: ${err.message}`);
  console.error(err.code === 'EADDRINUSE' ? 'Port sedang dipakai proses lain. Jalankan PORT=3081 node server.js lalu sesuaikan proxy_pass di nginx/situs.conf.' : 'Periksa pesan di atas.');
  process.exit(1);
});

// Mode pemeriksaan: node server.js --check
if (process.argv.includes('--check')) {
  const konf = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  assert.equal(profilBersih([{ label: 'Nama', nilai: 'Budi' }, { label: 'Kosong', nilai: '' }]).length, 1);
  assert.equal(profilBersih([{ label: '  ', nilai: 'x' }]).length, 0);
  assert.equal(profilBersih(null).length, 0);
  assert.equal(keahlianBersih(['a', '  ', null]).length, 1);
  assert.equal(keahlianBersih(null).length, 0);
  assert.equal(tautanBersih('mailto:a@b.id'), 'mailto:a@b.id');
  assert.equal(tautanBersih('https://x.id'), 'https://x.id');
  assert.equal(tautanBersih('/static/'), '/static/');
  assert.equal(tautanBersih('github.com/x'), null);
  assert.equal(tautanBersih('javascript:alert(1)'), null);
  assert.equal(tautanBersih(''), null);
  assert.equal(tautanDaftar([{ label: 'GH', alamat: 'github.com/x' }])[0].alamat, null);
  assert.equal(tautanDaftar([{ label: '', alamat: 'https://x.id' }]).length, 0);
  assert.equal(konf.profil.length, profilBersih(konf.profil).length, 'ada baris profil di config.json yang tidak lolos penyaringan');
  // Penjaga jalur berkas: yang penting di dalam public tetap terbaca, yang keluar ditolak.
  assert.equal(berkasDiPublic('/index.html'), path.join(PUBLIC, 'index.html'));
  assert.equal(berkasDiPublic('index.html'), path.join(PUBLIC, 'index.html'));
  assert.equal(berkasDiPublic('/../config.json'), null);
  assert.equal(berkasDiPublic(decodeURIComponent('/..%2fconfig.json')), null);
  assert.equal(berkasDiPublic('/nope.txt'), path.join(PUBLIC, 'nope.txt'));
  console.log(`logika node: semua pemeriksaan lolos (${profilBersih(konf.profil).length} baris profil terbaca dari config.json)`);
  process.exit(0);
}

server.listen(PORT, () => {
  console.log(`node: http://localhost:${PORT}  (config: node/config.json)`);
});
