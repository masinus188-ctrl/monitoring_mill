<?php
// Sesuaikan dengan server MySQL Anda (atau set environment variable DB_HOST, DB_NAME, DB_USER, DB_PASS)
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_NAME', getenv('DB_NAME') ?: 'monitoring_mill');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
