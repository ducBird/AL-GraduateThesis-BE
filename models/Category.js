import mongoose from "mongoose";

const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
    },
    image_url: String,
    is_delete: { type: Boolean, default: false },
  },
  { timestamps: true } /* tự động tạo 2 field createdAt - updatedAt */
);

const Category = model("categories", categorySchema);

export default Category;
