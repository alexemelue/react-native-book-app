import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import job from "./lib/cron.js";
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Hard-forces Node to bypass your local router DNS

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// job.start();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// INCREASE THIS LIMIT so it can handle the Base64 image payload
// app.use(express.json({ limit: "15mb" }));
// app.use(express.urlencoded({ limit: "15mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(3000, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
