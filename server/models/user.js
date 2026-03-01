const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  profilePicture: { type: String, default: "" },
  privacy: {
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false }
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const JWT_PRIVATE_KEY = process.env.JWTPRIVATEKEY || "UniFind";

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, role: this.role }, JWT_PRIVATE_KEY, {
    expiresIn: "7d",
  });

  return token;
};

const User = mongoose.model("User", userSchema);

const validate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).required().label("enter your first name"),
    lastName: Joi.string().min(3).required().label("enter your last name"),
    email: Joi.string().email().required().label("enter your email"),
    password: passwordComplexity().required().label("enter your password"),
    phoneNumber: Joi.string().allow("").optional().label("enter your phone number"),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = { User, validate };
