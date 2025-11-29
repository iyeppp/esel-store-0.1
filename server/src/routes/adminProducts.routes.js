const express = require("express");
const pool = require("../config/db");
const { requireFullAdmin } = require("../middleware/authRole");

const router = express.Router();

// Admin products CRUD (full admin only)
router.get("/api/admin/products", requireFullAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT produkid, kategoriid, nama_produk, sku, harga_modal_aktual, harga_jual_aktual, deskripsi
       FROM tabel_produk
       ORDER BY produkid`,
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

router.post("/api/admin/products", requireFullAdmin, async (req, res) => {
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
      [Number(categoryId), name, sku || null, costPrice ?? 0, sellPrice, description || null],
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

router.put("/api/admin/products/:id", requireFullAdmin, async (req, res) => {
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
      [Number(categoryId), name, sku || null, costPrice ?? 0, sellPrice, description || null, Number(id)],
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

router.delete("/api/admin/products/:id", requireFullAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM tabel_produk WHERE produkid = $1`,
      [Number(id)],
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

module.exports = router;
