import fs from "fs";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Employee from "../models/Employee.js";
import ProductVariant from "../models/ProductVariant.js";
import cloudinary from "cloudinary";

export const uploadImage = async (req, res, next) => {
  try {
    const collectionName = req.params.collectionName; // Lấy tên collection từ đường dẫn URL
    const id = req.params.id; // Lấy giá trị id từ đường dẫn URL
    // console.log(req.file);
    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }
    if (collectionName === "categories") {
      Category.findByIdAndUpdate(
        id,
        { image_url: req.file.path },
        {
          new: true,
        }
      ).then((result) => {
        // res.status(200).send(result); chỉ dùng để test api
        // res.json({ secure_url: req.file.path, msg: "Upload image sucess" }); chỉ dùng để test api
        return;
      });
    }
    if (collectionName === "employees") {
      Employee.findByIdAndUpdate(
        id,
        { avatar: req.file.path },
        {
          new: true,
        }
      ).then((result) => {
        // res.status(200).send(result); chỉ dùng để test api
        // res.json({ secure_url: req.file.path, msg: "Upload image sucess" }); chỉ dùng để test api
        return;
      });
    }
    if (collectionName === "products") {
      Product.findByIdAndUpdate(
        id,
        { product_image: req.file.path },
        {
          new: true,
        }
      ).then((result) => {
        // res.status(200).send(result); chỉ dùng để test api
        // res.json({ secure_url: req.file.path, msg: "Upload image sucess" }); chỉ dùng để test api
        return;
      });
    }
    if (collectionName === "variants-p") {
      ProductVariant.findByIdAndUpdate(
        id,
        { variant_image: req.file.path },
        {
          new: true,
        }
      ).then((result) => {
        // res.status(200).send(result); chỉ dùng để test api
        // res.json({ secure_url: req.file.path, msg: "Upload image sucess" }); chỉ dùng để test api
        return;
      });
    } else {
      res.json({ msg: "CollectionName UnKnown" });
    }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const uploadMultipleImage = async (req, res, next) => {
  try {
    const collectionName = req.params.collectionName; // Lấy tên collection từ đường dẫn URL
    const id = req.params.id; // Lấy giá trị id từ đường dẫn URL
    console.log(req.files);
    if (!req.files) {
      next(new Error("No file uploaded!"));
      return;
    }
    console.log(1);
    let multiplePicturePromise = req.files.map((file) =>
      cloudinary.v2.uploader.upload(file.path)
    );
    console.log(2);
    // await all the cloudinary upload functions in promise.all, exactly where the magic happens
    let imageResponses = await Promise.all(multiplePicturePromise);
    res.status(200).json({ src: imageResponses });
    console.log(3);
    // if (collectionName === "variants") {
    //   ProductVariant.findByIdAndUpdate(
    //     id,
    //     { src: req.file.path },
    //     {
    //       new: true,
    //     }
    //   ).then((result) => {
    //     res.status(200).send(result); //chỉ dùng để test api
    //     res.json({ secure_url: req.file.path, msg: "Upload image sucess" }); //chỉ dùng để test api
    //     return;
    //   });
    // }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
