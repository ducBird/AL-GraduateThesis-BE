import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import path from "path";
import "./config/dotenv.config.js";
import Customer from "./models/Customer.js";
import categoriesRouter from "./routers/categories.js";
import subCategoriesRouter from "./routers/subcategories.js";
import customersRouter from "./routers/customers.js";
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
import sseRouter from "./routers/realtimeNotificationSSE.js";
import voucherNotification from "./routers/notifications.js";
const app = express();
/*Middleware này sẽ giúp bạn chuyển đổi các dữ liệu truyền lên bằng phương thức POST thành một object JavaScript để sử dụng*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/* có thể dùng middleware này để phân tích được JSON (application/json)*/
/* app.use(express.json());
// app.use(express.urlencoded({ extended: false }));*/
app.use(cookieParser());

//use cookie-session
app.use(
  cookieSession({
    name: "session_google_account",
    keys: ["lama"],
    maxAge: 24 * 60 * 60 * 100,
  })
);
app.use(passport.initialize());
app.use(passport.session());
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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.MAILING_SERVICE_CLIENT_ID,
      clientSecret: process.env.MAILING_SERVICE_CLIENT_SECRET,
      callbackURL: "/customers/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log("access token ", accessToken);
      console.log("refresh token ", refreshToken);
      console.log("profile", profile);

      //check whether this current user exists in our database
      const user = await Customer.findOne({
        google_id: profile.id,
        account_type: "google",
      });
      if (user) return done(null, user);
      //else create a new user
      const googleAccount = {
        first_name: profile.name.familyName,
        last_name: profile.name.givenName,
        email: profile.emails[0].value,
        google_id: profile.id,
        avatar: profile.photos[0].value,
        account_type: profile.provider,
      };
      const accountCustomer = new Customer(googleAccount);
      accountCustomer.save().then((user) => done(null, user));
    }
  )
);
// use cookie-session
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

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
app.use("/sse", sseRouter);
app.use("/notifications", voucherNotification);
