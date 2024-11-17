require("dotenv").config();
require("./DB");

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const productRoutes = require("./routes/productRoutes");
app.use("/products", productRoutes);


const authRoutes = require("./routes/userRouters");
app.use("/auth", authRoutes);


// Default route
app.get("/", (req, res) => {
res.send("Hello, World! - server running on Node.js");
});

// Define port with default fallback
const port = process.env.PORT || 3030;

// Start server with error handling
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

