import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productVariantSchema = new Schema(
  {
    title: {
      type: String, //size, color
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    variant_image: {
      type: String,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "products",
    },
  },
  {
    versionKey: false,
  }
);

productVariantSchema.virtual("product", {
  ref: "products",
  localField: "product_id",
  foreignField: "_id",
  justOne: true,
});

productVariantSchema.set("toJSON", { virtuals: true });
productVariantSchema.set("toObject", { virtuals: true });

const ProductVariant = model("product_variants", productVariantSchema);

export default ProductVariant;
