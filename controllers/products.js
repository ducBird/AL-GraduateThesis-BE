import Product from "../models/Product.js";
import moment from "moment";
import ProductReview from "../models/ProductReview.js";

// GETS

export const getProducts = async (req, res, next) => {
  const query = {};

  try {
    if (req.query.sub_category_id || req.query.category_id) {
      query[req.query.sub_category_id ? "sub_category_id" : "category_id"] = req
        .query.sub_category_id
        ? req.query.sub_category_id
        : req.query.category_id;
    }
    const minPrice = req.query.min_price
      ? parseInt(req.query.min_price)
      : undefined;
    const maxPrice = req.query.max_price
      ? parseInt(req.query.max_price)
      : undefined;
    if (minPrice !== undefined && maxPrice !== undefined) {
      const products = await Product.find(query)
        .sort({ name: 1 })
        .populate("category")
        .populate("sub_category")
        .populate("attributes")
        .populate("variants")
        .populate("reviews");

      const filteredProducts = products.filter((product) => {
        const variantPrices = product.variants.map((variant) => variant.price);
        const minVariantPrice = Math.min(...variantPrices);
        const productPrice =
          product.variants.length > 0 ? minVariantPrice : product.price;
        return productPrice >= minPrice && productPrice <= maxPrice;
      });

      const formattedResult = await Promise.all(
        filteredProducts.map(async (product) => {
          const formattedCreatedAt = moment(product.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(product.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );

          const productReviews = await ProductReview.find({});
          const reviews = productReviews
            .filter((review) =>
              review.reviews.some(
                (r) => r.product_id.toString() === product._id.toString()
              )
            )
            .map((review) => ({
              rating: review.reviews.find(
                (r) => r.product_id.toString() === product._id.toString()
              ).rating,
              comment: review.reviews.find(
                (r) => r.product_id.toString() === product._id.toString()
              ).comment,
              date: review.reviews.find(
                (r) => r.product_id.toString() === product._id.toString()
              ).date,
            }));

          const formattedProduct = {
            ...product.toObject(),
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
            reviews: reviews,
          };

          return formattedProduct;
        })
      );

      res.status(200).send(formattedResult);
    } else {
      const products = await Product.find(query)
        .sort({ name: 1 })
        .populate("category")
        .populate("sub_category")
        .populate("attributes")
        .populate("variants")
        .populate("reviews");

      const formattedResult = await Promise.all(
        products.map(async (product) => {
          const formattedCreatedAt = moment(product.createdAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );
          const formattedUpdatedAt = moment(product.updatedAt).format(
            "YYYY/MM/DD HH:mm:ss"
          );

          // Lấy đánh giá từ mô hình "product_reviews" cho sản phẩm hiện tại
          const productReviews = await ProductReview.find({});

          const reviews = productReviews
            .filter((review) =>
              review.reviews.some(
                (r) => r.product_id.toString() === product._id.toString()
              )
            )
            .map((review) => ({
              rating: review.reviews.find(
                (r) => r.product_id.toString() === product._id.toString()
              ).rating,
              comment: review.reviews.find(
                (r) => r.product_id.toString() === product._id.toString()
              ).comment,
              date: review.reviews.find(
                (r) => r.product_id.toString() === product._id.toString()
              ).date,
            }));

          // Tạo một đối tượng mới chứa thông tin về sản phẩm và đánh giá
          const formattedProduct = {
            ...product.toObject(),
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
            reviews: reviews,
          };

          return formattedProduct;
        })
      );

      res.status(200).send(formattedResult);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const getProductsByIdCategory = async (req, res, next) => {
  const { category_id } = req.params;
  if (category_id === "search") {
    next();
    return;
  }
  try {
    const products = await Product.find({ category_id })
      .populate("category")
      .populate("variants");
    const formattedResult = await Promise.all(
      products.map(async (product) => {
        const formattedCreatedAt = moment(product.createdAt).format(
          "YYYY/MM/DD HH:mm:ss"
        );
        const formattedUpdatedAt = moment(product.updatedAt).format(
          "YYYY/MM/DD HH:mm:ss"
        );

        // Lấy đánh giá từ mô hình "product_reviews" cho sản phẩm hiện tại
        const productReviews = await ProductReview.find({});

        const reviews = productReviews
          .filter((review) =>
            review.reviews.some(
              (r) => r.product_id.toString() === product._id.toString()
            )
          )
          .map((review) => ({
            rating: review.reviews.find(
              (r) => r.product_id.toString() === product._id.toString()
            ).rating,
            comment: review.reviews.find(
              (r) => r.product_id.toString() === product._id.toString()
            ).comment,
            date: review.reviews.find(
              (r) => r.product_id.toString() === product._id.toString()
            ).date,
          }));

        // Tạo một đối tượng mới chứa thông tin về sản phẩm và đánh giá
        const formattedProduct = {
          ...product.toObject(),
          createdAt: formattedCreatedAt,
          updatedAt: formattedUpdatedAt,
          reviews: reviews,
        };

        return formattedProduct;
      })
    );
    res.status(200).send(formattedResult);
  } catch (error) {
    console.log("error", error);
    res.sendStatus(500);
  }
};

export const getProductsByIdSubCategory = async (req, res, next) => {
  const { sub_category_id } = req.params;
  if (sub_category_id === "search" || sub_category_id === "product") {
    next();
    return;
  }
  try {
    const products = await Product.find({ sub_category_id })
      .populate("sub_category")
      .populate("variants");
    const formattedResult = await Promise.all(
      products.map(async (product) => {
        const formattedCreatedAt = moment(product.createdAt).format(
          "YYYY/MM/DD HH:mm:ss"
        );
        const formattedUpdatedAt = moment(product.updatedAt).format(
          "YYYY/MM/DD HH:mm:ss"
        );

        // Lấy đánh giá từ mô hình "product_reviews" cho sản phẩm hiện tại
        const productReviews = await ProductReview.find({});

        const reviews = productReviews
          .filter((review) =>
            review.reviews.some(
              (r) => r.product_id.toString() === product._id.toString()
            )
          )
          .map((review) => ({
            rating: review.reviews.find(
              (r) => r.product_id.toString() === product._id.toString()
            ).rating,
            comment: review.reviews.find(
              (r) => r.product_id.toString() === product._id.toString()
            ).comment,
            date: review.reviews.find(
              (r) => r.product_id.toString() === product._id.toString()
            ).date,
          }));

        // Tạo một đối tượng mới chứa thông tin về sản phẩm và đánh giá
        const formattedProduct = {
          ...product.toObject(),
          createdAt: formattedCreatedAt,
          updatedAt: formattedUpdatedAt,
          reviews: reviews,
        };

        return formattedProduct;
      })
    );
    res.status(200).send(formattedResult);
  } catch (error) {
    console.log("error", error);
    res.sendStatus(500);
  }
};

// GET BY ID PRODUCT
export const getByIdProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      // .populate("category")
      .populate("variants")
      .populate("attributes");
    const formattedCreatedAt = moment(product.createdAt).format(
      "YYYY/MM/DD HH:mm:ss"
    );
    const formattedUpdatedAt = moment(product.updatedAt).format(
      "YYYY/MM/DD HH:mm:ss"
    );

    // Lấy đánh giá từ mô hình "product_reviews" cho sản phẩm hiện tại
    const productReviews = await ProductReview.find({});
    const reviews = productReviews
      .filter((review) =>
        review.reviews.some(
          (r) => r.product_id.toString() === product._id.toString()
        )
      )
      .map((review) => ({
        rating: review.reviews.find(
          (r) => r.product_id.toString() === product._id.toString()
        ).rating,
        comment: review.reviews.find(
          (r) => r.product_id.toString() === product._id.toString()
        ).comment,
        date: review.reviews.find(
          (r) => r.product_id.toString() === product._id.toString()
        ).date,
      }));

    // Tạo một đối tượng mới chứa thông tin về sản phẩm và đánh giá
    const formattedProduct = {
      ...product.toObject(),
      createdAt: formattedCreatedAt,
      updatedAt: formattedUpdatedAt,
      reviews: reviews,
    };

    res.status(200).send(formattedProduct);
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

// DELETE ALL
export const deleteAllProduct = (req, res, next) => {
  try {
    Product.deleteMany().then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
};

// tìm kiếm sản phẩm
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
