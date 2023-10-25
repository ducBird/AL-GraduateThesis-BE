import mongoose from "mongoose";
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: [true, "Product name is require"] },
    discount: {
      type: Number,
      min: [0, "Discount must be greater than 0"],
      max: [100, "Discount must be less than 100"],
    },
    price: {
      type: Number,
      required: false,
    },
    product_image: String,
    description: {
      type: String,
    },
    date_of_manufacture: {
      type: Date,
      required: [true, "Ngày sản xuất bắt buộc phải nhập"],
      default: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      // Có thể viết chi tiết như sau
      // default: function () {
      //   var date = new Date();
      //   var days = 30;
      //   var miliSecondsPerDay = 24 * 60 * 60 * 1000;
      //   var currentDate = date.getTime();
      //   var modifiedDate = new Date(currentDate - days * miliSecondsPerDay);
      //   return modifiedDate;
      // },
    },
    expiration_date: {
      type: Date,
      required: [true, "Ngày hết hạn bắt buộc phải nhập"],
      default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
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
    },
    supplier_id: {
      type: Schema.Types.ObjectId,
      ref: "suppliers",
      required: true,
    },
    variants: [{ type: Schema.Types.ObjectId, ref: "product_variants" }],
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
productSchema.virtual("supplier", {
  ref: "suppliers",
  localField: "supplier_id",
  foreignField: "_id",
  justOne: true,
});

//Virtuals
productSchema.virtual("total").get(function () {
  return (this.price * (100 - this.discount)) / 100;
});

// productSchema.virtual("stock").get(function () {
//   return this.variants.reduce((total, variant) => {
//     return total + variant.inventory_quantity;
//   }, 0);
// });

// productSchema.virtual("price").get(function () {
//   const prices = this.variants.map((variant) => variant.price_adjustment);
//   return Math.min(...prices);
// });
// //hoặc có thể dùng cách này để lấy ra price_adjustment nhỏ nhất
// productSchema.virtual("price").get(function () {
//   // Lấy mảng variants từ product
//   const variants = this.variants;

//   // Nếu mảng variants không có phần tử nào, trả về null
//   if (variants.length === 0) {
//     return null;
//   }

//   // Tìm giá trị nhỏ nhất của price_adjustment
//   const minPrice = variants.reduce((min, variant) => {
//     return variant.price_adjustment < min ? variant.price_adjustment : min;
//   }, variants[0].price_adjustment);

//   // Trả về giá trị tìm được
//   return minPrice;
// });

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = model("products", productSchema);

export default Product;
