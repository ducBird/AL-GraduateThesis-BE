import AccumulatedMoney from "../models/AccumulatedMoney.js";
import moment from "moment";

// GETS
export const getAccumulatedMoney = (req, res, next) => {
  try {
    AccumulatedMoney.find()
      .sort({ name: 1 })
      .then((result) => {
        const formattedResult = result.map((accumulatedmoney) => {
          const formattedCreatedAt = moment(accumulatedmoney.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(accumulatedmoney.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          return {
            ...accumulatedmoney.toObject(),
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
export const getByIdAccumulatedMoney = (req, res, next) => {
  if (req.params.id === "search") {
    next();
    return;
  }
  try {
    const { id } = req.params;
    AccumulatedMoney.findById(id).then((result) => {
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
export const postAccumulatedMoney = async (req, res, next) => {
  try {
    const data = req.body;
    const accumulatedmoney = await AccumulatedMoney.findOne({
      name: data.name,
    });
    if (accumulatedmoney) {
      res
        .status(406)
        .send({ msg: "AccumulatedMoney name has been duplicated!" });
      return;
    }
    const newItem = new AccumulatedMoney(data);
    await newItem.save();
    res.status(201).send(newItem);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

// PATCH BY ID
export const updateAccumulatedMoney = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    AccumulatedMoney.findByIdAndUpdate(id, data, {
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
export const deleteAccumulatedMoney = (req, res, next) => {
  try {
    const { id } = req.params;
    AccumulatedMoney.findByIdAndDelete(id).then((result) => {
      res.send(result);
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
