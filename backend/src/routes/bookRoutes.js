import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 },
// });
const router = express.Router();

// create book
// router.post(
//   "/",
//   protectRoute,
//   upload.single("image"),
//   async (req, res) => {
//     try {
//       const { title, caption, rating } = req.body;
//       const imageFile = req.file;

//       if (!title || !caption || !rating || !imageFile) {
//         return res.status(400).json({ message: "Please provide all fields!" });
//       }

//       const imageBuffer = imageFile.buffer;
//       const imageSizeInBytes = imageBuffer.length;
//       const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

//       if (imageSizeInBytes > MAX_IMAGE_SIZE) {
//         return res.status(413).json({
//           message: `Image size exceeds 10MB limit. Current size: ${(imageSizeInBytes / (1024 * 1024)).toFixed(2)}MB`,
//         });
//       }

//       let uploadResponse;
//       try {
//         uploadResponse = await new Promise((resolve, reject) => {
//           const stream = cloudinary.uploader.upload_stream(
//             { resource_type: "auto", folder: "bookworm" },
//             (error, result) => {
//               if (error) reject(error);
//               else resolve(result);
//             }
//           );
//           stream.end(imageBuffer);
//         });
//       } catch (cloudinaryError) {
//         console.log("Cloudinary upload error:", cloudinaryError.message);
//         return res.status(500).json({
//           message: "Failed to upload image to Cloudinary. Please try again.",
//           error: cloudinaryError.message,
//         });
//       }

//       const imageUrl = uploadResponse.secure_url;
//       console.log("Image uploaded for user:", req.user._id, "URL:", imageUrl);

//       const newBook = new Book({
//         title,
//         caption,
//         rating,
//         image: imageUrl,
//         user: req.user._id,
//       });
//       await newBook.save();
//       res.status(201).json(newBook);
//     } catch (error) {
//       console.log("Error in Creating Book:", error.message);
//       res.status(500).json({
//         message: error.message || "Failed to create book",
//       });
//     }
//   }
// );

// create book (Updated to support JSON Base64 uploads)
// router.post("/", protectRoute, async (req, res) => {
//   try {
//     // 1. Read directly out of req.body (Multer no longer intercepts this)
//     const { title, caption, rating, imageFile } = req.body;
//     console.log("REQ BODY:", req.body);
//     if (!title || !caption || !rating || !imageFile) {
//       return res.status(400).json({ message: "Please provide all fields!" });
//     }

//     let uploadResponse;
//     try {
//       // 2. Cloudinary can natively upload base64 Data URIs directly
//       uploadResponse = await cloudinary.uploader.upload(imageFile, {
//         folder: "bookworm",
//         resource_type: "auto",
//       });
//     } catch (cloudinaryError) {
//       console.log("Cloudinary upload error:", cloudinaryError.message);
//       return res.status(500).json({
//         message: "Failed to upload image to Cloudinary. Please try again.",
//         error: cloudinaryError.message,
//       });
//     }

//     const imageUrl = uploadResponse.secure_url;
//     console.log("Image uploaded for user:", req.user._id, "URL:", imageUrl);

//     const newBook = new Book({
//       title,
//       caption,
//       rating,
//       image: imageUrl,
//       user: req.user._id,
//     });
//     await newBook.save();
//     res.status(201).json(newBook);
//   } catch (error) {
//     console.log("Error in Creating Book:", error.message);
//     res.status(500).json({
//       message: error.message || "Failed to create book",
//     });
//   }
// });

// updated
router.post("/", protectRoute, async (req, res) => {
  try {
    // 1. Log the exact keys arriving at the server terminal
    console.log("Fields received:", {
      hasTitle: !!req.body.title,
      hasCaption: !!req.body.caption,
      hasRating: !!req.body.rating,
      hasImageFile: !!req.body.imageFile,
    });

    const { title, caption, rating, imageFile } = req.body;

    // 2. Validate values are present
    if (!title || !caption || !rating || !imageFile) {
      return res.status(400).json({
        message: "Please provide all fields!",
        details: {
          titleMissing: !title,
          captionMissing: !caption,
          ratingMissing: !rating,
          imageFileMissing: !imageFile,
        },
      });
    }

    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(imageFile, {
        folder: "bookworm",
        resource_type: "auto",
      });
    } catch (cloudinaryError) {
      console.log("Cloudinary upload error:", cloudinaryError.message);
      return res.status(500).json({
        message: "Failed to upload image to Cloudinary.",
        error: cloudinaryError.message,
      });
    }

    const imageUrl = uploadResponse.secure_url;

    const newBook = new Book({
      title,
      caption,
      rating: Number(rating), // Explicitly cast to schema type
      image: imageUrl,
      user: req.user._id,
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.log("Error in Creating Book:", error.message);
    res.status(500).json({ message: error.message || "Failed to create book" });
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
    // console.log(books)
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
      return res.status(401).json({ message: "unAuthorized!" });

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
