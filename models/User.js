const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // יש לוודא שהמייל יהיה ייחודי
  },
  password: {
    type: String,
    required: true,
  }
});


const User = mongoose.model("User", userSchema);

module.exports = User;
