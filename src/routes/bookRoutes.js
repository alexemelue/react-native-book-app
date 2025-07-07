import express from "express";
import User from "../models/Users.js";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// create book
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!title || !caption || !rating || !image) {
      return res.status(400).json({ message: "Please Provide All Fields!" });
    }

    // upload the image to cloudinary
    // const uploadResponse = await cloudinary.uploader.upload(image, {
    //   resource_type: "image",
    //   chunk_size: 120000000, // 60MB chunk size (adjust as needed)
    //   public_id: "my_large_file",
    // });
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;
    // save to the database
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });
    newBook.save();
    console.log(req.user._id);
    res.status(201).json(newBook);
  } catch (error) {
    console.log("Error in Creating Book", error);
    res.status(500).json({ message: error.message });
  }
});

// fetch books with pagination ->infinite loading
router.get("/", protectRoute, async (req, res) => {
  // call from react native
  // const response = await fetch("http://localhost:3000/api/books?page=1&limit=5");
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;
    const books = await Book.find()
      .sort({ createdAt: -1 }) //decending order
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    res.json({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in Getting Books", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// get recomended books by logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    // res.json(books);
    res.send(books);
  } catch (error) {
    console.log("Get User Books Error", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});
// delete books
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book Not Found!" });
    // check if user is the creator of the book
    if (book.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Authorized!" });

    // delete the image from cloudinary
    //https://res.cloudinary.com/delrm6auto/image/upload/v1741568358/qyup61vejflxx8igv10.png
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log("Error in Deleting Image from cloudinary", deleteError);
      }
    }
    await book.deleteOne();
    res.json({ message: "Book deleted successfully!" });
  } catch (error) {
    console.log("Error in Deleting Book", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
export default router;
