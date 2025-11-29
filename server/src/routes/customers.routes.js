const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.post("/api/customers/signup", async (req, res) => {
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
      [email, phone || null],
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
      [name, phone || null, email],
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

router.post("/api/customers/signin", async (req, res) => {
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
      [email],
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

module.exports = router;
