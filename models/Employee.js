import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Mongoose Datatypes:
// https://mongoosejs.com/docs/schematypes.html
const employeeSchema = new Schema(
  {
    first_name: {
      type: String,
      required: [true, "Họ - Tên đệm bắt buộc phải nhập"],
    },
    last_name: { type: String, required: [true, "Tên bắt buộc phải nhập"] },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dnqqkpsjk/image/upload/v1689253493/AquaticLand/employees/accountant_jxvwv1.png",
    },
    phone_number: {
      type: String,
      validate: {
        validator: function (value) {
          const phoneNumberRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
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
      required: true,
      min: [5, "Password must be between 5-30 characters"],
      max: [30, "Password must be between 5-50 characters"],
    },
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
    active: { type: Boolean, default: true },
    roles: {
      type: String,
      default: "sales",
      validate: {
        validator: (value) => {
          if (["admin", "shipper", "sales"].includes(value)) {
            return true;
          }
          return false;
        },
        message: `Vai trò: {VALUE} không hợp lệ!`,
      },
    },
    is_delete: { type: Boolean, default: false },
  },
  { timestamps: true } /* tự động tạo 2 field createdAt - updatedAt */
);

// Virtuals
employeeSchema.virtual("full_name").get(function () {
  return this.first_name + " " + this.last_name;
});

employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.set("toObject", { virtuals: true });

const Employee = model("employees", employeeSchema);

export default Employee;
