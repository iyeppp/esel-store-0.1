const express = require("express");
const pool = require("../config/db");
const { requireFullAdmin } = require("../middleware/authRole");

const router = express.Router();

// Admin daily profit report from View_Laporan_Keuntungan_Harian (full admin only)
router.get("/api/admin/reports/daily", requireFullAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tanggal, jumlah_transaksi_berhasil, total_omzet, total_keuntungan_bersih
       FROM view_laporan_keuntungan_harian
       ORDER BY tanggal DESC`,
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

module.exports = router;
