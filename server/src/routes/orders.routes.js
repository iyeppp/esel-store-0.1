const express = require("express");
const pool = require("../config/db");
const { requireOrdersAdmin } = require("../middleware/authRole");

const router = express.Router();

// Base query builder used by both public and admin listing
const buildOrdersQuery = (status, customerId) => {
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

  return { query, params };
};

// Public orders listing (used by customer Orders page)
router.get("/api/orders", async (req, res) => {
  const { status, customerId } = req.query;

  try {
    const { query, params } = buildOrdersQuery(status, customerId);
    const result = await pool.query(query, params);

    return res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
});

// Admin / staff listing, protected by role middleware
router.get("/api/admin/orders", requireOrdersAdmin, async (req, res) => {
  const { status, customerId } = req.query;

  try {
    const { query, params } = buildOrdersQuery(status, customerId);
    const result = await pool.query(query, params);

    return res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("Get admin orders error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin orders",
      error: err.message,
    });
  }
});

// Detailed order by invoice number (used by both admin and customer views)
router.get("/api/orders/invoice/:invoiceNumber", async (req, res) => {
  const { invoiceNumber } = req.params;

  if (!invoiceNumber) {
    return res.status(400).json({
      success: false,
      message: "invoiceNumber is required",
    });
  }

  try {
    const result = await pool.query(
      `SELECT t.transaksiid, v.*
       FROM view_detail_transaksi_lengkap v
       JOIN tabel_transaksi t ON v.invoice_number = t.invoice_number
       WHERE v.invoice_number = $1
       ORDER BY v.tanggal_transaksi DESC`,
      [invoiceNumber],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.json({ success: true, rows: result.rows });
  } catch (err) {
    console.error("Get order by invoice error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order detail",
      error: err.message,
    });
  }
});

module.exports = router;
