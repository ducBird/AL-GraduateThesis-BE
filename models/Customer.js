import mongoose from "mongoose";

const { Schema, model } = mongoose;
const customerCartSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  attributes: [{ type: Schema.Types.ObjectId, ref: "product_attributes" }],
  variants_id: { type: Schema.Types.ObjectId, ref: "product_variants" },
  quantity: { type: Number, require: false, min: 0 },
});

customerCartSchema.virtual("product", {
  ref: "products",
  localField: "product_id",
  foreignField: "_id",
  justOne: true,
});
customerCartSchema.virtual("variants", {
  ref: "product_variants",
  localField: "variants_id",
  foreignField: "_id",
  justOne: true,
});
customerCartSchema.set("toJSON", { virtuals: true });
customerCartSchema.set("toObject", { virtuals: true });

const customerSchema = new Schema(
  {
    first_name: {
      type: String,
      required: [true, "Họ - Tên đệm bắt buộc phải nhập"],
    },
    last_name: { type: String, required: [true, "Tên bắt buộc phải nhập"] },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dnqqkpsjk/image/upload/v1689253452/AquaticLand/customers/user_wlliq2.png",
    },
    phone_number: {
      type: String,
      validate: {
        validator: function (value) {
          const phoneNumberRegex =
            /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
          return phoneNumberRegex.test(value);
        },
        message: `{VALUE} không phải là số điện thoại hợp lệ`,
      },
    },
    address: { type: String },
    email: {
      type: String,
      required: [true, "Email bắt buộc phải nhập"],
      validate: {
        validator: function (value) {
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(value);
        },
        message: `{VALUE} không phải là email hợp lệ`,
        // message: (props) => `{props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      min: [5, "Mật khẩu phải có độ dài từ 5-30 ký tự"],
      max: [30, "Mật khẩu phải có độ dài từ 5-30 ký tự"],
    },
    google_id: { type: String },
    facebook_id: { type: String },
    birth_day: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true;
          if (value >= Date.now()) return false;
          return true;
        },
        message: "Ngày hợp lệ ở định dạng yyyy/dd/mm",
      },
    },
    account_type: { type: String, default: "email" },
    active: { type: Boolean, default: true },
    is_delete: { type: Boolean, default: false },
    // điểm tích lũy
    points: { type: Number, default: 0, required: false },
    customer_cart: [customerCartSchema],
  },
  { timestamps: true }
);

// Virtuals
customerSchema.virtual("full_name").get(function () {
  return this.first_name + " " + this.last_name;
});

customerSchema.set("toJSON", { virtuals: true });
customerSchema.set("toObject", { virtuals: true });

const Customer = model("customers", customerSchema);

export default Customer;
