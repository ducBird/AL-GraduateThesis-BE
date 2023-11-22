import mongoose from "mongoose";
const { Schema, model } = mongoose;

const productReviewSchema = new Schema(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "customers",
      required: true,
    },
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "orders",
      required: true,
    },
    reviews: [
      {
        product_id: {
          type: Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
        },
        date: {
          type: Date,
        },
      },
    ],
    // trường lưu số lần đánh giá trên một đơn hàng
    reviewCount: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual with Populate
productReviewSchema.virtual("product", {
  ref: "products",
  localField: "product_id",
  foreignField: "_id",
  justOne: true,
});
productReviewSchema.virtual("customer", {
  ref: "customers",
  localField: "customer_id",
  foreignField: "_id",
  justOne: true,
});
productReviewSchema.set("toJSON", { virtuals: true });
productReviewSchema.set("toObject", { virtuals: true });

const ProductReview = model("product_reviews", productReviewSchema);

export default ProductReview;
