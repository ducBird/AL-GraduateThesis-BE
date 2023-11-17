import Voucher from "../models/Voucher.js";
import moment from "moment";

// GETS
export const getVouchers = (req, res, next) => {
  try {
    Voucher.find()
      .sort({ name: 1 })
      .then((result) => {
        const formattedResult = result.map((voucher) => {
          const formatedStartDate = moment(voucher.startDate).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formatedExpirationDate = moment(voucher.expirationDate).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedCreatedAt = moment(voucher.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(voucher.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          return {
            ...voucher.toObject(),
            startDate: formatedStartDate,
            expirationDate: formatedExpirationDate,
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
export const getByIdVoucher = (req, res, next) => {
  if (req.params.id === "search") {
    next();
    return;
  }
  try {
    const { id } = req.params;
    Voucher.findById(id).then((result) => {
      const formatedStartDate = moment(voucher.startDate).format(
        "YYYY/MM/DD HH:mm:ss"
      );
      const formatedExpirationDate = moment(voucher.expirationDate).format(
        "YYYY/MM/DD HH:mm:ss"
      );
      const formattedCreatedAt = moment(result.createdAt).format(
        "YYYY/MM/DD HH:mm:ss"
      );
      const formattedUpdatedAt = moment(result.updatedAt).format(
        "YYYY/MM/DD HH:mm:ss"
      );
      res.status(200).send({
        ...result.toObject(),
        startDate: formatedStartDate,
        expirationDate: formatedExpirationDate,
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
  const { id, name } = req.query;
  console.log(id);
  console.log(name);
  res.send("OK");
};

// POST
export const postVoucher = async (req, res, next) => {
  try {
    const data = req.body;
    const voucher = await Voucher.findOne({
      name: data.name,
    });
    if (voucher) {
      res.status(406).send({ msg: "Tên voucher không được trùng lặp" });
      return;
    }
    const newItem = new Voucher(data);
    await newItem.save();
    res.status(201).send(newItem);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

// PATCH BY ID
export const updateVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    Voucher.findByIdAndUpdate(id, data, {
      new: true,
    }).then((result) => {
      res.status(200).send(result);
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

// DELETE BY ID
export const deleteVoucher = (req, res, next) => {
  try {
    const { id } = req.params;
    Voucher.findByIdAndDelete(id).then((result) => {
      res.send(result);
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
