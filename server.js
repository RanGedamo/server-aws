require("dotenv").config();
require("./DB");

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const app = express();


app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
res.send("Hello, World!");
});

app.listen(process.env.PORT||3030, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});