import Product from "../models/Product.js";
import moment from "moment";

// GETS
export const getProducts = (req, res, next) => {
  const query = {};

  try {
    if (req.query.sub_category_id || req.query.category_id) {
      query[req.query.sub_category_id ? "sub_category_id" : "category_id"] = req
        .query.sub_category_id
        ? req.query.sub_category_id
        : req.query.category_id;
    }
    if (req.query.min_price && req.query.max_price) {
      query.price = {
        $gte: parseInt(req.query.min_price) | undefined,
        $lte: parseInt(req.query.max_price) | undefined,
      };
    }

    Product.find(query)
      .sort({ name: 1 })
      .populate("category")
      .populate("supplier")
      .populate("sub_category")
      .populate("variants")
      .then((result) => {
        const formattedResult = result.map((product) => {
          const formattedCreatedAt = moment(product.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(product.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedDateOfmanufacture = moment(
            product.date_of_manufacture
          ).format("YYYY/MM/DD HH:mm:ss");
          const formattedExprirationDate = moment(
            product.expiration_date
          ).format("YYYY/MM/DD HH:mm:ss");
          return {
            ...product.toObject(),
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
            date_of_manufacture: formattedDateOfmanufacture,
            expiration_date: formattedExprirationDate,
          };
        });
        res.status(200).send(formattedResult);
      });
  } catch (error) {
    res.sendStatus(500);
  }
};

export const getProductsByIdCategory = (req, res, next) => {
  const { category_id } = req.params;
  if (category_id === "search") {
    next();
    return;
  }
  try {
    Product.find({ category_id })
      .populate("category")
      .populate("variants")
      .then((result) => {
        const formattedResult = result.map((variant) => {
          const formattedCreatedAt = moment(variant.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(variant.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          return {
            ...variant.toObject(),
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
          };
        });
        res.status(200).send(formattedResult);
      });
  } catch (error) {
    console.log("error", error);
    res.sendStatus(500);
  }
};

export const getProductsByIdSubCategory = (req, res, next) => {
  const { sub_category_id } = req.params;
  if (sub_category_id === "search" || sub_category_id === "product") {
    next();
    return;
  }
  try {
    Product.find({ sub_category_id })
      .populate("sub_category")
      .populate("variants")
      .then((result) => {
        const formattedResult = result.map((variant) => {
          const formattedCreatedAt = moment(variant.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(variant.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          return {
            ...variant.toObject(),
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
          };
        });
        res.status(200).send(formattedResult);
      });
  } catch (error) {
    console.log("error", error);
    res.sendStatus(500);
  }
};

// GET BY ID PRODUCT
export const getByIdProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    Product.findById(id)
      // .populate("category")
      .populate("variants")
      .then((result) => {
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
        return;
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
export const postProduct = async (req, res, next) => {
  try {
    const data = req.body;
    const product = await Product.findOne({
      name: data.name,
    });
    if (product) {
      res.status(406).send({ msg: "Tên sản phẩm đã bị trùng lặp!" });
      return;
    }
    const newItem = new Product(data);
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
export const updateProduct = (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    Product.findByIdAndUpdate(id, data, {
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
export const deleteProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    Product.findByIdAndDelete(id).then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    let { name } = req.body;
    let query = { name: new RegExp(`${name}`, "i") };
    const results = await Product.find(query).populate("variants");
    res.json(results);
  } catch (error) {
    res.status(500).json(error);
  }
};
