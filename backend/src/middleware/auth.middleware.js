import jwt from "jsonwebtoken";
import User from "../models/Users.js";

const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token missing or malformed" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token missing or malformed" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user)
      return res.status(401).json({ message: "Token is not valid" });

    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication Error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default protectRoute;
