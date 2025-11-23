const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error("DB test error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.post("/api/customers/signup", async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "name and email are required",
    });
  }

  try {
    const existing = await pool.query(
      `SELECT pelangganid FROM tabel_pelanggan WHERE email = $1 OR nomor_hp = $2`,
      [email, phone || null]
    );

    if (existing.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email or phone already exists",
      });
    }

    const result = await pool.query(
      `INSERT INTO tabel_pelanggan (nama_client, nomor_hp, email)
       VALUES ($1, $2, $3)
       RETURNING pelangganid, nama_client, nomor_hp, email`,
      [name, phone || null, email]
    );

    return res.status(201).json({
      success: true,
      customer: result.rows[0],
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to sign up customer",
      error: err.message,
    });
  }
});

app.post("/api/customers/signin", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "email is required",
    });
  }

  try {
    const result = await pool.query(
      `SELECT pelangganid, nama_client, nomor_hp, email
       FROM tabel_pelanggan
       WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    return res.json({
      success: true,
      customer: result.rows[0],
    });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to sign in",
      error: err.message,
    });
  }
});

app.get("/api/payment-methods", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT metodeid, nama_metode, tipe_metode, biaya_admin FROM tabel_metode_pembayaran ORDER BY metodeid"
    );

    return res.json({
      success: true,
      methods: result.rows,
    });
  } catch (err) {
    console.error("Get payment methods error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment methods",
      error: err.message,
    });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT kategoriid, nama_kategori, membutuhkan_gameid
       FROM tabel_kategori_produk
       ORDER BY kategoriid`
    );

    return res.json({ success: true, categories: result.rows });
  } catch (err) {
    console.error("Get categories error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: err.message,
    });
  }
});

app.post("/api/categories", async (req, res) => {
  const { name, requiresGameId } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "name is required",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tabel_kategori_produk (nama_kategori, membutuhkan_gameid)
       VALUES ($1, $2)
       RETURNING kategoriid, nama_kategori, membutuhkan_gameid`,
      [name, requiresGameId ?? false]
    );

    return res.status(201).json({ success: true, category: result.rows[0] });
  } catch (err) {
    console.error("Create category error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: err.message,
    });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name, requiresGameId } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "name is required",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE tabel_kategori_produk
       SET nama_kategori = $1,
           membutuhkan_gameid = $2
       WHERE kategoriid = $3
       RETURNING kategoriid, nama_kategori, membutuhkan_gameid`,
      [name, requiresGameId ?? false, Number(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.json({ success: true, category: result.rows[0] });
  } catch (err) {
    console.error("Update category error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: err.message,
    });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM tabel_kategori_produk WHERE kategoriid = $1`,
      [Number(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete category error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: err.message,
    });
  }
});

// Admin products CRUD
app.get("/api/admin/products", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT produkid, kategoriid, nama_produk, sku, harga_modal_aktual, harga_jual_aktual, deskripsi
       FROM tabel_produk
       ORDER BY produkid`
    );

    return res.json({ success: true, products: result.rows });
  } catch (err) {
    console.error("Get products (admin) error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: err.message,
    });
  }
});

app.post("/api/admin/products", async (req, res) => {
  const { categoryId, name, sku, costPrice, sellPrice, description } = req.body;

  if (!categoryId || !name || sellPrice == null) {
    return res.status(400).json({
      success: false,
      message: "categoryId, name, and sellPrice are required",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tabel_produk (kategoriid, nama_produk, sku, harga_modal_aktual, harga_jual_aktual, deskripsi)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING produkid, kategoriid, nama_produk, sku, harga_modal_aktual, harga_jual_aktual, deskripsi`,
      [Number(categoryId), name, sku || null, costPrice ?? 0, sellPrice, description || null]
    );

    return res.status(201).json({ success: true, product: result.rows[0] });
  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: err.message,
    });
  }
});

app.put("/api/admin/products/:id", async (req, res) => {
  const { id } = req.params;
  const { categoryId, name, sku, costPrice, sellPrice, description } = req.body;

  if (!categoryId || !name || sellPrice == null) {
    return res.status(400).json({
      success: false,
      message: "categoryId, name, and sellPrice are required",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE tabel_produk
       SET kategoriid = $1,
           nama_produk = $2,
           sku = $3,
           harga_modal_aktual = $4,
           harga_jual_aktual = $5,
           deskripsi = $6
       WHERE produkid = $7
       RETURNING produkid, kategoriid, nama_produk, sku, harga_modal_aktual, harga_jual_aktual, deskripsi`,
      [Number(categoryId), name, sku || null, costPrice ?? 0, sellPrice, description || null, Number(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: err.message,
    });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM tabel_produk WHERE produkid = $1`,
      [Number(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete product error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: err.message,
    });
  }
});

// Admin daily profit report from View_Laporan_Keuntungan_Harian
app.get("/api/admin/reports/daily", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tanggal, jumlah_transaksi_berhasil, total_omzet, total_keuntungan_bersih
       FROM view_laporan_keuntungan_harian
       ORDER BY tanggal DESC`
    );

    return res.json({ success: true, rows: result.rows });
  } catch (err) {
    console.error("Get daily report error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily report",
      error: err.message,
    });
  }
});

app.get("/api/games", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT kategoriid, nama_kategori, membutuhkan_gameid FROM tabel_kategori_produk ORDER BY kategoriid"
    );

    return res.json({
      success: true,
      games: result.rows,
    });
  } catch (err) {
    console.error("Get games error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch games",
      error: err.message,
    });
  }
});

app.get("/api/orders", async (req, res) => {
  const { status, customerId } = req.query;

  try {
    let query = `SELECT t.transaksiid, v.*
                 FROM view_detail_transaksi_lengkap v
                 JOIN tabel_transaksi t ON v.invoice_number = t.invoice_number`;
    const params = [];

    const conditions = [];
    if (status) {
      conditions.push(`v.status_transaksi = $${conditions.length + 1}`);
      params.push(status);
    }

    if (customerId) {
      conditions.push(`t.pelangganid = $${conditions.length + 1}`);
      params.push(Number(customerId));
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY v.tanggal_transaksi DESC LIMIT 50";

    const result = await pool.query(query, params);

    return res.json({
      success: true,
      orders: result.rows,
    });
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
});

app.get("/api/products", async (req, res) => {
  const { gameId } = req.query;

  if (!gameId) {
    return res.status(400).json({
      success: false,
      message: "gameId query parameter is required",
    });
  }

  // Untuk sementara mapping slug ke nama kategori manual
  let categoryName;
  if (gameId === "mobile-legends") categoryName = "Mobile Legends";
  else if (gameId === "genshin-impact") categoryName = "Genshin Impact";
  else if (gameId === "steam-wallet") categoryName = "Steam Wallet";

  if (!categoryName) {
    return res.status(400).json({
      success: false,
      message: "Unsupported gameId",
    });
  }

  try {
    const result = await pool.query(
      `SELECT p.produkid, p.nama_produk, p.sku, p.harga_jual_aktual, p.deskripsi
       FROM tabel_produk p
       JOIN tabel_kategori_produk k ON p.kategoriid = k.kategoriid
       WHERE k.nama_kategori = $1
       ORDER BY p.harga_jual_aktual ASC`,
      [categoryName]
    );

    return res.json({
      success: true,
      products: result.rows,
    });
  } catch (err) {
    console.error("Get products error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: err.message,
    });
  }
});

app.post("/api/transactions", async (req, res) => {
  const { gameId, packageAmount, price, bonus, userId, serverId, paymentMethodId, customerId, productId } = req.body;

  if (!gameId || !packageAmount || !paymentMethodId) {
    return res.status(400).json({
      success: false,
      message: "gameId, packageAmount, and paymentMethodId are required",
    });
  }

  const client = await pool.connect();

  try {
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required for this transaction.",
      });
    }

    await client.query("BEGIN");

    const invoiceNumber = `ESL-${Date.now()}`;

    let effectiveCustomerId = customerId ?? null;

    if (!effectiveCustomerId) {
      const guestResult = await client.query(
        `SELECT pelangganid FROM tabel_pelanggan WHERE nomor_hp = $1 LIMIT 1`,
        ["081234567890"]
      );

      effectiveCustomerId =
        guestResult.rowCount > 0 ? guestResult.rows[0].pelangganid : null;
    }

    // Upsert akun game hanya untuk Mobile Legends; game lain tidak butuh akun game
    let akunGameId = null;
    if (gameId === "mobile-legends" && effectiveCustomerId && userId) {
      const akunSelect = await client.query(
        `SELECT akungameid
         FROM tabel_akun_game_pelanggan
         WHERE pelangganid = $1
           AND kategoriid = (SELECT kategoriid FROM tabel_kategori_produk WHERE nama_kategori = 'Mobile Legends')
           AND game_userid = $3`,
        [effectiveCustomerId, userId]
      );

      if (akunSelect.rowCount > 0) {
        akunGameId = akunSelect.rows[0].akungameid;
      } else {
        const akunInsert = await client.query(
          `INSERT INTO tabel_akun_game_pelanggan (pelangganid, kategoriid, game_userid, game_nickname, server)
           VALUES (
             $1,
             (SELECT kategoriid FROM tabel_kategori_produk WHERE nama_kategori = 'Mobile Legends'),
             $3,
             NULL,
             $4
           )
           RETURNING akungameid`,
          [effectiveCustomerId, userId, serverId || null]
        );
        akunGameId = akunInsert.rows[0].akungameid;
      }
    }

    const transaksiResult = await client.query(
      `INSERT INTO tabel_transaksi (invoice_number, pelangganid, metodeid, status_transaksi)
       VALUES ($1, $2, $3, 'Pending')
       RETURNING transaksiid`,
      [invoiceNumber, effectiveCustomerId, paymentMethodId]
    );

    const transaksiId =
      transaksiResult.rows[0].transaksiId || transaksiResult.rows[0].transaksiid;

    // Insert detail transaksi, trigger akan mengisi harga & keuntungan otomatis
    await client.query(
      `INSERT INTO tabel_detail_transaksi (transaksiid, produkid, akungameid, jumlah)
       VALUES ($1, $2, $3, $4)`,
      [transaksiId, productId, akunGameId, 1]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      invoiceNumber,
      transaksiId,
      meta: {
        gameId,
        packageAmount,
        price,
        bonus,
        userId,
        serverId,
        paymentMethodId,
        customerId: effectiveCustomerId,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Create transaction error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: err.message,
    });
  } finally {
    client.release();
  }
});

// Update transaction status (Pending -> Success/Failed)
app.post("/api/transactions/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["Pending", "Success", "Failed"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Use Pending, Success, or Failed.",
    });
  }

  try {
    await pool.query("CALL sp_Update_Status_Bayar($1, $2)", [Number(id), status]);
    return res.json({ success: true });
  } catch (err) {
    console.error("Update status error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update transaction status",
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});