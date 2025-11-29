const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/api/games", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT kategoriid, nama_kategori, membutuhkan_gameid FROM tabel_kategori_produk ORDER BY kategoriid",
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

router.get("/api/products", async (req, res) => {
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
      [categoryName],
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

module.exports = router;
