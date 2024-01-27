const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const JWT_PRIVATE_KEY = "UniFind";

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, JWT_PRIVATE_KEY, {
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
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = { User, validate };
