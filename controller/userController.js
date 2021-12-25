const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = new express.Router();

// Signup
router.post("/users/signup", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user: user.getPublicProfile(), token });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
