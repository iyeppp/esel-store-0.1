const express = require("express");
const pool = require("../config/db");
const { requireFullAdmin } = require("../middleware/authRole");

const router = express.Router();
// All category routes are admin-only
router.get("/api/categories", requireFullAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT kategoriid, nama_kategori, membutuhkan_gameid
       FROM tabel_kategori_produk
       ORDER BY kategoriid`,
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

router.post("/api/categories", requireFullAdmin, async (req, res) => {
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
      [name, requiresGameId ?? false],
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

router.put("/api/categories/:id", requireFullAdmin, async (req, res) => {
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
      [name, requiresGameId ?? false, Number(id)],
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

router.delete("/api/categories/:id", requireFullAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM tabel_kategori_produk WHERE kategoriid = $1`,
      [Number(id)],
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

module.exports = router;
