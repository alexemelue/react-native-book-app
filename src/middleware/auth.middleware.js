import jwt from "jsonwebtoken";
import User from "../models/Users.js";

const protectRoute = async (req, res, next) => {
  try {
    // get token
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token)
      return res
        .status(401)
        .json({ message: "No Authorization token,access denied" });

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find the user
    // const user = await User.findeOne({ _id: decoded.userId });
    const user = await User.findById(decoded.userId).select("-password");
    if (!user)
      return res.status(401).json({ message: "Token incorrect Valid" });
    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication Error:", error.message);
    res.status(401).json({ message: "Token not Valid" });
  }
};

export default protectRoute;
