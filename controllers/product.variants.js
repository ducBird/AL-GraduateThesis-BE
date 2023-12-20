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
  const newVariantIds = []; // Mảng để lưu _id của biến thể mới
  const existingVariantIds = []; // Mảng để lưu _id của biến thể cũ
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
        existingVariantIds.push(existingVariant._id); // Lưu _id của biến thể cũ
      } else {
        // Biến thể không tồn tại trong cơ sở dữ liệu, thêm mới
        const newVariant = new ProductVariant(generatedVariant);
        await newVariant.save();
        newVariantIds.push(newVariant._id); // Lưu _id của biến thể mới
      }
    }
    // Lấy danh sách variantIds hiện tại từ collection product
    const currentProduct = await Product.findOne({ _id: product_id });
    const currentVariantIds = currentProduct.variants;

    // Lưu lại các _id của biến thể cũ không bị xóa
    const retainedVariantIds = existingVariantIds.filter((id) =>
      currentVariantIds.includes(id.toString())
    );

    // Xóa các biến thể không nằm trong danh sách generatedVariants
    const variantsToDelete = await ProductVariant.find({
      product_id: product_id,
      title: { $nin: generatedVariants.map((v) => v.title) },
    });

    for (const variantToDelete of variantsToDelete) {
      await variantToDelete.deleteOne(); // hoặc sử dụng remove() nếu muốn
    }

    // Loại bỏ các variantIds không tồn tại trong danh sách generatedVariants
    const updatedVariantIds = currentVariantIds.filter((id) =>
      generatedVariants.some(
        (v) =>
          (v._id && v._id.toString() === id.toString()) ||
          (!v._id && v.title === id)
      )
    );

    // Thêm các _id của biến thể mới vào danh sách cần cập nhật
    updatedVariantIds.push(...newVariantIds);

    // Thêm lại các _id của biến thể cũ không bị xóa vào danh sách cần cập nhật
    updatedVariantIds.push(...retainedVariantIds);

    // Cập nhật lại mảng variantIds trong collection product
    await Product.updateOne(
      { _id: product_id },
      { $set: { variants: updatedVariantIds } }
    );

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
