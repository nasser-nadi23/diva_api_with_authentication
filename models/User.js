const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid.");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("password must not be contain password keyword");
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// Hide Private Data
userSchema.methods.getPublicProfile = function () {
  const user = this;
  const userObj = user.toObject(); // Convert to the object

  delete userObj.password;
  delete userObj.tokens;
  delete userObj.avatar;

  return userObj;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "thisissecret");
  user.tokens = user.tokens.concat({ token: token });
  await user.save();
  return token;
};

//////////////////////////////////// MIDDLEWARES////////////////////////////////////////////////////////////////////
// Hash password before saving user in database
userSchema.pre("save", async function (next) {
  const user = this; // this refer to the user that going to save on the database(instance)
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
