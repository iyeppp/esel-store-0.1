const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/api/payment-methods", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT metodeid, nama_metode, tipe_metode, biaya_admin FROM tabel_metode_pembayaran ORDER BY metodeid",
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

module.exports = router;
