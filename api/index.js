require("dotenv").config();

const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");

const express = require("express");
const app = express();

const MONGODB_URL = process.env.MONGODB_URL;
mongoose.pluralize(null);
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("database started ✅");

    initApp();
  })
  .catch((err) => {
    console.log("database not connected ❌", err);
    process.exit();
  });

function initApp() {
  try {
    app.use(cookieParser());
    app.use(express.json({ limit: "50mb" }));
    app.use(mongoSanitize());

    // start server
    const PORT = process.env.PORT;
    app.listen(PORT || 3000, () => {
      console.log(`server started at port ${PORT}✅`);
    });

    // routes
    const authRoute = require("./routes/auth.route");
    app.use("/api/v1/auth", authRoute);

    app.use((req, res, next) => {
      res.status(404).json({
        status: "failed",
        message: "page not found",
      });
    });

    app.use((error, req, res, next) => {
      res.status(500).json({
        status: "failed",
        message: error.message,
      });
    });
  } catch (error) {
    console.log("gagal menjalankan server:", error.message);
  }
}
