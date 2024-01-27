const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  image: String,
});

const UserModel = mongoose.model("UserModel", UserSchema);
module.exports = UserModel;
