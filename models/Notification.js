import mongoose from "mongoose";
import { orderDetailSchema } from "./Order.js";

const { Schema, model } = mongoose;

const NotificationSchema = new Schema(
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
    message: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    order_details: [orderDetailSchema],
  },
  { timestamps: true } /* tự động tạo 2 field createdAt - updatedAt */
);
// Virtual with Populate
NotificationSchema.virtual("product", {
  ref: "products",
  localField: "product_id",
  foreignField: "_id",
  justOne: true,
});
NotificationSchema.virtual("customer", {
  ref: "customers",
  localField: "customer_id",
  foreignField: "_id",
  justOne: true,
});
NotificationSchema.virtual("order", {
  ref: "orders",
  localField: "order_id",
  foreignField: "_id",
  justOne: true,
});
NotificationSchema.set("toJSON", { virtuals: true });
NotificationSchema.set("toObject", { virtuals: true });
const Notification = model("notifications", NotificationSchema);

export default Notification;
