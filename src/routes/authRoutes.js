import express from "express";
import User from "../models/Users.js";
import jwt from "jsonwebtoken";
const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};
// register endpoint routes
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    // console.log(email, username, password);

    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields Are Required!" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be at least 6 character long" });
    }
    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username should be at least 3 character long" });
    }

    // check if user already existed

    // const existingUser = await User.findOne({
    //   $or: [{ email: email }, { username }],
    // });
    // if (existingUser)
    //   return res.status(400).json({ message: "User Already Exists" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ message: "Email Already Exists" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res.status(400).json({ message: "Username Already Exists" });

    // get random avataar
    // const profileImage = `http://api.dicebear,com/7.x/avataaars/svg?seed=${username}`;
    const profileImage = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${username}`;

    const user = new User({
      email,
      username,
      password,
      profileImage,
    });

    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in the register Route", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// login endpoint routes
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields Are Required!" });

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "invalid credentials!" });

    // check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "invalid credentials!" });

    const token = generateToken(user._id);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in the Login Route", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
