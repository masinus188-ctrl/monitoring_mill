<?php
// Pakai: php tools/tambah_user.php USERNAME PASSWORD ROLE[admin|operator|viewer] [REG 0-4] [MILL] [NAMA]
// Contoh: php tools/tambah_user.php budi rahasia123 operator 1 SLM "Budi - PKS SLM"
// Jika username sudah ada, password/role/akses diperbarui (dipakai juga untuk ganti password admin).
require __DIR__ . '/../dashboard/config.php';
[, $un, $pw, $role] = $argv + [null, null, null, 'viewer'];
if (!$un || !$pw || !in_array($role, ['admin', 'operator', 'viewer'])) exit("Pakai: php tools/tambah_user.php USERNAME PASSWORD ROLE [REG] [MILL] [NAMA]\n");
$reg = (int)($argv[4] ?? 0); $mill = ($argv[5] ?? '') ?: null; $nama = $argv[6] ?? $un;
$db = new PDO('mysql:host=' . DB_HOST . ';port=3307;dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$db->prepare('INSERT INTO users (username,pass_hash,nama,role,reg,mill) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE pass_hash=VALUES(pass_hash),nama=VALUES(nama),role=VALUES(role),reg=VALUES(reg),mill=VALUES(mill),aktif=1')
   ->execute([$un, password_hash($pw, PASSWORD_DEFAULT), $nama, $role, $reg, $mill]);
echo "User '$un' ($role, reg=$reg, mill=" . ($mill ?? 'semua') . ") disimpan.\n";
