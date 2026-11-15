<?php
require_once __DIR__ . '/config.php';
session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
function pdo() { static $d; return $d ??= new PDO('mysql:host=' . DB_HOST . ';port=3307;dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]); }
function need_user($api = false) {
    if (empty($_SESSION['u'])) {
        if ($api) { http_response_code(401); header('Content-Type: application/json'); echo '{"error":"belum login"}'; exit; }
        header('Location: login.php'); exit;
    }
    return $_SESSION['u'];
}
function csrf() { return $_SESSION['csrf'] ??= bin2hex(random_bytes(16)); }
function csrf_ok() { return hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? ''); }
function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
