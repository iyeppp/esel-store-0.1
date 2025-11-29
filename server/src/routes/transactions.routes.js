const express = require("express");
const pool = require("../config/db");
const { requireOrdersAdmin } = require("../middleware/authRole");

const router = express.Router();

router.post("/api/transactions", async (req, res) => {
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
        ["081234567890"],
      );

      effectiveCustomerId = guestResult.rowCount > 0 ? guestResult.rows[0].pelangganid : null;
    }

    // Upsert akun game hanya untuk Mobile Legends; game lain tidak butuh akun game
    let akunGameId = null;
    if (gameId === "mobile-legends" && effectiveCustomerId && userId) {
      const akunSelect = await client.query(
        `SELECT akungameid
         FROM tabel_akun_game_pelanggan
         WHERE pelangganid = $1
           AND kategoriid = (SELECT kategoriid FROM tabel_kategori_produk WHERE nama_kategori = 'Mobile Legends')
           AND game_userid = $2`,
        [effectiveCustomerId, userId],
      );

      if (akunSelect.rowCount > 0) {
        akunGameId = akunSelect.rows[0].akungameid;
      } else {
        const akunInsert = await client.query(
          `INSERT INTO tabel_akun_game_pelanggan (pelangganid, kategoriid, game_userid, game_nickname, server)
           VALUES (
             $1,
             (SELECT kategoriid FROM tabel_kategori_produk WHERE nama_kategori = 'Mobile Legends'),
             $2,
             NULL,
             $3
           )
           RETURNING akungameid`,
          [effectiveCustomerId, userId, serverId || null],
        );
        akunGameId = akunInsert.rows[0].akungameid;
      }
    }

    const transaksiResult = await client.query(
      `INSERT INTO tabel_transaksi (invoice_number, pelangganid, metodeid, status_transaksi)
       VALUES ($1, $2, $3, 'Pending')
       RETURNING transaksiid`,
      [invoiceNumber, effectiveCustomerId, paymentMethodId],
    );

    const transaksiId = transaksiResult.rows[0].transaksiId || transaksiResult.rows[0].transaksiid;

    // Insert detail transaksi, trigger akan mengisi harga & keuntungan otomatis
    await client.query(
      `INSERT INTO tabel_detail_transaksi (transaksiid, produkid, akungameid, jumlah)
       VALUES ($1, $2, $3, $4)`,
      [transaksiId, productId, akunGameId, 1],
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

// Update transaction status (Pending -> Success/Failed) - orders/admin only
router.post("/api/transactions/:id/status", requireOrdersAdmin, async (req, res) => {
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

module.exports = router;
