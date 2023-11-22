import ProductReview from "../models/ProductReview.js";
import moment from "moment";

// GETS
export const getProductsReview = (req, res, next) => {
  try {
    ProductReview.find()
      .sort({ name: 1 })
      .populate("customer")
      // .populate("product")
      .then((result) => {
        const formattedResult = result.map((product_review) => {
          const formattedCreatedAt = moment(product_review.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(product_review.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          return {
            ...product_review.toObject(),
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

// GET BY ID PRODUCT REVIEW
export const getByIdProductReview = (req, res, next) => {
  try {
    const { id } = req.params;
    ProductReview.findById(id)
      .populate("customer")
      .populate("product")
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
export const postProductReview = async (req, res, next) => {
  try {
    const data = req.body;
    const newItem = new ProductReview(data);
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
export const updateProductReview = (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    ProductReview.findByIdAndUpdate(id, data, {
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
export const deleteProductReview = (req, res, next) => {
  try {
    const { id } = req.params;
    ProductReview.findByIdAndDelete(id).then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
};

export const deleteAllProductReview = (req, res, next) => {
  try {
    ProductReview.deleteMany().then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
};
