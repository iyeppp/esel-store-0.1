CREATE TABLE Tabel_Kategori_Produk (
    KategoriID SERIAL PRIMARY KEY,
    Nama_Kategori VARCHAR(100) NOT NULL UNIQUE,
    Membutuhkan_GameID BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Tabel_Pelanggan (
    PelangganID SERIAL PRIMARY KEY,
    Nama_Client VARCHAR(100),
    Nomor_HP VARCHAR(20) UNIQUE,
    Email VARCHAR(100) UNIQUE,
    Tanggal_Daftar TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE Tabel_Metode_Pembayaran (
    MetodeID SERIAL PRIMARY KEY,
    Nama_Metode VARCHAR(100) NOT NULL UNIQUE,
    Tipe_Metode VARCHAR(50) NOT NULL, -- Misal: 'E-Wallet', 'Bank Transfer'
    Biaya_Admin DECIMAL(10, 2) NOT NULL DEFAULT 0
);

CREATE TABLE Tabel_Produk (
    ProdukID SERIAL PRIMARY KEY,
    KategoriID INT NOT NULL,
    Nama_Produk VARCHAR(255) NOT NULL,
    SKU VARCHAR(50) UNIQUE,
    Harga_Modal_Aktual DECIMAL(10, 2) NOT NULL DEFAULT 0,
    Harga_Jual_Aktual DECIMAL(10, 2) NOT NULL DEFAULT 0,
    Deskripsi TEXT,
    
    -- Relasi ke Kategori
    CONSTRAINT fk_kategori
        FOREIGN KEY(KategoriID) 
        REFERENCES Tabel_Kategori_Produk(KategoriID)
);

CREATE TABLE Tabel_Akun_Game_Pelanggan (
    AkunGameID SERIAL PRIMARY KEY,
    PelangganID INT NOT NULL,
    KategoriID INT NOT NULL,
    Game_UserID VARCHAR(100) NOT NULL,
    Game_Nickname VARCHAR(100),
    Server VARCHAR(50),
    
    -- Relasi ke Pelanggan
    CONSTRAINT fk_pelanggan
        FOREIGN KEY(PelangganID) 
        REFERENCES Tabel_Pelanggan(PelangganID),
    
    -- Relasi ke Kategori (untuk tahu ini akun game apa)
    CONSTRAINT fk_kategori_akun
        FOREIGN KEY(KategoriID) 
        REFERENCES Tabel_Kategori_Produk(KategoriID),
    
    -- Mencegah 1 pelanggan mendaftarkan ID game yang sama berkali-kali
    UNIQUE(PelangganID, KategoriID, Game_UserID)
);

CREATE TABLE Tabel_Transaksi (
    TransaksiID SERIAL PRIMARY KEY,
    Invoice_Number VARCHAR(50) UNIQUE,
    PelangganID INT, -- Bisa NULL untuk transaksi anonim
    MetodeID INT NOT NULL,
    Tanggal_Transaksi TIMESTAMPTZ NOT NULL DEFAULT now(),
    Status_Transaksi VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Success', 'Failed'
    Total_Struk DECIMAL(10, 2) NOT NULL DEFAULT 0,
    Total_Keuntungan DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Relasi ke Pelanggan (jika ada)
    CONSTRAINT fk_pelanggan_transaksi
        FOREIGN KEY(PelangganID) 
        REFERENCES Tabel_Pelanggan(PelangganID),
    
    -- Relasi ke Metode Pembayaran
    CONSTRAINT fk_metode_pembayaran
        FOREIGN KEY(MetodeID) 
        REFERENCES Tabel_Metode_Pembayaran(MetodeID)
);

CREATE TABLE Tabel_Detail_Transaksi (
    DetailID SERIAL PRIMARY KEY,
    TransaksiID INT NOT NULL,
    ProdukID INT NOT NULL,
    AkunGameID INT, -- Bisa NULL jika produk tidak butuh Game ID (misal: Steam Wallet)
    Jumlah INT NOT NULL DEFAULT 1,
    
    -- Kolom "Snapshot" untuk mengunci harga saat transaksi terjadi
    Harga_Modal_Saat_Transaksi DECIMAL(10, 2) NOT NULL,
    Harga_Jual_Saat_Transaksi DECIMAL(10, 2) NOT NULL,
    Keuntungan_Item DECIMAL(10, 2) NOT NULL,
    
    -- Relasi ke Nota Transaksi
    CONSTRAINT fk_transaksi_detail
        FOREIGN KEY(TransaksiID) 
        REFERENCES Tabel_Transaksi(TransaksiID),
    
    -- Relasi ke Produk yang dibeli
    CONSTRAINT fk_produk_detail
        FOREIGN KEY(ProdukID) 
        REFERENCES Tabel_Produk(ProdukID),
    
    -- Relasi ke Akun Game yang di-topup (jika ada)
    CONSTRAINT fk_akun_game_detail
        FOREIGN KEY(AkunGameID) 
        REFERENCES Tabel_Akun_Game_Pelanggan(AkunGameID)
);

-- View_Detail_Transaksi_Lengkap
CREATE OR REPLACE VIEW View_Detail_Transaksi_Lengkap AS
SELECT 
    t.Invoice_Number,
    t.Tanggal_Transaksi,
    t.Status_Transaksi,
    -- Menampilkan 'Guest' jika PelangganID NULL (Anonim)
    COALESCE(p.Nama_Client, 'Guest') AS Nama_Pelanggan,
    kat.Nama_Kategori AS Game,
    prod.Nama_Produk,
    dt.Jumlah,
    -- Menampilkan Target UID/Nickname, jika kosong ditampilkan '-'
    COALESCE(ag.Game_UserID, '-') AS Target_UID,
    COALESCE(ag.Game_Nickname, '-') AS Target_Nickname,
    mp.Nama_Metode AS Pembayaran,
    -- Menampilkan harga historis yang terkunci (Price Locking)
    dt.Harga_Modal_Saat_Transaksi AS Harga_Modal_Locked, 
    dt.Harga_Jual_Saat_Transaksi AS Harga_Jual_Locked,
    dt.Keuntungan_Item
FROM Tabel_Detail_Transaksi dt
JOIN Tabel_Transaksi t ON dt.TransaksiID = t.TransaksiID
LEFT JOIN Tabel_Pelanggan p ON t.PelangganID = p.PelangganID
JOIN Tabel_Produk prod ON dt.ProdukID = prod.ProdukID
JOIN Tabel_Kategori_Produk kat ON prod.KategoriID = kat.KategoriID
LEFT JOIN Tabel_Akun_Game_Pelanggan ag ON dt.AkunGameID = ag.AkunGameID
JOIN Tabel_Metode_Pembayaran mp ON t.MetodeID = mp.MetodeID;

-- View_Laporan_Keuntungan_Harian
CREATE OR REPLACE VIEW View_Laporan_Keuntungan_Harian AS
SELECT 
    DATE(Tanggal_Transaksi) AS Tanggal,
    COUNT(TransaksiID) AS Jumlah_Transaksi_Berhasil,
    SUM(Total_Struk) AS Total_Omzet,
    SUM(Total_Keuntungan) AS Total_Keuntungan_Bersih
FROM Tabel_Transaksi
WHERE Status_Transaksi = 'Success'
GROUP BY DATE(Tanggal_Transaksi)
ORDER BY Tanggal DESC;

-- View_Laporan_Per_Kategori_Game
CREATE OR REPLACE VIEW View_Laporan_Per_Kategori_Game AS
SELECT 
    kat.Nama_Kategori,
    SUM(dt.Jumlah) AS Total_Item_Terjual,
    SUM(dt.Harga_Jual_Saat_Transaksi * dt.Jumlah) AS Total_Omzet_Kategori,
    SUM(dt.Keuntungan_Item * dt.Jumlah) AS Total_Profit_Kategori
FROM Tabel_Detail_Transaksi dt
JOIN Tabel_Produk prod ON dt.ProdukID = prod.ProdukID
JOIN Tabel_Kategori_Produk kat ON prod.KategoriID = kat.KategoriID
JOIN Tabel_Transaksi t ON dt.TransaksiID = t.TransaksiID
WHERE t.Status_Transaksi = 'Success'
GROUP BY kat.Nama_Kategori
ORDER BY Total_Profit_Kategori DESC;

-- Fungsi/Trigger
-- 1. Membuat Fungsi Logika Penguncian Harga
CREATE OR REPLACE FUNCTION func_lock_price() 
RETURNS TRIGGER AS $$
BEGIN
    -- Mengambil harga aktual dari Master Produk
    SELECT Harga_Modal_Aktual, Harga_Jual_Aktual 
    INTO NEW.Harga_Modal_Saat_Transaksi, NEW.Harga_Jual_Saat_Transaksi
    FROM Tabel_Produk 
    WHERE ProdukID = NEW.ProdukID;

    -- Menghitung keuntungan otomatis
    NEW.Keuntungan_Item := (NEW.Harga_Jual_Saat_Transaksi - NEW.Harga_Modal_Saat_Transaksi);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_Otomatis_Kunci_Harga
BEFORE INSERT ON Tabel_Detail_Transaksi
FOR EACH ROW
EXECUTE FUNCTION func_lock_price();

-- 2. Membuat Fungsi Hitung Ulang
CREATE OR REPLACE FUNCTION func_recalculate_header() 
RETURNS TRIGGER AS $$
BEGIN
    -- Update Header Transaksi berdasarkan penjumlahan detail
    UPDATE Tabel_Transaksi
    SET 
        Total_Struk = (SELECT COALESCE(SUM(Harga_Jual_Saat_Transaksi * Jumlah), 0) 
                       FROM Tabel_Detail_Transaksi 
                       WHERE TransaksiID = NEW.TransaksiID),
        Total_Keuntungan = (SELECT COALESCE(SUM(Keuntungan_Item * Jumlah), 0) 
                            FROM Tabel_Detail_Transaksi 
                            WHERE TransaksiID = NEW.TransaksiID)
    WHERE TransaksiID = NEW.TransaksiID;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_Update_Total_Transaksi
AFTER INSERT OR UPDATE OR DELETE ON Tabel_Detail_Transaksi
FOR EACH ROW
EXECUTE FUNCTION func_recalculate_header();

-- Procedure
CREATE OR REPLACE PROCEDURE sp_Update_Status_Bayar(
    _TransaksiID INT,
    _StatusBaru VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validasi Input Status
    IF _StatusBaru NOT IN ('Pending', 'Success', 'Failed') THEN
        RAISE EXCEPTION 'Status tidak valid. Gunakan: Pending, Success, atau Failed.';
    END IF;

    -- Lakukan Update
    UPDATE Tabel_Transaksi
    SET Status_Transaksi = _StatusBaru
    WHERE TransaksiID = _TransaksiID;
    
    COMMIT;
END;
$$;

-- ROLES & PRIVILEGES
-- 1. Membuat Role untuk Admin Toko
CREATE ROLE staff_admin WITH LOGIN PASSWORD 'password_staff_aman';

-- Memberikan hak akses operasional
GRANT INSERT, SELECT ON Tabel_Transaksi, Tabel_Detail_Transaksi TO staff_admin;
GRANT SELECT, INSERT ON Tabel_Pelanggan, Tabel_Akun_Game_Pelanggan TO staff_admin;
GRANT SELECT ON Tabel_Produk, Tabel_Kategori_Produk, Tabel_Metode_Pembayaran TO staff_admin;

-- Memberikan izin menjalankan prosedur update status
GRANT EXECUTE ON PROCEDURE sp_Update_Status_Bayar TO staff_admin;

-- 2. Membuat Role untuk Owner
CREATE ROLE owner_viewer WITH LOGIN PASSWORD 'password_owner_rahasia';

-- Memberikan hak akses hanya baca pada View Laporan
GRANT SELECT ON View_Laporan_Keuntungan_Harian TO owner_viewer;
GRANT SELECT ON View_Laporan_Per_Kategori_Game TO owner_viewer;

-- DATA AWAL (SEEDING)
-- Kategori produk sesuai game di frontend
INSERT INTO Tabel_Kategori_Produk (Nama_Kategori, Membutuhkan_GameID)
VALUES
  ('Mobile Legends', TRUE),
  ('Genshin Impact', TRUE),
  ('Steam Wallet', FALSE)
ON CONFLICT (Nama_Kategori) DO NOTHING;

-- Metode pembayaran awal untuk kebutuhan transaksi
INSERT INTO Tabel_Metode_Pembayaran (MetodeID, Nama_Metode, Tipe_Metode, Biaya_Admin)
VALUES
  (1, 'QRIS', 'E-Wallet', 0),
  (2, 'BCA Virtual Account', 'Bank Transfer', 2500),
  (3, 'OVO', 'E-Wallet', 0)
ON CONFLICT (MetodeID) DO NOTHING;

-- Produk awal: beberapa paket Mobile Legends sebagai contoh
-- Silakan sesuaikan harga modal & harga jual sesuai kebutuhan
INSERT INTO Tabel_Produk (
    KategoriID,
    Nama_Produk,
    SKU,
    Harga_Modal_Aktual,
    Harga_Jual_Aktual,
    Deskripsi
)
VALUES
(
  (SELECT KategoriID FROM Tabel_Kategori_Produk WHERE Nama_Kategori = 'Mobile Legends'),
  'Diamond ML 50',
  'ML-050',
  5000,
  7000,
  'Top up 50 diamond Mobile Legends.'
),
(
  (SELECT KategoriID FROM Tabel_Kategori_Produk WHERE Nama_Kategori = 'Mobile Legends'),
  'Diamond ML 100',
  'ML-100',
  9000,
  12000,
  'Top up 100 diamond Mobile Legends.'
),
(
  (SELECT KategoriID FROM Tabel_Kategori_Produk WHERE Nama_Kategori = 'Mobile Legends'),
  'Diamond ML 250',
  'ML-250',
  20000,
  26000,
  'Top up 250 diamond Mobile Legends.'
),
(
  (SELECT KategoriID FROM Tabel_Kategori_Produk WHERE Nama_Kategori = 'Mobile Legends'),
  'Diamond ML 500',
  'ML-500',
  38000,
  50000,
  'Top up 500 diamond Mobile Legends.'
),
(
  (SELECT KategoriID FROM Tabel_Kategori_Produk WHERE Nama_Kategori = 'Mobile Legends'),
  'Diamond ML 1000',
  'ML-1000',
  72000,
  95000,
  'Top up 1000 diamond Mobile Legends.'
),
(
  (SELECT KategoriID FROM Tabel_Kategori_Produk WHERE Nama_Kategori = 'Mobile Legends'),
  'Diamond ML 2500',
  'ML-2500',
  170000,
  220000,
  'Top up 2500 diamond Mobile Legends.'
);

-- Pelanggan contoh untuk keperluan testing
INSERT INTO Tabel_Pelanggan (Nama_Client, Nomor_HP, Email)
VALUES
  ('Guest Tester', '081234567890', 'guest@example.com')
ON CONFLICT (Nomor_HP) DO NOTHING;

-- Akun game contoh (Mobile Legends) yang terhubung dengan pelanggan di atas
INSERT INTO Tabel_Akun_Game_Pelanggan (PelangganID, KategoriID, Game_UserID, Game_Nickname, Server)
VALUES (
  (SELECT PelangganID FROM Tabel_Pelanggan WHERE Nomor_HP = '081234567890'),
  (SELECT KategoriID FROM Tabel_Kategori_Produk WHERE Nama_Kategori = 'Mobile Legends'),
  '123456789',
  'GuestPlayer',
  '1001'
)
ON CONFLICT DO NOTHING;