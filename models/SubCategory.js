import mongoose from "mongoose";

const { Schema, model } = mongoose;

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    is_delete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

subCategorySchema.virtual("category", {
  ref: "categories",
  localField: "category_id",
  foreignField: "_id",
  justOne: true,
});
subCategorySchema.set("toJSON", { virtuals: true });
subCategorySchema.set("toObject", { virtuals: true });

const SubCategory = model("sub_categories", subCategorySchema);

export default SubCategory;
