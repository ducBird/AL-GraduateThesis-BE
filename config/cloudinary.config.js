import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Cấu hình CloudinaryStorage cho multer
const storage = new CloudinaryStorage({
  cloudinary,
  // filename: function (req, file, cb) {
  //   cb(null, file.originalname);
  // },
  params: (req, file, cb) => {
    const collectionName = req.params.collectionName; // Lấy tên collection từ đường dẫn URL
    const id = req.params.id; // Lấy giá trị id từ đường dẫn URL
    return {
      folder: `AquaticLand/${collectionName}/${id}`, // Định dạng tên thư mục cha, con và id
      // filename: file.originalname,
      allowedFormats: ["jpg", "png", "jpeg"],
    };
  },
});

// Sử dụng CloudinaryStorage trong multer
const uploadCloud = multer({ storage });

export default uploadCloud;
