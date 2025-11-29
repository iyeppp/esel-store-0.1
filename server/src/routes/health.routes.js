const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

router.get("/api/db-test", async (req, res) => {
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

module.exports = router;
