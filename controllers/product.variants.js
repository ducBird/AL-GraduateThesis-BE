import ProductVariant from "../models/ProductVariant.js";
import Product from "../models/Product.js";

// GETS
export const getProductVariants = (req, res, next) => {
  try {
    ProductVariant.find()
      // .populate("product")
      .then((result) => {
        res.status(200).send(result);
      });
  } catch (error) {
    res.sendStatus(500);
  }
};

// GET BY ID PRODUCT
export const getVariantsByProductId = (req, res, next) => {
  const { product_id } = req.params;
  if (product_id === "search") {
    next();
    return;
  }
  try {
    ProductVariant.find({ product_id: product_id })
      // .populate("product")
      .then((result) => {
        res.status(200).send(result);
      });
  } catch (error) {
    console.log("error", error);
    res.sendStatus(500);
  }
};

// GET BY ID VARIANT PRODUCT
export const getByIdProductVariant = function (req, res, next) {
  try {
    const id = req.params.id;
    ProductVariant.findById(id)
      // .populate("product")
      .then((result) => {
        // console.log(result);
        res.send(result);
        return;
      });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
    return;
  }
};

export const getVariant = function (req, res, next) {
  try {
    const id = req.params.id;
    ProductVariant.findById(id).then((result) => {
      console.log("result", result);
      res.send(result);
      return;
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
    return;
  }
};

// GET BY QUERY STRING
export const search = (req, res, next) => {
  const { id, firstName, lastName } = req.query;
  console.log(`id: ${id}`);
  res.send("OK query string");
};

// POST
export const postProductVariant = async (req, res, next) => {
  try {
    const data = req.body;
    const newItem = new ProductVariant(data);
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
export const updateVariant = (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    ProductVariant.findByIdAndUpdate(id, data, {
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

// PUT MANY VARIANT
export const updateProductVariant = async (req, res) => {
  const generatedVariants = req.body.generatedVariants;
  const product_id = req.body.product_id;
  try {
    for (const generatedVariant of generatedVariants) {
      const existingVariant = await ProductVariant.findOne({
        title: generatedVariant.title,
        product_id: generatedVariant.product_id,
      });

      if (existingVariant) {
        // Biến thể đã tồn tại trong cơ sở dữ liệu, cập nhật giá nếu cần
        if (generatedVariant) {
          // existingVariant.price = generatedVariant.price;
          await existingVariant.save();
        }
      } else {
        // Biến thể không tồn tại trong cơ sở dữ liệu, thêm mới
        const newVariant = new ProductVariant(generatedVariant);
        await newVariant.save();
      }
    }

    res.status(200).json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cập nhật thất bại" });
  }
};

// DELETE BY ID
export const deleteProductVariant = (req, res, next) => {
  try {
    const { id } = req.params;
    ProductVariant.findByIdAndDelete(id).then((result) => {
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
export const deleteAllVariant = (req, res, next) => {
  try {
    ProductVariant.deleteMany().then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
};
