import mongoose from "mongoose";
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: [true, "Tên sản phẩm không để trống"] },
    discount: {
      type: Number,
      min: [0, "Giảm giá phải lớn hơn hoặc bằng 0"],
      max: [100, "Giảm giá phải lớn hơn hoặc bằng 100"],
    },
    price: {
      type: Number,
      required: false,
    },
    stock: {
      type: Number,
      required: false,
    },
    is_variant: {
      type: Boolean,
      required: true,
      default: false,
    },
    product_image: String,
    description: {
      type: String,
    },
    sort_order: { type: Number, default: 10 },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    sub_category_id: {
      type: Schema.Types.ObjectId,
      ref: "sub_categories",
      required: false,
    },
    attributes: [{ type: Schema.Types.ObjectId, ref: "product_attributes" }],
    variants: [{ type: Schema.Types.ObjectId, ref: "product_variants" }],
    reviews: [{ type: Schema.Types.ObjectId, ref: "product_reviews" }],
    is_delete: { type: Boolean, default: false },
  },
  {
    versionKey: false, // Khi bạn lưu một đối tượng, nếu phiên bản của đối tượng trong cơ sở dữ liệu khác với phiên bản của đối tượng mà bạn đang cố ghi đè, thì MongoDB sẽ không cho phép lưu đối tượng.
    timestamps: true /* tự động tạo 2 field createdAt - updatedAt */,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

// Virtual with Populate
productSchema.virtual("category", {
  ref: "categories",
  localField: "category_id",
  foreignField: "_id",
  justOne: true,
});
productSchema.virtual("sub_category", {
  ref: "sub_categories",
  localField: "sub_category_id",
  foreignField: "_id",
  justOne: true,
});

//Virtuals
productSchema.virtual("total").get(function () {
  return (this.price * (100 - this.discount)) / 100;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = model("products", productSchema);

export default Product;
