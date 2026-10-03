<?php
declare(strict_types=1);

// ===================== GANTI DI SINI =====================
$NAMA = 'Nama Kamu';
$PERAN = 'Peran atau profesi';
$RINGKAS = 'Satu dua baris tentang kamu.';
$PROFIL = [
    'Nama lengkap' => 'Nama Kamu',
    'Peran' => 'Peran atau profesi',
    'Domisili' => 'Kota, negara',
    'Surel' => 'nama@contoh.id',
    'Bahasa' => 'Indonesia, Inggris',
];
$KEAHLIAN = ['Contoh keahlian 1', 'Contoh keahlian 2', 'Contoh keahlian 3'];
// Isi dengan alamat http, mailto, atau jalur di situs ini. Yang masih kosong ditandai
// "belum diisi", bukan jadi tautan mati.
$TAUTAN = ['Surel' => 'mailto:nama@contoh.id', 'GitHub' => '', 'Situs pribadi' => ''];
// =========================================================

/** Menyaring daftar label => nilai. Baris tanpa label atau tanpa isi dibuang. */
function profil_bersih(array $profil): array
{
    $hasil = [];
    foreach ($profil as $label => $nilai) {
        $label = trim((string) $label);
        $nilai = trim((string) $nilai);
        if ($label !== '' && $nilai !== '') {
            $hasil[$label] = $nilai;
        }
    }
    return $hasil;
}

/** Label tautan beserta alamat yang lolos pemeriksaan http, mailto, atau jalur di situs ini. */
function tautan_bersih(array $tautan): array
{
    $hasil = [];
    foreach ($tautan as $label => $alamat) {
        $label = trim((string) $label);
        $alamat = trim((string) $alamat);
        if ($label === '') {
            continue;
        }
        $sah = preg_match('~^(https?://|mailto:)~i', $alamat) === 1 || preg_match('~^/[^/]~', $alamat) === 1;
        $hasil[] = ['label' => $label, 'alamat' => $sah ? $alamat : null];
    }
    return $hasil;
}

// Mode CLI dipakai saat memeriksa logika tanpa web server:
// php php/index.php --check
if (PHP_SAPI === 'cli') {
    assert(profil_bersih(['Nama' => 'Budi', 'Kosong' => '', '  ' => 'x']) === ['Nama' => 'Budi']);
    assert(profil_bersih([]) === []);
    assert(tautan_bersih(['Surel' => 'mailto:a@b.id', 'GH' => 'github.com/x', 'Web' => 'https://x.id'])[2]['alamat'] === 'https://x.id');
    assert(tautan_bersih(['GH' => 'github.com/x'])[0]['alamat'] === null);
    assert(tautan_bersih(['X' => 'javascript:alert(1)'])[0]['alamat'] === null);
    assert(tautan_bersih(['Lokal' => '/php/'])[0]['alamat'] === '/php/');
    assert(tautan_bersih(['' => 'https://x.id']) === []);
    echo "logika halaman php: semua pemeriksaan lolos\n";
    exit(0);
}

$profil = profil_bersih($PROFIL);
$tautan = tautan_bersih($TAUTAN);
$keahlian = array_values(array_filter(array_map(fn ($k): string => trim((string) $k), $KEAHLIAN), fn (string $k): bool => $k !== ''));
$e = static fn (string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $e($NAMA) ?></title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="bar">
  <h1><?= $e($NAMA) ?></h1>
  <div class="bar-note">
    <span><?= $e($PERAN) ?></span>
  </div>
</header>

<main>
  <section>
    <h2>Data diri</h2>
    <p class="ringkas"><?= $e($RINGKAS) ?></p>
    <?php if ($profil === []): ?>
      <p class="muted">Data diri belum diisi.</p>
    <?php else: ?>
      <table>
        <tbody>
          <?php foreach ($profil as $label => $nilai): ?>
            <tr><th scope="row"><?= $e($label) ?></th><td><?= $e($nilai) ?></td></tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    <?php endif; ?>
  </section>

  <section>
    <h2>Keahlian</h2>
    <?php if ($keahlian === []): ?>
      <ul><li class="muted">Belum diisi.</li></ul>
    <?php else: ?>
      <ul>
        <?php foreach ($keahlian as $k): ?>
          <li><?= $e($k) ?></li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>
  </section>

  <section>
    <h2>Tautan</h2>
    <?php if ($tautan === []): ?>
      <ul><li class="muted">Belum diisi.</li></ul>
    <?php else: ?>
      <ul>
        <?php foreach ($tautan as $t): ?>
          <li>
            <?php if ($t['alamat'] !== null): ?>
              <a href="<?= $e($t['alamat']) ?>"><?= $e($t['label']) ?></a>
            <?php else: ?>
              <?= $e($t['label']) ?>: belum diisi
            <?php endif; ?>
          </li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>
  </section>
</main>
</body>
</html>
