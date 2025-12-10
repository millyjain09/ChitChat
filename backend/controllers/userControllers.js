const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

// 1. Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

// 2. Login User
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      bio: user.bio,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

// 3. Search Users (PRIVACY FIX APPLIED HERE ✅)
const allUsers = asyncHandler(async (req, res) => {
  // Logic Changed: Ab hum regex use nahi kar rahe.
  // Hum direct match kar rahe hain. 
  // Jab tak pura email match nahi hoga, user nahi dikhega.
  const keyword = req.query.search
    ? { email: req.query.search }
    : {};

  // Current logged in user ko result se bahar rakhna
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

// 4. Update User Profile (Pic & Bio)
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;

    // Agar nayi photo aayi hai to update karo
    if (req.file) {
      user.pic = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      pic: updatedUser.pic,
      bio: updatedUser.bio,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = { registerUser, authUser, allUsers, updateUserProfile };