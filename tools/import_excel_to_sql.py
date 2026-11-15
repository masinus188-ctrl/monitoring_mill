#!/usr/bin/env python3
"""Baca Monitoring_Harian_2026 (xlsx) -> hasilkan monitoring_pks.sql (skema + data) untuk MySQL.
Pakai:  python import_excel_to_sql.py Monitoring_Harian_2026_-_Kirim.xlsx ../database/monitoring_pks.sql
Lalu:   mysql -u root -p < monitoring_pks.sql
"""
import sys, datetime as dt
from openpyxl import load_workbook

SRC, OUT = sys.argv[1], sys.argv[2]
wb = load_workbook(SRC, read_only=True, data_only=True)

SCHEMA = """
CREATE DATABASE IF NOT EXISTS monitoring_pks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE monitoring_pks;
SET FOREIGN_KEY_CHECKS=0;
DROP VIEW IF EXISTS v_harian;
DROP TABLE IF EXISTS produksi_harian, target_bulanan, biaya_bulanan, kalender, mill;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE mill (
  kode VARCHAR(10) PRIMARY KEY,
  grup VARCHAR(20) NOT NULL,            -- SSMS / NON SSMS
  reg TINYINT NOT NULL,                 -- region 1-4
  pt VARCHAR(10) NOT NULL,
  kapasitas DECIMAL(8,2) NOT NULL       -- kapasitas olah (ton TBS/jam)
) ENGINE=InnoDB;

-- Data harian per mill (kolom input mentah dari sheet DB / DB_2025; kolom rumus dihitung di v_harian)
CREATE TABLE produksi_harian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mill VARCHAR(10) NOT NULL, tanggal DATE NOT NULL,
  inti DOUBLE NOT NULL DEFAULT 0, plasma DOUBLE NOT NULL DEFAULT 0,
  afiliasi DOUBLE NOT NULL DEFAULT 0, pihak3 DOUBLE NOT NULL DEFAULT 0,
  tbs_olah DOUBLE NOT NULL DEFAULT 0, restan DOUBLE NOT NULL DEFAULT 0,
  cpo DOUBLE NOT NULL DEFAULT 0, kernel DOUBLE NOT NULL DEFAULT 0,
  jam_olah DOUBLE NOT NULL DEFAULT 0, hari_olah TINYINT NOT NULL DEFAULT 0, ch DOUBLE NOT NULL DEFAULT 0,
  ton_sample DOUBLE NOT NULL DEFAULT 0, jjg_sample DOUBLE NOT NULL DEFAULT 0,
  jjg_unripe DOUBLE NOT NULL DEFAULT 0, jjg_over DOUBLE NOT NULL DEFAULT 0, jjg_eb DOUBLE NOT NULL DEFAULT 0,
  jjg_bb DOUBLE NOT NULL DEFAULT 0, jjg_ab DOUBLE NOT NULL DEFAULT 0, jjg_tp DOUBLE NOT NULL DEFAULT 0,
  ton_sampah DOUBLE NOT NULL DEFAULT 0, ton_brondolan DOUBLE NOT NULL DEFAULT 0,
  ol_eb DOUBLE NOT NULL DEFAULT 0, ol_sludge DOUBLE NOT NULL DEFAULT 0,
  ol_wetnut DOUBLE NOT NULL DEFAULT 0, ol_fibre DOUBLE NOT NULL DEFAULT 0,
  kl_cyclone DOUBLE NOT NULL DEFAULT 0, kl_destoner DOUBLE NOT NULL DEFAULT 0,
  kl_ltds1 DOUBLE NOT NULL DEFAULT 0, kl_ltds2 DOUBLE NOT NULL DEFAULT 0, kl_clhd DOUBLE NOT NULL DEFAULT 0,
  UNIQUE KEY uq_mill_tgl (mill, tanggal), KEY ix_tgl (tanggal),
  CONSTRAINT fk_ph_mill FOREIGN KEY (mill) REFERENCES mill(kode)
) ENGINE=InnoDB;

-- Target / budget bulanan (sheet Target)
CREATE TABLE target_bulanan (
  mill VARCHAR(10) NOT NULL, tahun SMALLINT NOT NULL, bulan TINYINT NOT NULL,
  inti DOUBLE, plasma DOUBLE, afiliasi DOUBLE, pihak3 DOUBLE,
  tbs_olah DOUBLE, cpo DOUBLE, kernel DOUBLE, kap_olah DOUBLE, hke TINYINT,
  oil_losses DOUBLE, kernel_losses DOUBLE, biaya_langsung DOUBLE, biaya_tak_langsung DOUBLE,
  PRIMARY KEY (mill, tahun, bulan), CONSTRAINT fk_tb_mill FOREIGN KEY (mill) REFERENCES mill(kode)
) ENGINE=InnoDB;

-- Realisasi biaya bulanan (input di sheet Realisasi untuk 2026, Akt_2025 untuk 2025)
CREATE TABLE biaya_bulanan (
  mill VARCHAR(10) NOT NULL, tahun SMALLINT NOT NULL, bulan TINYINT NOT NULL,
  biaya_langsung DOUBLE, biaya_tak_langsung DOUBLE,
  PRIMARY KEY (mill, tahun, bulan), CONSTRAINT fk_bb_mill FOREIGN KEY (mill) REFERENCES mill(kode)
) ENGINE=InnoDB;

CREATE TABLE kalender (tanggal DATE PRIMARY KEY, is_kerja TINYINT NOT NULL) ENGINE=InnoDB;

-- View: kolom turunan yang di Excel berupa rumus
CREATE VIEW v_harian AS
SELECT p.*, m.grup, m.reg, m.pt, m.kapasitas,
  YEAR(p.tanggal) AS tahun, MONTH(p.tanggal) AS bulan,
  p.inti+p.plasma+p.afiliasi+p.pihak3 AS tbs_masuk,
  p.ol_eb+p.ol_sludge+p.ol_wetnut+p.ol_fibre AS oil_losses,
  p.kl_cyclone+p.kl_destoner+p.kl_ltds1+p.kl_ltds2+p.kl_clhd AS kernel_losses,
  p.jjg_sample-p.jjg_unripe-p.jjg_over-p.jjg_eb-p.jjg_bb-p.jjg_ab AS jjg_ripe
FROM produksi_harian p JOIN mill m ON m.kode=p.mill;
"""

def num(v):
    if isinstance(v, (int, float)): return float(v)
    return 0.0  # None, ' -   ', '-' dll -> 0 (sama seperti Excel)

def lit(v):
    if v is None: return 'NULL'
    if isinstance(v, str): return "'" + v.replace("\\", "\\\\").replace("'", "''") + "'"
    if isinstance(v, (dt.date, dt.datetime)): return "'%s'" % v.strftime('%Y-%m-%d')
    return repr(round(float(v), 8)) if isinstance(v, float) else str(v)

out = open(OUT, 'w', encoding='utf-8')
out.write("-- Dibuat otomatis dari %s\nSET NAMES utf8mb4;\n" % SRC.split('/')[-1])
out.write(SCHEMA)

def insert(table, cols, rows, chunk=400):
    for i in range(0, len(rows), chunk):
        vals = ",\n".join("(" + ",".join(lit(x) for x in r) + ")" for r in rows[i:i+chunk])
        out.write("INSERT INTO %s (%s) VALUES\n%s;\n" % (table, ",".join(cols), vals))

# ---- sheet DB: master mill + fakta harian ----
def read_db(name):
    return [r for r in wb[name].iter_rows(min_row=2, values_only=True) if r[3]]

db26 = read_db('DB')
cap = {r[59]: r[60] for r in wb['DB'].iter_rows(min_row=2, max_row=12, values_only=True) if r[59]}
mills = {}
for r in db26:
    if r[0] and r[3] not in mills:
        mills[r[3]] = (r[3], r[0], int(r[1]), r[2], cap.get(r[3], 0))
insert('mill', ['kode', 'grup', 'reg', 'pt', 'kapasitas'], list(mills.values()))

# kolom Excel (indeks 0) -> kolom tabel
IDX = dict(inti=8, plasma=9, afiliasi=10, pihak3=11, tbs_olah=13, restan=16, cpo=17, kernel=18, jam_olah=21,
           hari_olah=24, ch=25, ton_sample=26, jjg_sample=27, jjg_unripe=29, jjg_over=30, jjg_eb=31, jjg_bb=32,
           jjg_ab=33, jjg_tp=34, ton_sampah=35, ton_brondolan=36, ol_eb=47, ol_sludge=48, ol_wetnut=49,
           ol_fibre=50, kl_cyclone=52, kl_destoner=53, kl_ltds1=54, kl_ltds2=55, kl_clhd=56)
COLS = ['mill', 'tanggal'] + list(IDX)

def fakta(rows, cutoff=None):
    res = []
    for r in rows:
        if r[3] not in mills or not isinstance(r[7], dt.datetime): continue
        if cutoff and r[7] > cutoff: continue
        res.append([r[3], r[7]] + [num(r[i]) for i in IDX.values()])
    return res

rows26 = [r for r in db26 if r[3] in mills]
last = max(r[7] for r in rows26 if isinstance(r[7], dt.datetime) and num(r[12]) > 0)  # tanggal data terakhir
insert('produksi_harian', COLS, fakta(rows26, last))
insert('produksi_harian', COLS, fakta(read_db('DB_2025')))

# ---- sheet Target ----
BULAN = {m: i + 1 for i, m in enumerate('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split())}
tg = []
for r in wb['Target'].iter_rows(min_row=2, values_only=True):
    if r[2] in mills and r[3] in BULAN:
        tg.append([r[2], 2026, BULAN[r[3]]] + [num(r[i]) for i in (5, 6, 7, 8, 10, 11, 12, 16)] +
                  [int(num(r[18])), num(r[21]), num(r[22]), num(r[23]), num(r[24])])
insert('target_bulanan', ['mill', 'tahun', 'bulan', 'inti', 'plasma', 'afiliasi', 'pihak3', 'tbs_olah', 'cpo', 'kernel',
                          'kap_olah', 'hke', 'oil_losses', 'kernel_losses', 'biaya_langsung', 'biaya_tak_langsung'], tg)

# ---- biaya realisasi: Realisasi (2026) + Akt_2025 ----
bb = [[r[2], 2026, int(r[4]), num(r[33]), num(r[34])] for r in wb['Realisasi'].iter_rows(min_row=2, values_only=True)
      if r[2] in mills and isinstance(r[33], (int, float))]
bb += [[r[4], 2025, int(r[6]), num(r[23]), num(r[24])] for r in wb['Akt_2025'].iter_rows(min_row=4, values_only=True)
       if r[4] in mills and isinstance(r[23], (int, float))]
insert('biaya_bulanan', ['mill', 'tahun', 'bulan', 'biaya_langsung', 'biaya_tak_langsung'], bb)

# ---- kalender ----
kal = [[r[1], int(r[5])] for r in wb['Kalender'].iter_rows(min_row=3, values_only=True) if isinstance(r[1], dt.datetime)]
insert('kalender', ['tanggal', 'is_kerja'], kal)
out.close()
print("OK. Tanggal data terakhir 2026:", last.date(), "| mill:", len(mills), "| target:", len(tg), "| biaya:", len(bb))
