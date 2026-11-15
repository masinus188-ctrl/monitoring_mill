<?php
// API JSON dashboard: semua data dibaca langsung dari MySQL (database monitoring_mill)
require __DIR__ . '/auth.php';
header('Content-Type: application/json; charset=utf-8');
try {
    $db = pdo();
    $a = $_GET['a'] ?? 'meta';
    $in = json_decode(file_get_contents('php://input'), true) ?: [];
    if ($a === 'login') {   // login via JSON {username, password}
        $st = $db->prepare('SELECT * FROM users WHERE username=? AND aktif=1'); $st->execute([trim($in['username'] ?? '')]); $r = $st->fetch();
        if (!$r || !password_verify($in['password'] ?? '', $r['pass_hash'])) { http_response_code(401); echo json_encode(['error' => 'Username atau password salah.']); exit; }
        session_regenerate_id(true);
        $_SESSION['u'] = ['id' => $r['id'], 'username' => $r['username'], 'nama' => $r['nama'], 'role' => $r['role'], 'reg' => (int)$r['reg'], 'mill' => $r['mill'] ?? ''];
        $_SESSION['csrf'] = bin2hex(random_bytes(16)); echo json_encode(['ok' => true]); exit;
    }
    if ($a === 'logout') { session_destroy(); echo json_encode(['ok' => true]); exit; }
    $u = need_user(true);
    function q($sql, $p = []) { global $db; $s = $db->prepare($sql); $s->execute($p); return $s->fetchAll(); }

    $a = $_GET['a'] ?? 'meta';
    $yrs = array_column(q('SELECT DISTINCT tahun FROM v_harian ORDER BY tahun DESC'), 'tahun');
    $T = (int)($_GET['tahun'] ?? $yrs[0]);
    $B = (int)($_GET['bulan'] ?? 0);
    $R = (int)($_GET['reg'] ?? 0);
    $M = preg_replace('/[^A-Z]/', '', strtoupper($_GET['mill'] ?? ''));
    if ($u['reg']) $R = (int)$u['reg'];   // hak akses: dipaksa sesuai akun
    if ($u['mill']) $M = $u['mill'];
    $last = q('SELECT MAX(tanggal) d FROM produksi_harian WHERE YEAR(tanggal)=? AND inti+plasma+afiliasi+pihak3>0', [$T])[0]['d'];
    $lm  = $last ? (int)date('n', strtotime($last)) : 0;                       // bulan data terakhir
    $fac = $last ? (int)date('j', strtotime($last)) / (int)date('t', strtotime($last)) : 1; // prorata target bulan berjalan
    $tf  = "IF(t.bulan=$lm," . round($fac, 6) . ',1)';

    // filter: $al = alias tabel (tahun,bulan), $rc = kolom reg, $mc = kolom mill
    function F($al, $rc, $mc, $mon = true) {
        global $T, $B, $R, $M, $lm;
        $w = ["$al.tahun=?", "$al.bulan<=?"]; $p = [$T, $lm];
        if ($B && $mon) { $w[] = "$al.bulan=?"; $p[] = $B; }
        if ($R) { $w[] = "$rc=?"; $p[] = $R; }
        if ($M) { $w[] = "$mc=?"; $p[] = $M; }
        return [implode(' AND ', $w), $p];
    }
    function d($x, $y) { return $y > 0 ? $x / $y : null; }

    if ($a === 'meta') {
        echo json_encode(['tahun' => $yrs, 'mills' => q('SELECT kode, reg, grup FROM mill WHERE (?=0 OR reg=?) AND (?="" OR kode=?) ORDER BY reg, kode', [$u['reg'], $u['reg'], $u['mill'], $u['mill']]), 'last' => $last, 'lm' => $lm, 'user' => $u['nama'], 'role' => $u['role'], 'csrf' => csrf()]);

    } elseif ($a === 'ringkas') {
        [$w, $p] = F('h', 'h.reg', 'h.mill');
        $rows = q("SELECT h.mill, h.reg, h.grup, MAX(h.kapasitas) kap, SUM(tbs_masuk) masuk, SUM(tbs_olah) olah, SUM(cpo) cpo, SUM(kernel) kernel,
            SUM(jam_olah) jam, SUM(hari_olah) hki, SUM(tbs_olah>0) hke, AVG(NULLIF(oil_losses,0)) ol, AVG(NULLIF(kernel_losses,0)) kl
            FROM v_harian h WHERE $w GROUP BY h.mill, h.reg ORDER BY h.reg, h.mill", $p);
        [$w, $p] = F('t', 'm.reg', 't.mill');
        $tg = array_column(q("SELECT t.mill, SUM(t.tbs_olah*$tf) olah, SUM(t.cpo*$tf) cpo, SUM(t.kernel*$tf) kernel, SUM(t.hke*$tf) hki,
            AVG(t.oil_losses) ol, AVG(t.kernel_losses) kl,
            SUM((t.biaya_langsung+t.biaya_tak_langsung)*$tf) biaya FROM target_bulanan t JOIN mill m ON m.kode=t.mill WHERE $w GROUP BY t.mill", $p), null, 'mill');
        [$w, $p] = F('b', 'm.reg', 'b.mill');
        $bi = array_column(q("SELECT b.mill, SUM(b.biaya_langsung) biaya_langsung, SUM(b.biaya_tak_langsung) biaya_tak_langsung FROM biaya_bulanan b JOIN mill m ON m.kode=b.mill WHERE $w GROUP BY b.mill", $p), null, 'mill');
        $tot = ['mill' => 'TOTAL', 'masuk' => 0, 'olah' => 0, 'cpo' => 0, 'kernel' => 0, 'jam' => 0, 'kapx' => 0, 't_kapx' => 0, 't_olah' => 0, 't_cpo' => 0, 't_kernel' => 0, 'biaya_langsung' => 0, 'biaya_tak_langsung' => 0, 'biaya' => 0, 't_biaya' => 0, 'ol' => [], 'kl' => [], 't_ol' => [], 't_kl' => [], 'cnt' => 0];
        foreach ($rows as &$r) {
            $t = $tg[$r['mill']] ?? [];
            foreach (['masuk', 'olah', 'cpo', 'kernel', 'jam', 'hki', 'hke', 'kap', 'ol', 'kl'] as $k) $r[$k] = $r[$k] === null ? null : (float)$r[$k];
            $r['biaya_langsung'] = isset($bi[$r['mill']]['biaya_langsung']) ? (float)$bi[$r['mill']]['biaya_langsung'] : null;
            $r['biaya_tak_langsung'] = isset($bi[$r['mill']]['biaya_tak_langsung']) ? (float)$bi[$r['mill']]['biaya_tak_langsung'] : null;
            $r['biaya'] = $r['biaya_langsung'] !== null || $r['biaya_tak_langsung'] !== null
                ? ($r['biaya_langsung'] ?? 0) + ($r['biaya_tak_langsung'] ?? 0) : null;
            $r['t_olah'] = isset($t['olah']) ? (float)$t['olah'] : null; $r['t_cpo'] = isset($t['cpo']) ? (float)$t['cpo'] : null;
            $r['t_kernel'] = isset($t['kernel']) ? (float)$t['kernel'] : null; $r['t_hki'] = isset($t['hki']) ? (float)$t['hki'] : null;
            $r['t_ol'] = isset($t['ol']) ? (float)$t['ol'] : null; $r['t_kl'] = isset($t['kl']) ? (float)$t['kl'] : null;
            $r['t_biaya'] = isset($t['biaya']) ? (float)$t['biaya'] : null;
            $r['oer'] = d($r['cpo'] * 100, $r['olah']); $r['ker'] = d($r['kernel'] * 100, $r['olah']);
            $r['t_oer'] = d(($r['t_cpo'] ?? 0) * 100, $r['t_olah']); $r['t_ker'] = d(($r['t_kernel'] ?? 0) * 100, $r['t_olah']);
            $r['kap_olah'] = d($r['olah'], $r['jam']); $r['util'] = d($r['olah'] * 100, 20 * $r['kap'] * $r['hki']);
            $r['ach'] = d($r['olah'] * 100, $r['t_olah']);
            $r['t_util'] = d(($r['t_olah'] ?? 0) * 100, 20 * $r['kap'] * ($r['t_hki'] ?? 0));
            $r['cost_tbs'] = d($r['biaya'] ?? 0, $r['olah']); $r['cost_pp'] = d($r['biaya'] ?? 0, $r['cpo'] + $r['kernel']);
            foreach (['masuk', 'olah', 'cpo', 'kernel', 'jam', 'biaya_langsung', 'biaya_tak_langsung', 'biaya', 't_olah', 't_cpo', 't_kernel', 't_biaya'] as $k) $tot[$k] += $r[$k] ?? 0;
            $tot['kapx'] += $r['kap'] * $r['hki'];
            $tot['t_kapx'] += $r['kap'] * ($r['t_hki'] ?? 0);
            foreach (['ol', 'kl', 't_ol', 't_kl'] as $k) if ($r[$k] !== null) $tot[$k][] = $r[$k];
        }
        unset($r);
        $av = fn($x) => $x ? array_sum($x) / count($x) : null;
        $tot['ol'] = $av($tot['ol']); $tot['kl'] = $av($tot['kl']); $tot['t_ol'] = $av($tot['t_ol']); $tot['t_kl'] = $av($tot['t_kl']);
        $tot['oer'] = d($tot['cpo'] * 100, $tot['olah']); $tot['ker'] = d($tot['kernel'] * 100, $tot['olah']);
        $tot['t_oer'] = d($tot['t_cpo'] * 100, $tot['t_olah']); $tot['util'] = d($tot['olah'] * 100, 20 * $tot['kapx']);
        $tot['t_util'] = d($tot['t_olah'] * 100, 20 * $tot['t_kapx']);
        $tot['t_ker'] = d($tot['t_kernel'] * 100, $tot['t_olah']);
        $tot['ach'] = d($tot['olah'] * 100, $tot['t_olah']); $tot['cost_tbs'] = d($tot['biaya'], $tot['olah']);
        $tot['cost_pp'] = d($tot['biaya'], $tot['cpo'] + $tot['kernel']);
        $tot['t_cost_tbs'] = d($tot['t_biaya'], $tot['t_olah']); unset($tot['kapx'], $tot['t_kapx'], $tot['cnt']);
        echo json_encode(['last' => $last, 'mills' => $rows, 'total' => $tot]);

    } elseif ($a === 'supplier') {
        [$w, $p] = F('h', 'h.reg', 'h.mill');
        $rows = q("SELECT h.mill, h.reg, SUM(h.inti) inti, SUM(h.plasma) plasma, SUM(h.afiliasi) afiliasi, SUM(h.pihak3) pihak3
            FROM v_harian h WHERE $w GROUP BY h.mill, h.reg ORDER BY h.reg, h.mill", $p);
        $total = ['inti' => 0, 'plasma' => 0, 'afiliasi' => 0, 'pihak3' => 0];
        foreach ($rows as &$row) {
            foreach (['inti', 'plasma', 'afiliasi', 'pihak3'] as $key) {
                $row[$key] = (float)$row[$key];
                $total[$key] += $row[$key];
            }
        }
        unset($row);
        echo json_encode(['mills' => $rows, 'total' => $total]);

    } elseif ($a === 'tbs_budget') {
        [$wa, $pa] = F('h', 'h.reg', 'h.mill', false);
        $actual = q("SELECT h.bulan, SUM(h.tbs_masuk) masuk, SUM(h.tbs_olah) olah
            FROM v_harian h WHERE $wa GROUP BY h.bulan ORDER BY h.bulan", $pa);
        [$ws, $ps] = F('h', 'h.reg', 'h.mill');
        $summaryActual = q("SELECT COALESCE(SUM(h.tbs_masuk),0) masuk, COALESCE(SUM(h.tbs_olah),0) olah FROM v_harian h WHERE $ws", $ps)[0];
        [$wb, $pb] = F('t', 'm.reg', 't.mill', false);
        $annualWhere = preg_replace('/t\.bulan<=\?/', '1=1', $wb); $annualParams = $pb; array_splice($annualParams, 1, 1);
        $budget = q("SELECT t.bulan, COUNT(*) jumlah, SUM(COALESCE(t.inti,0)+COALESCE(t.plasma,0)+COALESCE(t.afiliasi,0)+COALESCE(t.pihak3,0)) masuk,
            SUM(t.tbs_olah) olah FROM target_bulanan t JOIN mill m ON m.kode=t.mill WHERE $annualWhere GROUP BY t.bulan ORDER BY t.bulan", $annualParams);
        [$wbs, $pbs] = F('t', 'm.reg', 't.mill');
        $summaryBudget = q("SELECT COUNT(*) jumlah, SUM((COALESCE(t.inti,0)+COALESCE(t.plasma,0)+COALESCE(t.afiliasi,0)+COALESCE(t.pihak3,0))*$tf) masuk,
            SUM(t.tbs_olah*$tf) olah FROM target_bulanan t JOIN mill m ON m.kode=t.mill WHERE $wbs", $pbs)[0];
        $annual = q("SELECT COUNT(*) jumlah, SUM(COALESCE(t.inti,0)+COALESCE(t.plasma,0)+COALESCE(t.afiliasi,0)+COALESCE(t.pihak3,0)) masuk,
            SUM(t.tbs_olah) olah FROM target_bulanan t JOIN mill m ON m.kode=t.mill WHERE $annualWhere", $annualParams)[0];
        echo json_encode(['actual' => $actual, 'budget' => $budget, 'summaryActual' => $summaryActual, 'summaryBudget' => $summaryBudget, 'annualBudget' => $annual, 'lastMonth' => $lm]);

    } elseif ($a === 'harian') {
        [$w, $p] = F('h', 'h.reg', 'h.mill');
        echo json_encode(q("SELECT h.tanggal, SUM(h.tbs_masuk) masuk, SUM(h.tbs_olah) olah, SUM(h.cpo) cpo,
            IF(SUM(h.tbs_olah)>0, SUM(h.cpo)/SUM(h.tbs_olah)*100, NULL) oer,
            SUM(IF(h.hari_olah>0 AND t.hke>0, t.tbs_olah/t.hke, 0)) target
            FROM v_harian h LEFT JOIN target_bulanan t ON t.mill=h.mill AND t.tahun=h.tahun AND t.bulan=h.bulan
            WHERE $w GROUP BY h.tanggal ORDER BY h.tanggal", $p));

    } elseif ($a === 'bulanan') {
        $out = [];
        foreach ([$T, $T - 1] as $y) {
            $s = $T; $T = $y; [$w, $p] = F('h', 'h.reg', 'h.mill', false); $T = $s;
            $w = preg_replace('/h\.bulan<=\?/', '1=1', $w); array_splice($p, 1, 1);
            $out[$y] = q("SELECT h.bulan, SUM(tbs_olah) olah, SUM(cpo) cpo, SUM(kernel) kernel FROM v_harian h WHERE $w GROUP BY h.bulan ORDER BY h.bulan", $p);
        }
        $s = $T; [$w, $p] = F('t', 'm.reg', 't.mill', false); $w = preg_replace('/t\.bulan<=\?/', '1=1', $w); array_splice($p, 1, 1);
        $tg = q("SELECT t.bulan, SUM(t.tbs_olah) olah, SUM(t.cpo) cpo FROM target_bulanan t JOIN mill m ON m.kode=t.mill WHERE $w GROUP BY t.bulan ORDER BY t.bulan", $p);
        echo json_encode(['aktual' => $out[$T], 'lalu' => $out[$T - 1], 'target' => $tg]);

    } elseif ($a === 'grading') {
        [$w, $p] = F('h', 'h.reg', 'h.mill');
        echo json_encode(q("SELECT h.mill, SUM(jjg_sample) jjg, SUM(jjg_ripe)/SUM(jjg_sample)*100 ripe, SUM(jjg_unripe)/SUM(jjg_sample)*100 unripe,
            SUM(jjg_over)/SUM(jjg_sample)*100 `over`, SUM(jjg_eb)/SUM(jjg_sample)*100 eb, SUM(jjg_bb)/SUM(jjg_sample)*100 bb,
            SUM(jjg_ab)/SUM(jjg_sample)*100 ab, SUM(jjg_tp)/SUM(jjg_sample)*100 tp, SUM(ton_sampah)/SUM(ton_sample)*100 sampah,
            SUM(ton_brondolan)/SUM(ton_sample)*100 brondolan FROM v_harian h WHERE $w GROUP BY h.mill HAVING jjg>0 ORDER BY h.mill", $p));

    } elseif ($a === 'curah_hujan') {
        [$w, $p] = F('h', 'h.reg', 'h.mill');
        echo json_encode(q("SELECT h.tanggal, h.mill, h.reg, h.ch FROM v_harian h WHERE $w ORDER BY h.tanggal DESC, h.reg, h.mill", $p));

    } elseif ($a === 'losses') {
        [$w, $p] = F('h', 'h.reg', 'h.mill');
        $rows = q("SELECT h.mill, AVG(NULLIF(oil_losses,0)) ol, AVG(NULLIF(ol_eb,0)) ol_eb, AVG(NULLIF(ol_sludge,0)) ol_sludge, AVG(NULLIF(ol_wetnut,0)) ol_wetnut,
            AVG(NULLIF(ol_fibre,0)) ol_fibre, AVG(NULLIF(kernel_losses,0)) kl, AVG(NULLIF(kl_cyclone,0)) kl_cyclone, AVG(NULLIF(kl_destoner,0)) kl_destoner,
            AVG(NULLIF(kl_ltds1,0)) kl_ltds1, AVG(NULLIF(kl_ltds2,0)) kl_ltds2, AVG(NULLIF(kl_clhd,0)) kl_clhd FROM v_harian h WHERE $w GROUP BY h.mill ORDER BY h.mill", $p);
        [$w, $p] = F('t', 'm.reg', 't.mill');
        $tg = array_column(q("SELECT t.mill, AVG(t.oil_losses) t_ol, AVG(t.kernel_losses) t_kl FROM target_bulanan t JOIN mill m ON m.kode=t.mill WHERE $w GROUP BY t.mill", $p), null, 'mill');
        foreach ($rows as &$r) $r += $tg[$r['mill']] ?? ['t_ol' => null, 't_kl' => null];
        echo json_encode($rows);
    } elseif ($a === 'heatmap') {
        $B = $B ?: $lm; [$w, $p] = F('h', 'h.reg', 'h.mill');
        echo json_encode(['bulan' => $B, 'hari' => (int)date('t', mktime(0, 0, 0, max($B, 1), 1, $T)),
            'data' => q("SELECT h.mill, DAY(h.tanggal) d, h.tbs_olah olah, IF(h.tbs_olah>0, h.cpo/h.tbs_olah*100, NULL) oer, IF(h.oil_losses>0, h.oil_losses, NULL) ol,
            IF(h.tbs_olah>0, h.tbs_olah/(20*h.kapasitas)*100, NULL) util FROM v_harian h WHERE $w ORDER BY h.mill, h.tanggal", $p)]);

    } elseif ($a === 'alarm') {   // evaluasi hari data terakhir terhadap tabel ambang
        $am = array_column(q('SELECT kode, nilai FROM ambang'), 'nilai', 'kode');
        $rows = q('SELECT m.kode mill, h.tbs_masuk, h.tbs_olah, h.cpo, h.oil_losses, h.kernel_losses, h.tbs_olah/(20*m.kapasitas)*100 util,
            h.jjg_sample, h.jjg_ripe, h.jjg_unripe, h.jjg_ab, h.jjg_eb
            FROM mill m LEFT JOIN v_harian h ON h.mill=m.kode AND h.tanggal=? WHERE (?=0 OR m.reg=?) AND (?="" OR m.kode=?) ORDER BY m.kode', [$last, $R, $R, $M, $M]);
        $al = [];
        foreach ($rows as $r) {
            if ($r['tbs_olah'] === null) { $al[] = ['mill' => $r['mill'], 'metrik' => 'Tidak ada data / pabrik tidak beroperasi', 'nilai' => null, 'batas' => null, 'level' => 'info']; continue; }
            if ((float)$r['tbs_olah'] == 0 && (float)$r['tbs_masuk'] == 0)
                $al[] = ['mill' => $r['mill'], 'metrik' => 'Tidak ada data / pabrik tidak beroperasi', 'nilai' => null, 'batas' => null, 'level' => 'info'];
            $chk = [];
            if ($r['tbs_olah'] > 0) { $chk[] = ['OER', $r['cpo'] / $r['tbs_olah'] * 100, $am['oer_min'] ?? null, -1]; $chk[] = ['Utilitas', $r['util'], $am['util_min'] ?? null, -1]; }
            if ($r['oil_losses'] > 0) $chk[] = ['Oil losses', (float)$r['oil_losses'], $am['ol_max'] ?? null, 1];
            if ($r['kernel_losses'] > 0) $chk[] = ['Kernel losses', (float)$r['kernel_losses'], $am['kl_max'] ?? null, 1];
            foreach ($chk as [$n, $v, $b, $dir]) if ($b !== null && ($dir < 0 ? $v < $b : $v > $b)) $al[] = ['mill' => $r['mill'], 'metrik' => $n, 'nilai' => $v, 'batas' => (float)$b, 'level' => 'bad'];
            if ((float)$r['jjg_sample'] > 0) {
                $checks = [
                    ['Grading matang (ripe)', (float)$r['jjg_ripe'] / $r['jjg_sample'] * 100, 90, -1],
                    ['Grading mentah', (float)$r['jjg_unripe'] / $r['jjg_sample'] * 100, 0, 1],
                    ['Grading abnormal', (float)$r['jjg_ab'] / $r['jjg_sample'] * 100, 5, 1],
                    ['Grading tandan kosong', (float)$r['jjg_eb'] / $r['jjg_sample'] * 100, 0, 1],
                ];
                foreach ($checks as [$n, $v, $b, $dir]) if ($dir < 0 ? $v < $b : $v > $b)
                    $al[] = ['mill' => $r['mill'], 'metrik' => $n, 'nilai' => $v, 'batas' => (float)$b, 'level' => 'bad'];
            }
        }
        echo json_encode(['tanggal' => $last, 'alarm' => $al]);
    } elseif ($a === 'admin_users') {
        if ($u['role'] !== 'admin') { http_response_code(403); echo json_encode(['error' => 'Hanya admin yang dapat melihat daftar user.']); exit; }
        echo json_encode(['users' => q('SELECT id, username, nama, role, reg, mill, aktif FROM users ORDER BY nama, username'), 'currentUserId' => (int)$u['id']]);
    } elseif ($a === 'admin_user_reset_password') {
        if ($u['role'] !== 'admin') { http_response_code(403); echo json_encode(['error' => 'Hanya admin yang dapat mengatur ulang password user.']); exit; }
        if (!hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF'] ?? '')) { http_response_code(419); echo json_encode(['error' => 'Sesi kedaluwarsa, muat ulang halaman.']); exit; }
        $id = filter_var($in['id'] ?? null, FILTER_VALIDATE_INT);
        $password = (string)($in['password'] ?? '');
        if ($id === false || $id === null || $id < 1) { http_response_code(422); echo json_encode(['error' => 'User tidak valid.']); exit; }
        if (strlen($password) < 8) { http_response_code(422); echo json_encode(['error' => 'Password minimal 8 karakter.']); exit; }
        $stmt = $db->prepare('UPDATE users SET pass_hash=? WHERE id=?');
        $stmt->execute([password_hash($password, PASSWORD_DEFAULT), $id]);
        if (!$stmt->rowCount()) {
            if (!q('SELECT id FROM users WHERE id=?', [$id])) { http_response_code(404); echo json_encode(['error' => 'User tidak ditemukan.']); exit; }
        }
        echo json_encode(['ok' => true, 'pesan' => 'Password user berhasil diatur ulang.']);
    } elseif ($a === 'admin_user_delete') {
        if ($u['role'] !== 'admin') { http_response_code(403); echo json_encode(['error' => 'Hanya admin yang dapat menghapus user.']); exit; }
        if (!hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF'] ?? '')) { http_response_code(419); echo json_encode(['error' => 'Sesi kedaluwarsa, muat ulang halaman.']); exit; }
        $id = filter_var($in['id'] ?? null, FILTER_VALIDATE_INT);
        if ($id === false || $id === null || $id < 1) { http_response_code(422); echo json_encode(['error' => 'User tidak valid.']); exit; }
        if ($id === (int)$u['id']) { http_response_code(422); echo json_encode(['error' => 'Anda tidak dapat menghapus akun yang sedang digunakan.']); exit; }
        $db->beginTransaction();
        try {
            $stmt = $db->prepare('SELECT id, role, aktif FROM users WHERE id=? FOR UPDATE');
            $stmt->execute([$id]);
            $target = $stmt->fetch();
            if (!$target) {
                $db->rollBack(); http_response_code(404); echo json_encode(['error' => 'User tidak ditemukan.']); exit;
            }
            if ($target['role'] === 'admin' && (int)$target['aktif'] === 1) {
                $admins = q('SELECT id FROM users WHERE role="admin" AND aktif=1 FOR UPDATE');
                if (count($admins) <= 1) {
                    $db->rollBack(); http_response_code(422); echo json_encode(['error' => 'Admin aktif terakhir tidak dapat dihapus.']); exit;
                }
            }
            $db->prepare('DELETE FROM users WHERE id=?')->execute([$id]);
            $db->commit();
        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            throw $e;
        }
        echo json_encode(['ok' => true, 'pesan' => 'User berhasil dihapus.']);
    } elseif ($a === 'admin_user_create') {
        if ($u['role'] !== 'admin') { http_response_code(403); echo json_encode(['error' => 'Hanya admin yang dapat menambahkan user.']); exit; }
        if (!hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF'] ?? '')) { http_response_code(419); echo json_encode(['error' => 'Sesi kedaluwarsa, muat ulang halaman.']); exit; }
        $username = trim((string)($in['username'] ?? ''));
        $nama = trim((string)($in['nama'] ?? ''));
        $password = (string)($in['password'] ?? '');
        $role = (string)($in['role'] ?? '');
        $reg = filter_var($in['reg'] ?? 0, FILTER_VALIDATE_INT);
        $mill = strtoupper(trim((string)($in['mill'] ?? '')));
        if (!preg_match('/^[A-Za-z0-9._-]{3,40}$/', $username)) { http_response_code(422); echo json_encode(['error' => 'Username harus 3-40 karakter: huruf, angka, titik, garis bawah, atau tanda hubung.']); exit; }
        if ($nama === '' || strlen($nama) > 80) { http_response_code(422); echo json_encode(['error' => 'Nama wajib diisi (maksimal 80 karakter).']); exit; }
        if (strlen($password) < 8) { http_response_code(422); echo json_encode(['error' => 'Password minimal 8 karakter.']); exit; }
        if (!in_array($role, ['admin', 'operator', 'viewer'], true)) { http_response_code(422); echo json_encode(['error' => 'Role tidak valid.']); exit; }
        if ($reg === false || $reg < 0 || $reg > 4) { http_response_code(422); echo json_encode(['error' => 'Region harus 0-4.']); exit; }
        $scopeMill = null;
        if ($role !== 'admin' && $mill !== '') {
            $millRow = q('SELECT kode, reg FROM mill WHERE kode=?', [$mill])[0] ?? null;
            if (!$millRow || ($reg && (int)$millRow['reg'] !== $reg)) { http_response_code(422); echo json_encode(['error' => 'Mill tidak valid untuk region yang dipilih.']); exit; }
            $scopeMill = $millRow['kode']; $reg = (int)$millRow['reg'];
        } elseif ($role === 'admin') {
            $reg = 0;
        }
        if (q('SELECT id FROM users WHERE username=?', [$username])) {
            http_response_code(409); echo json_encode(['error' => 'Username sudah digunakan.']); exit;
        }
        $db->prepare('INSERT INTO users (username,pass_hash,nama,role,reg,mill) VALUES (?,?,?,?,?,?)')
            ->execute([$username, password_hash($password, PASSWORD_DEFAULT), $nama, $role, $reg, $scopeMill]);
        echo json_encode(['ok' => true, 'pesan' => "User $username berhasil ditambahkan dengan role $role."]);
    } elseif ($a === 'input_get' || $a === 'input_save' || $a === 'input_import') {   // form input harian
        if ($u['role'] === 'viewer') { http_response_code(403); echo json_encode(['error' => 'Akun Anda hanya dapat melihat data.']); exit; }
        $keys = ['inti','plasma','afiliasi','pihak3','tbs_olah','restan','cpo','kernel','jam_olah','hari_olah','ch','ton_sample','jjg_sample','jjg_unripe','jjg_over','jjg_eb','jjg_bb','jjg_ab','jjg_tp',
                 'ton_sampah','ton_brondolan','ol_eb','ol_sludge','ol_wetnut','ol_fibre','kl_cyclone','kl_destoner','kl_ltds1','kl_ltds2','kl_clhd'];
        if ($a === 'input_import') {
            if (!hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF'] ?? '')) { http_response_code(419); echo json_encode(['error' => 'Sesi kedaluwarsa, muat ulang halaman.']); exit; }
            $rows = $in['rows'] ?? null;
            if (!is_array($rows) || !$rows || count($rows) > 500) { http_response_code(422); echo json_encode(['error' => 'CSV harus berisi 1–500 baris data.']); exit; }
            $millAccess = $db->prepare('SELECT 1 FROM mill WHERE kode=? AND (?=0 OR reg=?) AND (?="" OR kode=?)');
            $seen = []; $normalizedRows = [];
            foreach ($rows as $index => $row) {
                $line = $index + 2;
                if (!is_array($row) || !is_array($row['values'] ?? null)) { http_response_code(422); echo json_encode(['error' => "Format data pada baris $line tidak valid."]); exit; }
                $mill = strtoupper(trim((string)($row['mill'] ?? '')));
                $tgl = trim((string)($row['tgl'] ?? ''));
                $dt = DateTime::createFromFormat('!Y-m-d', $tgl);
                if (!$dt || $dt->format('Y-m-d') !== $tgl) { http_response_code(422); echo json_encode(['error' => "Tanggal pada baris $line tidak valid; gunakan YYYY-MM-DD."]); exit; }
                $millAccess->execute([$mill, $u['reg'], $u['reg'], $u['mill'], $u['mill']]);
                if (!$millAccess->fetchColumn()) { http_response_code(403); echo json_encode(['error' => "Anda tidak berhak mengakses mill $mill pada baris $line."]); exit; }
                $identity = "$mill|$tgl";
                if (isset($seen[$identity])) { http_response_code(422); echo json_encode(['error' => "Mill dan tanggal duplikat pada baris $line."]); exit; }
                $seen[$identity] = true;
                $values = [];
                foreach ($keys as $key) {
                    $raw = trim((string)($row['values'][$key] ?? ''));
                    if ($raw === '') { $values[$key] = $key === 'hari_olah' ? 1 : 0; continue; }
                    $number = str_replace(',', '.', $raw);
                    if (!is_numeric($number) || abs((float)$number) >= 1e9) { http_response_code(422); echo json_encode(['error' => "Nilai kolom $key pada baris $line tidak valid."]); exit; }
                    $values[$key] = (float)$number;
                }
                $values['hari_olah'] = $values['hari_olah'] ? 1 : 0;
                $normalizedRows[] = [$mill, $tgl, $values];
            }
            $sql = 'INSERT INTO produksi_harian (mill,tanggal,' . implode(',', $keys) . ') VALUES (?,?,' . implode(',', array_fill(0, count($keys), '?')) . ') ON DUPLICATE KEY UPDATE '
                . implode(',', array_map(fn($key) => "$key=VALUES($key)", $keys));
            $stmt = $db->prepare($sql);
            $db->beginTransaction();
            try {
                foreach ($normalizedRows as [$mill, $tgl, $values]) $stmt->execute(array_merge([$mill, $tgl], array_values($values)));
                $db->commit();
            } catch (Throwable $e) {
                if ($db->inTransaction()) $db->rollBack();
                throw $e;
            }
            echo json_encode(['ok' => true, 'pesan' => count($normalizedRows) . ' baris CSV berhasil diimpor.']);
            exit;
        }
        $src = $a === 'input_get' ? $_GET : $in; $mill = (string)($src['mill'] ?? ''); $tgl = (string)($src['tgl'] ?? '');
        $dt = DateTime::createFromFormat('Y-m-d', $tgl);
        if (!$dt || $dt->format('Y-m-d') !== $tgl) { http_response_code(422); echo json_encode(['error' => 'Tanggal tidak valid.']); exit; }
        if (!q('SELECT 1 FROM mill WHERE kode=? AND (?=0 OR reg=?) AND (?="" OR kode=?)', [$mill, $u['reg'], $u['reg'], $u['mill'], $u['mill']])) { http_response_code(403); echo json_encode(['error' => 'Anda tidak berhak mengakses mill ini.']); exit; }
        if ($a === 'input_get') { echo json_encode(['row' => q('SELECT * FROM produksi_harian WHERE mill=? AND tanggal=?', [$mill, $tgl])[0] ?? null]); exit; }
        if (!hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF'] ?? '')) { http_response_code(419); echo json_encode(['error' => 'Sesi kedaluwarsa, muat ulang halaman.']); exit; }
        $v = [];
        foreach ($keys as $k) { $x = str_replace(',', '.', trim((string)($in['values'][$k] ?? ''))); $v[$k] = is_numeric($x) && abs($x) < 1e9 ? (float)$x : 0; }
        $v['hari_olah'] = $v['hari_olah'] ? 1 : 0;
        $db->prepare('INSERT INTO produksi_harian (mill,tanggal,' . implode(',', $keys) . ') VALUES (?,?,' . implode(',', array_fill(0, count($keys), '?')) . ') ON DUPLICATE KEY UPDATE '
            . implode(',', array_map(fn($k) => "$k=VALUES($k)", $keys)))->execute(array_merge([$mill, $tgl], array_values($v)));
        echo json_encode(['ok' => true, 'pesan' => "Data $mill tanggal $tgl tersimpan."]);
    } else { http_response_code(400); echo json_encode(['error' => 'aksi tidak dikenal']); }
} catch (Throwable $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
