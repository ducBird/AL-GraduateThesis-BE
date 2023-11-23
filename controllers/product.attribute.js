import ProductAttribute from "../models/ProductAttribute.js";
import Product from "../models/Product.js";

// GETS
export const getProductAttributes = (req, res, next) => {
  try {
    ProductAttribute.find()
      // .populate("product")
      .then((result) => {
        res.status(200).send(result);
      });
  } catch (error) {
    res.sendStatus(500);
  }
};

// GET BY ID PRODUCT
export const getAttributesByProductId = (req, res, next) => {
  const { product_id } = req.params;
  if (product_id === "search") {
    next();
    return;
  }
  try {
    ProductAttribute.find({ product_id: product_id })
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
export const getByIdProductAttribute = function (req, res, next) {
  try {
    const id = req.params.id;
    ProductAttribute.findById(id)
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

export const getAttribute = function (req, res, next) {
  try {
    const id = req.params.id;
    ProductAttribute.findById(id).then((result) => {
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
export const postProductAttribute = async (req, res, next) => {
  try {
    const data = req.body;
    const newItem = new ProductAttribute(data);
    newItem.save().then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

export const updateProductAttribute = async (req, res) => {
  try {
    const items = req.body.values.attributes; // Mảng các bản ghi từ client
    // console.log("items", items);
    // Lấy danh sách các _id trong mảng items (attributes) được gửi từ client
    const itemIds = items.map((item) => item._id);
    // console.log("itemIds", itemIds);
    // Lấy danh sách các _id attribute trong database dựa trên product_id
    const existingItemIds = await Product.find({
      _id: { $in: req.body.product_id },
    }).then((result) => {
      return result[0].attributes;
    });
    // console.log("existingItemIds", existingItemIds);
    // Lấy danh sách các _id không tồn tại trong mảng items mà client gửi về
    const nonExistingItemIds = existingItemIds
      .map((item) => item._id.toString())
      .filter((id) => !itemIds.includes(id));
    // console.log("nonExistingItemIds", nonExistingItemIds);
    // Lấy danh sách các _id tồn tại trong mảng items trừ _id không tồn tại ở trong mảng items
    const itemIdAttributesInProduct = existingItemIds
      .map((item) => item._id.toString())
      .filter((id) => itemIds.includes(id));
    // console.log("itemIdAttributesInProduct", itemIdAttributesInProduct);
    // Lấy danh sách các bản ghi mới
    const newItems = items.filter((item) => {
      if (!item._id) return item;
    });
    // console.log("newItems", newItems);
    // Xóa hết nếu items mà client gửi về là một mảng rỗng
    if (items.length === 0) {
      nonExistingItemIds.forEach(async (id) => {
        await ProductAttribute.deleteOne({ _id: id });
        await Product.updateOne(
          { _id: req.body.product_id },
          { attributes: itemIdAttributesInProduct }
        );
      });
    } else {
      // Cập nhật các bản ghi có _id nằm trong mảng items
      // const updatePromises =
      items.map(async (item) => {
        const updateData = { ...item };
        // console.log("updateData", updateData);
        delete updateData._id; // Xóa trường _id để tránh ghi đè trong quá trình cập nhật
        await ProductAttribute.updateOne(
          { _id: item._id },
          { $set: updateData }
        );
      });

      // Xóa các bản ghi có _id không tồn tại trong mảng items
      // const deletePromises =
      nonExistingItemIds.map(async (id) => {
        // xóa attributes không tồn tại ở value mà client gửi về
        await ProductAttribute.deleteOne({ _id: id });
        // cập nhập lại mảng attributes trong ở record product
        await Product.updateOne(
          { _id: req.body.product_id },
          { attributes: itemIdAttributesInProduct }
        );
      });

      // Thêm các bản ghi mới có _id không nằm trong danh sách các _id hiện có trong items
      if (newItems.length > 0) {
        // const insertPromises =
        newItems.map(async (newItem) => {
          Object.assign(newItem, { product_id: req.body.product_id });
          const newAttribute = new ProductAttribute(newItem);
          await newAttribute.save();
          // console.log("newAttribute", newAttribute);
          itemIdAttributesInProduct.push(newAttribute._id);
          await Product.updateOne(
            { _id: req.body.product_id },
            { attributes: itemIdAttributesInProduct }
          );
        });
      }
      // Chạy các promises để cập nhật và xóa bản ghi
      // await Promise.all([
      //   ...updatePromises,
      //   ...deletePromises,
      //   ...insertPromises,
      // ]);
    }
    const result = await ProductAttribute.find({
      product_id: req.body.product_id,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật nhiều bản ghi" });
  }
};

// DELETE BY ID
export const deleteProductAttribute = (req, res, next) => {
  try {
    const { id } = req.params;
    ProductAttribute.findByIdAndDelete(id).then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
};
export const deleteAllAttribute = (req, res, next) => {
  try {
    ProductAttribute.deleteMany().then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
};
