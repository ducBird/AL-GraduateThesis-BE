import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import "./config/dotenv.config.js";
import categoriesRouter from "./routers/categories.js";
import subCategoriesRouter from "./routers/subcategories.js";
import customersRouter from "./routers/customers.js";
import suppliersRouter from "./routers/suppliers.js";
import productsRouter from "./routers/products.js";
import productVariantsRouter from "./routers/product.variants.js";
import productAttributesRouter from "./routers/product.attribute.js";
import employeesRouter from "./routers/employees.js";
import uploadRouter from "./routers/upload.js";
import ordersRouter from "./routers/orders.js";
import paymentRouter from "./routers/payment.js";
import paymentPaypalRouter from "./routers/paymentPaypal.js";
import voucherRouter from "./routers/vouchers.js";
import accumulatedRouter from "./routers/accumulated.money.js";
import productReviewRouter from "./routers/product.review.js";
const app = express();
/*Middleware này sẽ giúp bạn chuyển đổi các dữ liệu truyền lên bằng phương thức POST thành một object JavaScript để sử dụng*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/* có thể dùng middleware này để phân tích được JSON (application/json)*/
/* app.use(express.json());
// app.use(express.urlencoded({ extended: false }));*/
app.use(cookieParser());
app.use(
  cors({
    // origin: "*",
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://sandbox.vnpayment.vn",
      "https://www.google.com",
      "*",
    ],
    methods: "GET,POST,PATCH,DELETE,PUT,OPTIONS",
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "access_token",
      "refreshtoken",
    ],
    preflightContinue: false,
  })
);
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

  next();
});
// });
const PORT = process.env.PORT || 9000;
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_MONGODB_URL);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
connectDB(); //call function connectDB()

app.use("/categories", categoriesRouter);
app.use("/sub-categories", subCategoriesRouter);
app.use("/customers", customersRouter);
app.use("/suppliers", suppliersRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/variants-p", productVariantsRouter);
app.use("/attributes-p", productAttributesRouter);
app.use("/employees", employeesRouter);
app.use("/upload", uploadRouter);
app.use("/payment", paymentRouter);
app.use("/payment-paypal", paymentPaypalRouter);
app.use("/vouchers", voucherRouter);
app.use("/accumulateds", accumulatedRouter);
app.use("/product-review", productReviewRouter);
