import Employee from "../models/Employee.js";
import moment from "moment";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// GETS
export const getEmployees = (req, res, next) => {
  try {
    Employee.find()
      .sort({ lastName: 1 })
      .then((result) => {
        const formattedResult = result.map((employee) => {
          const formattedCreatedAt = moment(employee.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(employee.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedBirthDay = moment(employee.birth_day).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          return {
            ...employee.toObject(),
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
export const getByIdEmployee = (req, res, next) => {
  if (req.params.id === "search") {
    next();
    return;
  }
  try {
    const { id } = req.params;
    Employee.findById(id).then((result) => {
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
export const postEmployee = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ msg: "Please fill in all fields." });

    if (!validateEmail(email))
      return res.status(400).json({ msg: "Invalid emails." });

    const user = await Employee.findOne({ email });
    if (user)
      return res.status(400).json({ msg: "This email already exists." });

    if (password.length < 5 || password.length > 50)
      return res
        .status(400)
        .json({ msg: "Password must be between 5 and 50 characters." });

    const newUser = new Employee({
      first_name,
      last_name,
      email,
      password: passwordHash,
    });
    newUser.save().then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

// PATCH BY ID
export const updateEmployee = (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    Employee.findByIdAndUpdate(id, data, {
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
export const deleteEmployee = (req, res, next) => {
  try {
    const { id } = req.params;
    Employee.findByIdAndDelete(id).then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Employee.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "This email does not exist." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Password is incorrect." });
    const access_token = createAccessToken({ id: user.id, roles: user.roles });
    const refresh_token = createRefreshToken({
      id: user._id,
      roles: user.roles,
    });
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
      const access_token = createAccessToken({
        id: user.id,
        roles: user.roles,
      });
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
    expiresIn: "7d",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
