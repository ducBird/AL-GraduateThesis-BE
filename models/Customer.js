import mongoose from "mongoose";

const { Schema, model } = mongoose;

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
      unique: [true, "email đã tồn tại"],
    },
    password: {
      type: String,
      min: [5, "Password must be between 5-30 characters"],
      max: [30, "Password must be between 5-50 characters"],
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
