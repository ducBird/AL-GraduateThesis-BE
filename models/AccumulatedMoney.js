import mongoose from "mongoose";

const { Schema, model } = mongoose;

const AccumulatedMoneySchema = new Schema(
  {
    name: { type: String, required: [true, "Bắt buộc nhập"] },
    // phần trăm để tích lũy tiền
    percent: { type: Number, required: [true, "Bắt buộc nhập"] },
  },
  /* tự động tạo 2 field createdAt - updatedAt */
  { timestamps: true }
);

const AccumulatedMoney = model("accumulatedmoneys", AccumulatedMoneySchema);
export default AccumulatedMoney;
