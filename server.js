// server/server.js
require("dotenv").config();
require("./DB");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors({
  origin:  'http://localhost:3000',
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// Error Handler Middleware
app.use(errorHandler);

const port = process.env.PORT || 3030;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    process.exit(1);
  } else {
    console.error("Server error:", err);
  }
});
