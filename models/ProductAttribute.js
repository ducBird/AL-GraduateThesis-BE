import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productAttributeSchema = new Schema(
  {
    attribute_name: {
      type: String,
    },
    values: [String],
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "products",
    },
  },
  {
    versionKey: false,
  }
);

productAttributeSchema.virtual("product", {
  ref: "products",
  localField: "product_id",
  foreignField: "_id",
  justOne: true,
});

productAttributeSchema.set("toJSON", { virtuals: true });
productAttributeSchema.set("toObject", { virtuals: true });

const ProductAttribute = model("product_attributes", productAttributeSchema);

export default ProductAttribute;
