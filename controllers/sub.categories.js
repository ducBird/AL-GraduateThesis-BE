import SubCategory from "../models/SubCategory.js";
import moment from "moment";

// GETS
export const getSubCategories = (req, res, next) => {
  try {
    SubCategory.find()
      .sort({ name: 1 })
      .populate("category")
      .then((result) => {
        const formattedResult = result.map((subCategory) => {
          const formattedCreatedAt = moment(subCategory.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(subCategory.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          return {
            ...subCategory.toObject(),
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

export const getSubCategoriesByIdCategory = (req, res, next) => {
  const { category_id } = req.params;
  if (category_id === "search") {
    next();
    return;
  }
  try {
    SubCategory.find({ category_id })
      .populate("category")
      .then((result) => {
        res.status(200).send(result);
      });
  } catch (error) {
    console.log("error", error);
    res.sendStatus(500);
  }
};

// GET BY ID
export const getByIdSubCategory = (req, res, next) => {
  if (req.params.id === "search") {
    next();
    return;
  }
  try {
    const { id } = req.params;
    SubCategory.findById(id).then((result) => {
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
export const postSubCategory = async (req, res, next) => {
  try {
    const data = req.body;
    const newItem = new SubCategory(data);
    await newItem.save();
    res.status(201).send(newItem);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

// PATCH BY ID
export const updateSubCategory = (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    SubCategory.findByIdAndUpdate(id, data, {
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
export const deleteSubCategory = (req, res, next) => {
  try {
    const { id } = req.params;
    SubCategory.findByIdAndDelete(id).then((result) => {
      res.send(result);
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
