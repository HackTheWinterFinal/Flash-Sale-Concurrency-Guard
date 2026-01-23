const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const app = require("./app");
const connectMongo = require("./config/mongo");
require("./kafka/consumers/payment.consumers");
const express = require('express');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed", err);
    process.exit(1);
  }
})();
