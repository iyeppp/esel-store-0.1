-- eSeL Store Demo SQL
-- ====================
-- Script ini berisi:
-- 1. Pembuatan tabel utama
-- 2. View pendukung
-- 3. Stored procedure update status transaksi
-- 4. Seed data contoh
--
-- Jalankan di pgAdmin4 pada database yang sudah dibuat (mis.: esel_store)

-- 0. Bersihkan objek lama (opsional)
-- ---------------------------------

DROP VIEW IF EXISTS view_laporan_keuntungan_harian CASCADE;
DROP VIEW IF EXISTS view_detail_transaksi_lengkap CASCADE;

DROP TABLE IF EXISTS tabel_detail_transaksi CASCADE;
DROP TABLE IF EXISTS tabel_transaksi CASCADE;
DROP TABLE IF EXISTS tabel_akun_game_pelanggan CASCADE;
DROP TABLE IF EXISTS tabel_produk CASCADE;
DROP TABLE IF EXISTS tabel_kategori_produk CASCADE;
DROP TABLE IF EXISTS tabel_metode_pembayaran CASCADE;
DROP TABLE IF EXISTS tabel_pelanggan CASCADE;

DROP PROCEDURE IF EXISTS sp_Update_Status_Bayar(INT, VARCHAR);


-- 1. Tabel Utama
-- ---------------

-- 1.1. Tabel Kategori Produk
CREATE TABLE tabel_kategori_produk (
  kategoriid SERIAL PRIMARY KEY,
  nama_kategori VARCHAR(100) NOT NULL UNIQUE,
  membutuhkan_gameid BOOLEAN NOT NULL DEFAULT TRUE
);

-- 1.2. Tabel Produk
CREATE TABLE tabel_produk (
  produkid SERIAL PRIMARY KEY,
  kategoriid INT NOT NULL,
  nama_produk VARCHAR(255) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  harga_modal_aktual DECIMAL(10, 2) NOT NULL DEFAULT 0,
  harga_jual_aktual DECIMAL(10, 2) NOT NULL DEFAULT 0,
  deskripsi TEXT,
  CONSTRAINT fk_produk_kategori
    FOREIGN KEY (kategoriid) REFERENCES tabel_kategori_produk(kategoriid)
);

-- 1.3. Tabel Pelanggan
CREATE TABLE tabel_pelanggan (
  pelangganid SERIAL PRIMARY KEY,
  nama_client VARCHAR(100),
  nomor_hp VARCHAR(20) UNIQUE,
  email VARCHAR(100) UNIQUE,
  tanggal_daftar TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.4. Tabel Metode Pembayaran
CREATE TABLE tabel_metode_pembayaran (
  metodeid SERIAL PRIMARY KEY,
  nama_metode VARCHAR(100) NOT NULL UNIQUE,
  tipe_metode VARCHAR(50) NOT NULL,
  biaya_admin DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- 1.5. Tabel Akun Game Pelanggan
CREATE TABLE tabel_akun_game_pelanggan (
  akungameid SERIAL PRIMARY KEY,
  pelangganid INT NOT NULL,
  kategoriid INT NOT NULL,
  game_userid VARCHAR(100) NOT NULL,
  game_nickname VARCHAR(100),
  server VARCHAR(50),
  CONSTRAINT fk_pelanggan_akun
    FOREIGN KEY (pelangganid) REFERENCES tabel_pelanggan(pelangganid),
  CONSTRAINT fk_kategori_akun
    FOREIGN KEY (kategoriid) REFERENCES tabel_kategori_produk(kategoriid),
  CONSTRAINT uk_pelanggan_game UNIQUE (pelangganid, kategoriid, game_userid)
);

-- 1.6. Tabel Transaksi
CREATE TABLE tabel_transaksi (
  transaksiid SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE,
  pelangganid INT,
  metodeid INT NOT NULL,
  tanggal_transaksi TIMESTAMPTZ NOT NULL DEFAULT now(),
  status_transaksi VARCHAR(50) NOT NULL DEFAULT 'Pending',
  total_struk DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_keuntungan DECIMAL(10, 2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_trans_pelanggan
    FOREIGN KEY (pelangganid) REFERENCES tabel_pelanggan(pelangganid),
  CONSTRAINT fk_trans_metode
    FOREIGN KEY (metodeid) REFERENCES tabel_metode_pembayaran(metodeid)
);

-- 1.7. Tabel Detail Transaksi
CREATE TABLE tabel_detail_transaksi (
  detailid SERIAL PRIMARY KEY,
  transaksiid INT NOT NULL,
  produkid INT NOT NULL,
  akungameid INT,
  jumlah INT NOT NULL DEFAULT 1,
  harga_modal_saat_transaksi DECIMAL(10, 2) NOT NULL DEFAULT 0,
  harga_jual_saat_transaksi DECIMAL(10, 2) NOT NULL DEFAULT 0,
  keuntungan_item DECIMAL(10, 2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_detail_transaksi
    FOREIGN KEY (transaksiid) REFERENCES tabel_transaksi(transaksiid),
  CONSTRAINT fk_detail_produk
    FOREIGN KEY (produkid) REFERENCES tabel_produk(produkid),
  CONSTRAINT fk_detail_akun_game
    FOREIGN KEY (akungameid) REFERENCES tabel_akun_game_pelanggan(akungameid)
);


-- 2. Trigger / Logic Harga & Keuntungan (Sederhana)
-- --------------------------------------------------

-- Trigger ini mengisi harga_modal_saat_transaksi, harga_jual_saat_transaksi,
-- keuntungan_item, serta mengupdate total_struk dan total_keuntungan di
-- tabel_transaksi setiap kali detail transaksi di-insert.

CREATE OR REPLACE FUNCTION fn_after_insert_detail_transaksi()
RETURNS TRIGGER AS $$
DECLARE
  v_harga_modal DECIMAL(10, 2);
  v_harga_jual  DECIMAL(10, 2);
BEGIN
  SELECT harga_modal_aktual, harga_jual_aktual
  INTO v_harga_modal, v_harga_jual
  FROM tabel_produk
  WHERE produkid = NEW.produkid;

  NEW.harga_modal_saat_transaksi := v_harga_modal;
  NEW.harga_jual_saat_transaksi  := v_harga_jual;
  NEW.keuntungan_item := (v_harga_jual - v_harga_modal) * NEW.jumlah;

  UPDATE tabel_transaksi
  SET total_struk = COALESCE(total_struk, 0) + (v_harga_jual * NEW.jumlah),
      total_keuntungan = COALESCE(total_keuntungan, 0) + NEW.keuntungan_item
  WHERE transaksiid = NEW.transaksiid;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_insert_detail_transaksi ON tabel_detail_transaksi;

CREATE TRIGGER trg_after_insert_detail_transaksi
AFTER INSERT ON tabel_detail_transaksi
FOR EACH ROW
EXECUTE FUNCTION fn_after_insert_detail_transaksi();


-- 3. Stored Procedure Update Status Transaksi
-- ------------------------------------------

CREATE OR REPLACE PROCEDURE sp_Update_Status_Bayar(
  p_transaksiid INT,
  p_status VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE tabel_transaksi
  SET status_transaksi = p_status
  WHERE transaksiid = p_transaksiid;

  -- Di sini bisa ditambah logika lain jika diperlukan (mis. catatan audit).
END;
$$;


-- 4. View Pendukung
-- ------------------

-- 4.1. View Laporan Keuntungan Harian
CREATE OR REPLACE VIEW view_laporan_keuntungan_harian AS
SELECT
  DATE(tanggal_transaksi) AS tanggal,
  COUNT(transaksiid) AS jumlah_transaksi_berhasil,
  SUM(total_struk) AS total_omzet,
  SUM(total_keuntungan) AS total_keuntungan_bersih
FROM tabel_transaksi
WHERE status_transaksi = 'Success'
GROUP BY DATE(tanggal_transaksi)
ORDER BY tanggal DESC;


-- 4.2. View Detail Transaksi Lengkap
CREATE OR REPLACE VIEW view_detail_transaksi_lengkap AS
SELECT
  t.invoice_number,
  t.tanggal_transaksi,
  t.status_transaksi,
  COALESCE(p.nama_client, 'Guest') AS nama_pelanggan,
  k.nama_kategori AS game,
  pr.nama_produk,
  d.jumlah,
  COALESCE(ag.game_userid, '-') AS target_uid,
  COALESCE(ag.game_nickname, '-') AS target_nickname,
  m.nama_metode AS pembayaran,
  d.harga_modal_saat_transaksi AS harga_modal_locked,
  d.harga_jual_saat_transaksi AS harga_jual_locked,
  d.keuntungan_item
FROM tabel_detail_transaksi d
JOIN tabel_transaksi t ON d.transaksiid = t.transaksiid
LEFT JOIN tabel_pelanggan p ON t.pelangganid = p.pelangganid
JOIN tabel_produk pr ON d.produkid = pr.produkid
JOIN tabel_kategori_produk k ON pr.kategoriid = k.kategoriid
LEFT JOIN tabel_akun_game_pelanggan ag ON d.akungameid = ag.akungameid
JOIN tabel_metode_pembayaran m ON t.metodeid = m.metodeid;


-- 4.3. View Laporan Per Kategori Game
CREATE OR REPLACE VIEW view_laporan_per_kategori_game AS
SELECT
  k.nama_kategori,
  SUM(d.jumlah) AS total_item_terjual,
  SUM(d.harga_jual_saat_transaksi * d.jumlah) AS total_omzet_kategori,
  SUM(d.keuntungan_item * d.jumlah) AS total_profit_kategori
FROM tabel_detail_transaksi d
JOIN tabel_produk pr ON d.produkid = pr.produkid
JOIN tabel_kategori_produk k ON pr.kategoriid = k.kategoriid
JOIN tabel_transaksi t ON d.transaksiid = t.transaksiid
WHERE t.status_transaksi = 'Success'
GROUP BY k.nama_kategori
ORDER BY total_profit_kategori DESC;


-- 5. Seed Data Contoh
-- -------------------

-- 5.1. Kategori Game
INSERT INTO tabel_kategori_produk (nama_kategori, membutuhkan_gameid) VALUES
  ('Mobile Legends', TRUE),
  ('Genshin Impact', TRUE),
  ('Steam Wallet', FALSE)
ON CONFLICT (nama_kategori) DO NOTHING;

-- 5.2. Produk Contoh
INSERT INTO tabel_produk (kategoriid, nama_produk, sku, harga_modal_aktual, harga_jual_aktual, deskripsi)
SELECT k.kategoriid, p.nama_produk, p.sku, p.harga_modal, p.harga_jual, p.deskripsi
FROM (
  VALUES
    ('Mobile Legends', '86 Diamonds', 'ML-86', 12000, 15000, 'Top up 86 Diamonds Mobile Legends'),
    ('Mobile Legends', '172 Diamonds', 'ML-172', 23000, 28000, 'Top up 172 Diamonds Mobile Legends'),
    ('Genshin Impact', '60 Genesis Crystals', 'GI-60', 12000, 16000, '60 Genesis Crystals'),
    ('Steam Wallet', 'Steam Wallet 50K', 'SW-50', 45000, 50000, 'Voucher Steam Wallet nominal 50.000')
) AS p(nama_kategori, nama_produk, sku, harga_modal, harga_jual, deskripsi)
JOIN tabel_kategori_produk k ON k.nama_kategori = p.nama_kategori
ON CONFLICT (sku) DO NOTHING;

-- 5.3. Metode Pembayaran
INSERT INTO tabel_metode_pembayaran (nama_metode, tipe_metode, biaya_admin) VALUES
  ('QRIS', 'E-Wallet', 1000),
  ('BCA Transfer', 'Bank Transfer', 0),
  ('Dana', 'E-Wallet', 500)
ON CONFLICT (nama_metode) DO NOTHING;

-- 5.4. Pelanggan Contoh (termasuk admin)
INSERT INTO tabel_pelanggan (nama_client, nomor_hp, email) VALUES
  ('Owner eSeL', '081111111111', 'owner@example.com'),
  ('Admin Full', '082222222222', 'administrator@example.com'),
  ('Admin Orders', '083333333333', 'admin_staff@example.com'),
  ('Customer Demo', '084444444444', 'customer@example.com')
ON CONFLICT (email) DO NOTHING;


-- 5.5. Contoh Transaksi Sukses (Opsional)
-- Untuk demo cepat laporan, kita buat satu transaksi sukses secara manual.

-- 1) Ambil beberapa ID yang dibutuhkan (bisa juga dilakukan manual di pgAdmin4)
--    SELECT pelangganid, email FROM tabel_pelanggan;
--    SELECT metodeid, nama_metode FROM tabel_metode_pembayaran;
--    SELECT produkid, nama_produk FROM tabel_produk;

-- Misal kita pakai:
--   pelangganid = 4 (Customer Demo)
--   metodeid    = 1 (QRIS)
--   produkid    = 1 (sesuai data hasil SELECT)

INSERT INTO tabel_transaksi (invoice_number, pelangganid, metodeid, status_transaksi)
VALUES ('DEMO-INV-1', 4, 1, 'Pending')
RETURNING transaksiid;

-- Setelah menjalankan perintah di atas di pgAdmin, catat transaksiid hasil RETURNING
-- lalu gunakan di perintah ini (ganti X dengan nilai sebenarnya):
--
-- INSERT INTO tabel_detail_transaksi (transaksiid, produkid, akungameid, jumlah)
-- VALUES (X, 1, NULL, 1);
--
-- CALL sp_Update_Status_Bayar(X, 'Success');

-- Dengan begitu, View_Laporan_Keuntungan_Harian dan View_Detail_Transaksi_Lengkap
-- akan memiliki minimal satu baris data untuk kebutuhan demo.
