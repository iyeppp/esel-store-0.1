const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/db");

const healthRoutes = require("./routes/health.routes");
const customerRoutes = require("./routes/customers.routes");
const paymentRoutes = require("./routes/payments.routes");
const categoryRoutes = require("./routes/categories.routes");
const adminProductsRoutes = require("./routes/adminProducts.routes");
const reportsRoutes = require("./routes/reports.routes");
const gamesRoutes = require("./routes/games.routes");
const ordersRoutes = require("./routes/orders.routes");
const transactionsRoutes = require("./routes/transactions.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(healthRoutes);
app.use(customerRoutes);
app.use(paymentRoutes);
app.use(categoryRoutes);
app.use(adminProductsRoutes);
app.use(reportsRoutes);
app.use(gamesRoutes);
app.use(ordersRoutes);
app.use(transactionsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});