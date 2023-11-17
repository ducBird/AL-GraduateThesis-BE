import mongoose from "mongoose";

const { Schema, model } = mongoose;

const voucherSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Tên voucher bắt buộc nhập"],
    },
    price: {
      type: Number,
      required: function () {
        return this.isFreeShipping
          ? [true, "Giá giảm bắt buộc phải nhập"]
          : false;
      },
      // default: undefined,
    },
    // phần trăm giảm giá
    discountPercentage: {
      type: Number,
      required: function () {
        return !this.isFreeShipping
          ? [true, "Phần trăm giảm bắt buộc phải nhập"]
          : false;
      },
      min: [0, "Phần trăm giảm giá phải lớn hơn hoặc bằng 0"],
      max: [100, "Phần trăm giảm giá phải nhỏ hơn hoặc bằng 100"],
    },
    // giá giảm tối đa
    maxDiscountAmount: {
      type: Number,
      required: function () {
        return !this.isFreeShipping
          ? [true, "Giá trị tối đa giảm giá bắt buộc phải nhập"]
          : false;
      },
      min: [0, "Giá trị tối đa giảm giá phải lớn hơn hoặc bằng 0"],
    },
    minimumOrderAmount: {
      type: Number,
      required: [
        true,
        "Giá trị tối thiểu của đơn hàng để áp dụng voucher bắt buộc nhập",
      ],
      min: [
        0,
        "Giá trị tối thiểu của đơn hàng để áp dụng voucher phải lớn hơn 0",
      ],
    },
    condition: {
      type: String,
    },
    startDate: {
      type: Date,
      required: [true, "Ngày bắt đầu bắt buộc phải nhập"],
    },
    expirationDate: {
      type: Date,
      required: [true, "Ngày hết hạn bắt buộc nhập"],
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    isFreeShipping: {
      type: Boolean,
      required: true,
      default: false,
    },
    image_url: String,
  },
  /* tự động tạo 2 field createdAt - updatedAt */
  { timestamps: true }
);

const Voucher = model("vouchers", voucherSchema);
export default Voucher;
