import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database is connected at ${conn.connection.host}`);
  } catch (error) {
    console.log("Error Connecting to database", error);
    process.exit(1); //exit with failure ,0 success
  }
};
