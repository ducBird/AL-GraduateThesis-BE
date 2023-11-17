import mongoose from "mongoose";
const { Schema, model } = mongoose;
const orderDetailSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: "products", required: false },
  variants_id: { type: Schema.Types.ObjectId, ref: "product_variants" },
  quantity: { type: Number, require: false, min: 0 },
});
orderDetailSchema.virtual("product", {
  ref: "products",
  localField: "product_id",
  foreignField: "_id",
  justOne: true,
});
orderDetailSchema.virtual("variants", {
  ref: "product_variants",
  localField: "variants_id",
  foreignField: "_id",
  justOne: true,
});
orderDetailSchema.set("toJSON", { virtuals: true });
orderDetailSchema.set("toObject", { virtuals: true });

const orderSchema = new Schema(
  {
    shipped_date: {
      type: Date,
    },
    first_name: {
      type: String,
      required: [true, "Họ - Tên đệm bắt buộc phải nhập"],
    },

    last_name: {
      type: String,
      required: [true, "Tên bắt buộc phải nhập"],
    },
    status: {
      type: String,
      required: [true, "Trạng thái bắt buộc phải nhập"],
      default: "WAIT FOR CONFIRMATION",
      validate: {
        validator: (value) => {
          if (
            [
              "WAIT FOR CONFIRMATION",
              "WAITING FOR PICKUP",
              "DELIVERING",
              "DELIVERED",
              "RECEIVED",
              "CANCELLED",
              "RETURNS",
              "RETURNING",
              "RETURNED",
            ].includes(value)
          ) {
            return true;
          }
          return false;
        },
        message: `Trạng thái: {VALUE} không hợp lệ!`,
      },
    },

    description: String,

    shipping_address: {
      type: String,
      required: [true, "Địa chỉ giao hàng bắt buộc phải nhập"],
    },
    payment_information: {
      type: String,
      required: [true, "Hình thức thanh toán bắt buộc phải nhập"],
      default: "CASH",
      validate: {
        validator: (value) => {
          if (
            ["CASH", "VNPAY", "MOMO", "PAYPAL"].includes(value.toUpperCase())
          ) {
            return true;
          }
          return false;
        },
        message: `Hình thức thanh toán: {VALUE} không hợp lệ!`,
      },
    },
    payment_status: {
      type: Boolean,
      required: true,
    },
    image_confirm: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "customers",
      required: false,
    },
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: "employees",
      required: false,
      default: null,
    },
    order_details: [orderDetailSchema],

    is_delete: { type: Boolean, default: false },
    total_money_order: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true } /* tự động tạo 2 field createdAt - updatedAt */
);
orderSchema.virtual("full_name").get(function () {
  return this.first_name + " " + this.last_name;
});

// Virtual with Populate
orderSchema.virtual("customer", {
  ref: "customers",
  localField: "customer_id",
  foreignField: "_id",
  justOne: true,
});

orderSchema.virtual("employee", {
  ref: "employees",
  localField: "employee_id",
  foreignField: "_id",
  justOne: true,
});
orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

const Order = model("orders", orderSchema);

export default Order;
