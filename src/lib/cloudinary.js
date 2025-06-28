import { v2 as cloudinary } from "cloudinary";

import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// const cloudinary = require('cloudinary').v2;

// cloudinary.config({
//   cloud_name: 'your_cloud_name',
//   api_key: 'your_api_key',
//   api_secret: 'your_api_secret'
// });

// async function uploadLargeFile(filePath) {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       resource_type: "raw",
//       chunk_size: 60000000, // 60MB chunk size (adjust as needed)
//       public_id: "my_large_file",
//     });
//     console.log(result);
//   } catch (error) {
//     console.error(error);
//   }
// }

// // Example usage:
// uploadLargeFile('./path/to/your/large_image.jpg');
