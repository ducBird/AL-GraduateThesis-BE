import Customer from "../models/Customer.js";
import moment from "moment";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { FRONTLINE_URL } from "../constants/URLS.js";
import { sendEmail } from "./sendMail.js";

// GETS
export const getCustomers = (req, res, next) => {
  try {
    Customer.find()
      .populate("customer_cart.product")
      .populate("customer_cart.variants")
      .sort({ lastName: 1 })
      .then((result) => {
        const formattedResult = result.map((customer) => {
          const formattedCreatedAt = moment(customer.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(customer.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedBirthDay = moment(customer.birth_day).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          return {
            ...customer.toObject(),
            birth_day: formattedBirthDay,
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
          };
        });
        res.status(200).send(formattedResult);
      });
  } catch (error) {
    res.sendStatus(500);
  }
};

// GET BY ID
export const getByIdCustomer = (req, res, next) => {
  if (req.params.id === "search" || req.params.id === "logout") {
    next();
    return;
  }
  try {
    const { id } = req.params;
    Customer.findById(id)
      .populate("customer_cart.product")
      .populate("customer_cart.variants")
      .then((result) => {
        const formattedCreatedAt = moment(result.createdAt).format(
          "YYYY/MM/DD HH:mm:ss"
        );
        const formattedUpdatedAt = moment(result.updatedAt).format(
          "YYYY/MM/DD HH:mm:ss"
        );
        const formattedBirthDay = moment(result.birth_day).format(
          "YYYY/MM/DD HH:mm:ss"
        );
        res.status(200).send({
          ...result.toObject(),
          birth_day: formattedBirthDay,
          createdAt: formattedCreatedAt,
          updatedAt: formattedUpdatedAt,
        });
      });
  } catch (error) {
    console.log("error", error);
    res.sendStatus(500);
  }
};

// GET BY QUERY STRING
export const search = (req, res, next) => {
  const { id, firstName, lastName } = req.query;
  console.log(`id: ${id}`);
  res.send("OK query string");
};

// POST
export const postCustomer = async (req, res, next) => {
  try {
    const data = req.body;
    //check whether this current user exists in our database
    const user = await Customer.findOne({
      email: data.email,
    });
    if (user) {
      res.status(406).send({ msg: "Tài khoản email đã tồn tại!" });
      return;
    }
    // create a new customer
    const newItem = new Customer(data);
    newItem.save().then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

// PATCH BY ID
export const updateCustomer = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const { password } = req.body;
    // Nếu có mật khẩu mới, hash lại và cập nhật
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Cập nhật mật khẩu trong DB
      // await Customer.findByIdAndUpdate(id, { password: passwordHash });
      data.password = passwordHash;
    }

    await Customer.findByIdAndUpdate(id, data, {
      new: true,
    }).then((result) => {
      res.status(200).send(result);
      return;
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
    return;
  }
};

// update customer dựa trên cart
export const updateCartItemById = async (req, res, next) => {
  try {
    const customerId = req.params.customerId;
    const cartItemId = req.params.cartItemId;
    const { quantity } = req.body; // Lấy quantity từ body

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    // Tìm sản phẩm trong giỏ hàng có id trùng với cartItemId
    const cartItem = customer.customer_cart.find(
      (item) => item._id.toString() === cartItemId
    );

    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    // Cập nhật số lượng sản phẩm
    cartItem.quantity = quantity;

    // Lưu thay đổi vào cơ sở dữ liệu
    await customer.save();

    res.json({ message: "Cập nhật giỏ hàng thành công", customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// DELETE BY ID
export const deleteCustomer = (req, res, next) => {
  try {
    const { id } = req.params;
    Customer.findByIdAndDelete(id).then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
};

// delete customer_cart
export const deleteCustomerCart = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { $set: { customer_cart: [] } },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).send("Customer not found");
    }
    res.send(updatedCustomer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
// DELETE CART ITEM BY ID
// export const deleteCartItemById = async (req, res, next) => {
//   try {
//     const customerId = req.params.customerId;
//     const productId = req.params.productId;
//     const variantId = req.params.variantId;

//     const customer = await Customer.findById(customerId);

//     if (!customer) {
//       return res.status(404).json({ message: "Không tìm thấy khách hàng" });
//     }

//     // Tìm sản phẩm trong giỏ hàng có id trùng với cartItemId
//     const cartItemIndex = customer.customer_cart.findIndex(
//       (item) =>
//         item.product_id.toString() === productId &&
//         item.variants_id.toString() === variantId
//     );

//     if (cartItemIndex === -1) {
//       return res
//         .status(404)
//         .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
//     }

//     // Xóa sản phẩm khỏi giỏ hàng
//     customer.customer_cart.splice(cartItemIndex, 1);

//     // Lưu thay đổi vào cơ sở dữ liệu
//     await customer.save();

//     res.json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công", customer });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Lỗi server" });
//   }
// };

export const deleteCartItemById = async (req, res, next) => {
  try {
    const customerId = req.params.customerId;
    const productId = req.params.productId;
    const variantId = req.params.variantId;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    // Tìm tất cả các sản phẩm trong giỏ hàng có cùng product_id và variants_id
    const matchingItems = customer.customer_cart.filter((item) => {
      const productMatch = item?.product_id?.toString() === productId;
      const variantMatch =
        !variantId ||
        (item?.variants_id && item?.variants_id.toString() === variantId);
      return productMatch && variantMatch;
    });

    if (matchingItems.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    // Xóa tất cả các sản phẩm khỏi giỏ hàng
    // matchingItems.forEach((matchingItem) => {
    //   const cartItemIndex = customer.customer_cart.findIndex(
    //     (item) =>
    //       item.product_id.toString() === matchingItem.product_id.toString() &&
    //       item.variants_id.toString() === matchingItem.variants_id.toString()
    //   );

    //   if (cartItemIndex !== -1) {
    //     customer.customer_cart.splice(cartItemIndex, 1);
    //   }
    // });

    matchingItems.forEach((matchingItem) => {
      const cartItemIndex = customer.customer_cart.findIndex((item) => {
        const productMatch =
          item.product_id.toString() === matchingItem.product_id.toString();
        const variantMatch =
          !variantId ||
          (item.variants_id &&
            item.variants_id.toString() ===
              matchingItem.variants_id.toString());
        return productMatch && variantMatch;
      });

      if (cartItemIndex !== -1) {
        customer.customer_cart.splice(cartItemIndex, 1);
      }
    });

    // Lưu thay đổi vào cơ sở dữ liệu
    await customer.save();

    res.json({
      message: "Xóa tất cả sản phẩm có product_id và variants_id thành công",
      customer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Register
export const registerCustomer = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ msg: "Vui lòng điền vào tất cả các mục." });

    if (!validateEmail(email))
      return res.status(400).json({ msg: "Email không hợp lệ." });

    const user = await Customer.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email này đã tồn tại." });

    if (password.length < 5 || password.length > 50)
      return res.status(400).json({ msg: "Mật khẩu phải từ 5 - 50 ký tự" });

    const newUser = {
      first_name,
      last_name,
      email,
      password: passwordHash,
    };

    // const activation_token = createActivationToken(newUser);
    // decode activate_token vì có dấu chấm khi gửi về client sẽ không nhận diện được đường dẫn
    const activation_token = Buffer.from(
      createActivationToken(newUser)
    ).toString("base64");

    const url = `${FRONTLINE_URL}/customers/activate/${activation_token}`;
    sendEmail(email, url, "Xác minh địa chỉ email của bạn.");

    res.status(200).json({
      msg: "Đăng ký thành công! Vui lòng kích hoạt email của bạn để bắt đầu.",
      customers: newUser,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const activateEmail = async (req, res) => {
  try {
    const { activated_token } = req.body;
    const user = jwt.verify(
      activated_token,
      process.env.ACTIVATION_TOKEN_SECRET
    );

    const { first_name, last_name, email, password } = user;

    const check = await Customer.findOne({ email });
    if (check) return res.status(400).json({ msg: "Email này đã tồn tại." });
    // console.log(user);

    const newUser = new Customer({
      first_name,
      last_name,
      email,
      password,
    });

    await newUser.save();

    res.json({ msg: "Tài khoản đã được kích hoạt!" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Customer.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Email này không tồn tại." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Mật khẩu không đúng." });
    const access_token = createAccessToken({ id: user.id });
    const refresh_token = createRefreshToken({ id: user._id });
    res.cookie("refreshtoken", refresh_token, {
      // httpOnly: true,
      // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });
    const { password: string, ...others } = user._doc;
    // console.log(refresh_token);
    res.json({
      msg: "Đăng nhập thành công!",
      user: { ...others },
      access_token,
      refresh_token,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const getAccessToken = (req, res) => {
  try {
    // const rf_token = req.cookies.refreshtoken;
    const refresh_token = req.body.refresh_token;
    if (!refresh_token)
      return res.status(400).json({ msg: "Hãy đăng nhập ngay bây giờ!" });
    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err)
        return res.status(400).json({ msg: "Hãy đăng nhập ngay bây giờ!" });
      const access_token = createAccessToken({ id: user.id });
      res.json({ access_token });
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Customer.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Email không tồn tại!" });
    // decode activate_token vì có dấu chấm khi gửi về client sẽ không nhận diện được đường dẫn
    const access_token = Buffer.from(
      createAccessToken({ id: user._id })
    ).toString("base64");
    const url = `${FRONTLINE_URL}/customers/reset/${access_token}`;

    sendEmail(email, url, "Đặt lại mật khẩu của bạn");
    res.json({
      msg: "Đã gửi yêu cầu đổi mật khẩu, Vui lòng xem tin nhắn trong email!",
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await Customer.findOneAndUpdate(
      { _id: req.user.id },
      {
        password: passwordHash,
      }
    );

    res.json({ msg: "Đổi mật khẩu thành công!" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const id = req.params.id;

    const user = await Customer.findOne({ _id: id });
    if (!user) return res.status(400).json({ msg: "Tài khoản không đúng." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Mật khẩu cũ không chính xác!" });

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    await Customer.findOneAndUpdate(
      { _id: id },
      {
        password: newPasswordHash,
      }
    );
    res.json({
      msg: "Mật khẩu được đổi thành công!",
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const loginGoogleSuccess = (req, res) => {
  // nếu client báo lỗi: Access to XMLHttpRequest at 'http://localhost:9000/customers/login/success' from origin 'http://localhost:3000' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
  // thì dùng 2 dòng header bên dưới
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);

  if (req.user.unique === true) {
    res.status(404).send({
      unique: true,
      msg: "Email đã tồn tại, có thể bạn đã quên mật khẩu!",
    });
    return;
  } else if (req.user) {
    res.status(200).send({
      success: true,
      message: "Đăng nhập thành công",
      user: req.user.user,
      access_token: req.user.accessToken,
      cookie: req.cookies,
    });
  }
};

export const loginGoogleFailure = (req, res) => {
  res.status(401).json({
    success: false,
    message: "Đăng nhập thất bại",
  });
};

export const logout = async (req, res) => {
  try {
    // res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    // res.header("Access-Control-Allow-Credentials", true);
    // cần phải đặt tham số path và domain khi gọi hàm res.clearCookie để xóa cookie trên cả client và server. Bạn cũng cần phải bao gồm credentials ở phía frontend, nếu không thì không có cookie nào được gửi với yêu cầu. Nếu không có cookie nào đến server, nó sẽ không có gì để xóa.
    // với code còn đang development ở local thì không cần có tham số truyền vào là domain
    res.clearCookie("refreshtoken", {
      path: "/",
      domain: "localhost",
    });
    res.clearCookie("session_google_account", {
      path: "/",
      domain: "localhost",
      httpOnly: true,
    });
    // res.clearCookie("refreshtoken");
    // res.clearCookie("session_google_account");
    // res.json({ msg: "Đã đăng xuất." });
    res.redirect("http://localhost:3000");
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "10m",
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

/* có thể dùng cách này đối với đoạn mã postCustomer */
/* export const postCustomer = (req, res, next) => {
  try {
    const data = req.body;
    const newItem = new Customer(data);
    newItem.save().then((result) => {
      const formattedResult = {
        ...result._doc,
        createdAt: moment(result.createdAt).format("YYYY/MM/DD HH:mm:ss"),
        updatedAt: moment(result.updatedAt).format("YYYY/MM/DD HH:mm:ss"),
      };
      res.send(formattedResult);
    });
    //  hoặc
    // newItem.save().then((result) => {
    //   const formattedCreatedAt = moment(result.createdAt).format(
    //     "YYYY/MM/DD HH:mm:ss"
    //   );
    //   const formattedUpdatedAt = moment(result.updatedAt).format(
    //     "YYYY/MM/DD HH:mm:ss"
    //   );
    //   res.status(200).send({
    //     ...result.toObject(),
    //     createdAt: formattedCreatedAt,
    //     updatedAt: formattedUpdatedAt,
    //   });
    // });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  } */

/* 
Trong đoạn mã trên, result._doc là đối tượng kết quả trả về sau khi lưu thành công, moment(result.createdAt) sẽ trả về một đối tượng moment từ giá trị của trường createdAt, và moment(result.createdAt).format("YYYY/MM/DD HH:mm:ss") sẽ trả về một chuỗi định dạng ngày giờ theo yêu cầu. Tương tự với trường updatedAt.
Lưu ý rằng các trường createdAt và updatedAt được tự động tạo bởi timestamps của mongoose, vì vậy bạn không cần phải ghi đè lên chúng trước khi lưu dữ liệu.
*/
// };
