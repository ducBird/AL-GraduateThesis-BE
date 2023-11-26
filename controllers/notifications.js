import Notification from "../models/Notification.js";
import moment from "moment";

// GETS
export const getNotifications = (req, res, next) => {
  try {
    Notification.find()
      .sort({ name: 1 })
      .populate("customer")
      .populate("order_details.product")
      .then((result) => {
        const formattedResult = result.map((notification) => {
          const formattedCreatedAt = moment(notification.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(notification.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          return {
            ...notification.toObject(),
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
export const getByIdNotification = (req, res, next) => {
  if (req.params.id === "search") {
    next();
    return;
  }
  try {
    const { id } = req.params;
    Notification.findById(id).then((result) => {
      const formattedCreatedAt = moment(result.createdAt).format(
        "YYYY/MM/DD HH:mm:ss"
      );
      const formattedUpdatedAt = moment(result.updatedAt).format(
        "YYYY/MM/DD HH:mm:ss"
      );
      res.status(200).send({
        ...result.toObject(),
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
export const postNotification = async (req, res, next) => {
  try {
    const data = req.body;
    const newItem = new Notification(data);
    await newItem.save();
    res.status(201).send(newItem);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

// PATCH BY ID
export const updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    Notification.findByIdAndUpdate(id, data, {
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
export const deleteNotification = (req, res, next) => {
  try {
    const { id } = req.params;
    Notification.findByIdAndDelete(id).then((result) => {
      res.send(result);
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
