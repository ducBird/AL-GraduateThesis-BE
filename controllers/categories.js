import Category from "../models/Category.js";
import moment from "moment";

// GETS
export const getCategories = (req, res, next) => {
  try {
    Category.find()
      .sort({ name: 1 })
      .then((result) => {
        const formattedResult = result.map((category) => {
          const formattedCreatedAt = moment(category.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(category.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          return {
            ...category.toObject(),
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
export const getByIdCategory = (req, res, next) => {
  if (req.params.id === "search") {
    next();
    return;
  }
  try {
    const { id } = req.params;
    Category.findById(id).then((result) => {
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
export const postCategory = async (req, res, next) => {
  try {
    const data = req.body;
    const category = await Category.findOne({
      name: data.name,
    });
    if (category) {
      res.status(406).send({ msg: "Category name has been duplicated!" });
      return;
    }
    const newItem = new Category(data);
    await newItem.save();
    res.status(201).send(newItem);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

// PATCH BY ID
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    Category.findByIdAndUpdate(id, data, {
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
export const deleteCategory = (req, res, next) => {
  try {
    const { id } = req.params;
    Category.findByIdAndDelete(id).then((result) => {
      res.send(result);
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
