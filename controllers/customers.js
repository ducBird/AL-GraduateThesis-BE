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
    Customer.findById(id).then((result) => {
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
export const updateCustomer = (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    Customer.findByIdAndUpdate(id, data, {
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

// Register
export const registerCustomer = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ msg: "Please fill in all fields." });

    if (!validateEmail(email))
      return res.status(400).json({ msg: "Invalid emails." });

    const user = await Customer.findOne({ email });
    if (user)
      return res.status(400).json({ msg: "This email already exists." });

    if (password.length < 5 || password.length > 50)
      return res
        .status(400)
        .json({ msg: "Password must be between 5 and 50 characters." });

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
    sendEmail(email, url, "Verify your email address");

    res.status(200).json({
      msg: "Register Success! Please activate your email to start.",
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
    if (check)
      return res.status(400).json({ msg: "This email already exists." });
    // console.log(user);

    const newUser = new Customer({
      first_name,
      last_name,
      email,
      password,
    });

    await newUser.save();

    res.json({ msg: "Account has been activated!" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Customer.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "This email does not exist." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Password is incorrect." });
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
      msg: "Login success!",
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
      return res.status(400).json({ msg: "Please login now!" });
    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(400).json({ msg: "Please login now!" });
      const access_token = createAccessToken({ id: user.id });
      res.json({ access_token });
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshtoken");
    res.json({ msg: "Logged out." });
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
