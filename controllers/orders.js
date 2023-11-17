import { query } from "express";
import { findDocuments } from "../helpers/MongoDbHelper.js";
import Order from "../models/Order.js";
import moment from "moment";

//Get
export const getOrder = async (req, res, next) => {
  try {
    Order.find()
      .sort({ createdAt: -1 })
      .populate("order_details.product")
      .populate("order_details.variants")
      .populate("customer")
      .populate("employee")
      .then((result) => {
        const formattedResult = result.map((order) => {
          const formattedCreatedAt = moment(order.createdAt).format(
            "DD/MM/YYYY-HH:mm:ss"
          );
          const formattedUpdatedAt = moment(order.updatedAt).format(
            "DD/MM/YYYY-HH:mm:ss"
          );
          const formattedShippedDate = moment(order.shipped_date).format(
            "DD/MM/YYYY-HH:mm:ss"
          );
          return {
            ...order.toObject(),
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
            shipped_date: formattedShippedDate,
          };
        });
        res.status(200).send(formattedResult);
      });
  } catch (error) {
    res.sendStatus(500);
  }
};

//Get id
export const getOrderId = (req, res, next) => {
  try {
    const orderId = req.params.id;
    Order.findById(orderId)
      .populate("order_details.product")
      .populate("order_details.variants")
      .populate("customer")
      .then((result) => {
        const formattedResult = result.map((order) => {
          const formattedCreatedAt = moment(order.createdAt).format(
            "DD/MM/YYYY-HH:mm:ss"
          );
          const formattedUpdatedAt = moment(order.updatedAt).format(
            "DD/MM/YYYY-HH:mm:ss"
          );
          const formattedShippedDate = moment(order.shipped_date).format(
            "DD/MM/YYYY-HH:mm:ss"
          );
          return {
            ...order.toObject(),
            createdAt: formattedCreatedAt,
            updatedAt: formattedUpdatedAt,
            shipped_date: formattedShippedDate,
          };
        });
        res.status(200).send(formattedResult);
      });
  } catch (error) {
    res.sendStatus(500);
  }
};

// POST
export const postOrder = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(data);
    const newItem = new Order(data);
    newItem.save().then((result) => {
      res.send(result);
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

//Patch Id
export const updateOrder = (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    console.log(data.order_details);
    Order.findByIdAndUpdate(id, data, {
      new: true,
    }).then((result) => {
      // xử lý cập nhật số lượng khi đặt hàng thành công
      if (data.status === "WAITING FOR PICKUP") {
      }
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
export const deleteOrder = (req, res, next) => {
  try {
    const { id } = req.params;
    Order.findByIdAndDelete(id).then((result) => {
      res.send(result);
      return;
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    return;
  }
};

// query theo hình thức thanh toán
export const orderByPaymentInformation = (req, res, next) => {
  try {
    let { payment_information, fromDate, toDate } = req.body;
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);

    const comparePaymentInformation = {
      $eq: ["$payment_information", payment_information],
    };
    const compareFromDate = {
      $and: [
        { $gte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: fromDate }] },
        { $gte: [{ $month: "$createdAt" }, { $month: fromDate }] },
        { $gte: [{ $year: "$createdAt" }, { $year: fromDate }] },
      ],
    };
    const compareToDate = {
      $and: [
        { $lte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: toDate }] },
        { $lte: [{ $month: "$createdAt" }, { $month: toDate }] },
        { $lte: [{ $year: "$createdAt" }, { $year: toDate }] },
      ],
    };

    Order.aggregate([
      {
        $match: {
          $expr: {
            $and: [comparePaymentInformation, compareFromDate, compareToDate],
          },
        },
      },
    ])
      .then((result) => {
        Order.populate(result, [
          { path: "customer" },
          {
            path: "order_details.product",
          },
        ])
          .then((data) => {
            res.send(data);
          })
          .catch((err) => {
            res.status(400).send({ message: err.message });
          });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

// query theo trạng thái đơn hàng trong ngày hôm nay
// export const orderStatus = (req, res, next) => {
//   let { status, today } = req.body;
//   today = new Date(today);
//   const compareToDay = {
//     $and: [
//       { $eq: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: today }] },
//       { $eq: [{ $month: "$createdAt" }, { $month: today }] },
//       { $eq: [{ $year: "$createdAt" }, { $year: today }] },
//     ],
//   };
//   let query = {
//     $expr: {
//       $and: [compareToDay, { $eq: ["$status", status] }],
//     },
//   };
//   // console.log(query);
//   Order.find(query)
//     .populate("order_details.product")
//     .populate("customer")
//     .then((results) => {
//       res.json({ ok: true, results });
//     })
//     .catch((errors) => {
//       console.log(errors);
//       res.status(500).json(errors);
//     });
// };

// query theo trạng thái thanh toán
export const orderByPaymentStatus = (req, res, next) => {
  try {
    let { payment_status, fromDate, toDate } = req.body;
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);
    const parsedPaymentStatus = payment_status === "true";
    const comparePaymentStatus = {
      $eq: ["$payment_status", parsedPaymentStatus],
    };
    const compareFromDate = {
      $and: [
        { $gte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: fromDate }] },
        { $gte: [{ $month: "$createdAt" }, { $month: fromDate }] },
        { $gte: [{ $year: "$createdAt" }, { $year: fromDate }] },
      ],
    };
    const compareToDate = {
      $and: [
        { $lte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: toDate }] },
        { $lte: [{ $month: "$createdAt" }, { $month: toDate }] },
        { $lte: [{ $year: "$createdAt" }, { $year: toDate }] },
      ],
    };

    Order.aggregate([
      {
        $match: {
          $expr: {
            $and: [comparePaymentStatus, compareFromDate, compareToDate],
          },
        },
      },
    ])
      .then((result) => {
        Order.populate(result, [
          { path: "customer" },
          {
            path: "order_details.product",
          },
        ])
          .then((data) => {
            res.send(data);
          })
          .catch((err) => {
            res.status(400).send({ message: err.message });
          });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

// truy vấn một điều kiện
export const queryOne = (req, res, next) => {
  let { status, payment_information, payment_status } = req.body;
  let query = {};
  if (status) {
    query = { status: status };
  } else if (payment_information) {
    query = { payment_information: payment_information };
  } else if (payment_status) {
    if (payment_status === "true") {
      payment_status = true;
      query = { payment_status: payment_status };
    } else if (payment_status === "false") {
      payment_status = false;
      query = { payment_status: payment_status };
    }
  }
  console.log("body", req.body);
  console.log(query);
  try {
    Order.find(query)
      .populate("order_details.product")
      .populate("customer")
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
};

// truy vấn nhiều điều kiện
// export const combinedQuery = (req, res, next) => {
//   let { status, payment_information, payment_status, fromDate, toDate } =
//     req.body;
//   const tmpFromDate = new Date(fromDate);
//   fromDate = new Date(tmpFromDate.setDate(tmpFromDate.getDate() + 1));

//   const tmpToDate = new Date(toDate);

//   toDate = new Date(tmpToDate.setDate(tmpToDate.getDate() + 1));
//   const compareFromDate = {
//     $and: [
//       { $gte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: fromDate }] },
//       { $gte: [{ $month: "$createdAt" }, { $month: fromDate }] },
//       { $gte: [{ $year: "$createdAt" }, { $year: fromDate }] },
//     ],
//   };
//   const compareToDate = {
//     $and: [
//       { $lte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: toDate }] },
//       { $lte: [{ $month: "$createdAt" }, { $month: toDate }] },
//       { $lte: [{ $year: "$createdAt" }, { $year: toDate }] },
//     ],
//   };
//   let query = {};
//   // có 5 body status, payment_information, payment_status, fromFate, toDate
//   if (status && payment_information && payment_status && fromFate && toDate) {
//     if (payment_status === "true") {
//       payment_status = true;
//     } else if (payment_status === "false") {
//       payment_status = false;
//     }
//     query = {
//       $match: {
//         $expr: {
//           $and: [
//             { payment_information: payment_information },
//             { payment_status: payment_status },
//             { status: status },
//             compareFromDate,
//             compareToDate,
//           ],
//         },
//       },
//     };
//   }
//   // có 4 body status, payment information, from date, to date
//   else if (status && payment_information && fromDate && toDate) {
//     query = {
//       $match: {
//         $expr: {
//           $and: [
//             { payment_information: payment_information },
//             { status: status },
//             compareFromDate,
//             compareToDate,
//           ],
//         },
//       },
//     };
//   }
//   // có 4 body status, payment_status, from_date, to_date
//   else if (status && payment_status && fromDate && toDate) {
//     if (payment_status === "true") {
//       payment_status = true;
//     } else if (payment_status === "false") {
//       payment_status = false;
//     }
//     query = {
//       $match: {
//         $expr: {
//           $and: [
//             { status: status },
//             { payment_status: payment_status },
//             compareFromDate,
//             compareToDate,
//           ],
//         },
//       },
//     };
//   }
//   // có 4 body payment_information, payment_status, from_date, to_date
//   else if (payment_information && payment_status && fromDate && toDate) {
//     if (payment_status === "true") {
//       payment_status = true;
//     } else if (payment_status === "false") {
//       payment_status = false;
//     }
//     query = {
//       $match: {
//         $expr: {
//           $and: [
//             { payment_information: payment_information },
//             { payment_status: payment_status },
//             compareFromDate,
//             compareToDate,
//           ],
//         },
//       },
//     };
//   }
//   // có 3 body status, from date, to date
//   else if ((status && fromDate, toDate)) {
//     query = {
//       $match: {
//         $expr: {
//           $and: [{ status: status }, compareFromDate, compareToDate],
//         },
//       },
//     };
//   }
//   // có 3 body payment_information, from date, to date
//   else if (payment_information && fromDate && toDate) {
//     query = {
//       $match: {
//         $expr: {
//           $and: [
//             { payment_information: payment_information },
//             compareFromDate,
//             compareToDate,
//           ],
//         },
//       },
//     };
//   }
//   // có 3 body payment_status, from date, to date
//   else if (payment_status && fromDate && toDate) {
//     if (payment_status === "true") {
//       payment_status = true;
//     } else if (payment_status === "false") {
//       payment_status = false;
//     }
//     query = {
//       $match: {
//         $expr: {
//           $and: [
//             { payment_status: payment_status },
//             compareFromDate,
//             compareToDate,
//           ],
//         },
//       },
//     };
//   }

//   // if (status && payment_information && payment_status) {
//   //   if (payment_status === "true") {
//   //     payment_status = true;
//   //   } else if (payment_status === "false") {
//   //     payment_status = false;
//   //   }
//   //   query = {
//   //     $and: [
//   //       { status: status },
//   //       { payment_information: payment_information },
//   //       { payment_status: payment_status },
//   //     ],
//   //   };
//   // } else if (status && payment_information) {
//   //   query = {
//   //     $and: [{ status: status }, { payment_information: payment_information }],
//   //   };
//   // } else if (payment_information && payment_status) {
//   //   if (payment_status === "true") {
//   //     payment_status = true;
//   //   } else if (payment_status === "false") {
//   //     payment_status = false;
//   //   }
//   //   query = {
//   //     $and: [
//   //       { payment_status: payment_status },
//   //       { payment_information: payment_information },
//   //     ],
//   //   };
//   // } else if (payment_status && status) {
//   //   if (payment_status === "true") {
//   //     payment_status = true;
//   //   } else if (payment_status === "false") {
//   //     payment_status = false;
//   //   }
//   //   query = {
//   //     $and: [{ status: status }, { payment_status: payment_status }],
//   //   };
//   // }

//   // console.log("tmpFromDate", tmpFromDate);
//   // console.log(fromDate);

//   // console.log("tmpToDate", tmpToDate);
//   // console.log(toDate);
//   console.log("body", req.body);
//   console.log(query);
//   try {
//     Order.find(query)
//       .populate("order_details.product")
//       .populate("customer")
//       .then((result) => {
//         res.send(result);
//       })
//       .catch((err) => {
//         res.status(400).send({ message: err.message });
//       });
//   } catch (err) {
//     res.sendStatus(500);
//   }
// };
// export const combinedQuery = (req, res, next) => {
//   const { status, payment_information, payment_status, fromDate, toDate } =
//     req.body;
//   const query = {
//     $and: [],
//   };

//   if (status) {
//     query.$and.push({ status: status });
//   }
//   if (payment_information) {
//     query.$and.push({ payment_information: payment_information });
//   }
//   if (payment_status) {
//     const parsedPaymentStatus = payment_status === "true";
//     query.$and.push({ payment_status: parsedPaymentStatus });
//   }

//   if (fromDate && toDate) {
//     const tmpFromDate = new Date(fromDate);
//     const tmpToDate = new Date(toDate);
//     tmpFromDate.setDate(tmpFromDate.getDate() + 1);
//     tmpToDate.setDate(tmpToDate.getDate() + 1);

//     const dateConditions = {
//       $and: [
//         { $gte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: tmpFromDate }] },
//         { $gte: [{ $month: "$createdAt" }, { $month: tmpFromDate }] },
//         { $gte: [{ $year: "$createdAt" }, { $year: tmpFromDate }] },
//         { $lte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: tmpToDate }] },
//         { $lte: [{ $month: "$createdAt" }, { $month: tmpToDate }] },
//         { $lte: [{ $year: "$createdAt" }, { $year: tmpToDate }] },
//       ],
//     };

//     query.$and.push(dateConditions);
//   }

//   console.log("body", req.body);
//   console.log(query);

//   try {
//     Order.find(query)
//       .populate("order_details.product")
//       .populate("customer")
//       .then((result) => {
//         res.send(result);
//       })
//       .catch((err) => {
//         res.status(400).send({ message: err.message });
//       });
//   } catch (err) {
//     res.sendStatus(500);
//   }
// };
export const orderByStatus = (req, res, next) => {
  try {
    let { status, fromDate, toDate } = req.body;
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);

    const compareStatus = { $eq: ["$status", status] };
    const compareFromDate = {
      $and: [
        { $gte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: fromDate }] },
        { $gte: [{ $month: "$createdAt" }, { $month: fromDate }] },
        { $gte: [{ $year: "$createdAt" }, { $year: fromDate }] },
      ],
    };
    const compareToDate = {
      $and: [
        { $lte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: toDate }] },
        { $lte: [{ $month: "$createdAt" }, { $month: toDate }] },
        { $lte: [{ $year: "$createdAt" }, { $year: toDate }] },
      ],
    };

    Order.aggregate([
      {
        $match: {
          $expr: { $and: [compareStatus, compareFromDate, compareToDate] },
        },
      },
    ])
      .then((result) => {
        Order.populate(result, [
          { path: "customer" },
          {
            path: "order_details.product",
          },
        ])
          .then((data) => {
            res.send(data);
          })
          .catch((err) => {
            res.status(400).send({ message: err.message });
          });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
// hiển thị đơn hàng có trạng thái đơn hàng từ ngày đến ngày
export const queryOrderStatusFromdaytoday = (req, res, next) => {
  try {
    let { status, fromDate, toDate } = req.body;
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);

    const compareStatus = { $eq: ["$status", status] };
    const compareFromDate = {
      $and: [
        { $gte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: fromDate }] },
        { $gte: [{ $month: "$createdAt" }, { $month: fromDate }] },
        { $gte: [{ $year: "$createdAt" }, { $year: fromDate }] },
      ],
    };
    const compareToDate = {
      $and: [
        { $lte: [{ $dayOfMonth: "$createdAt" }, { $dayOfMonth: toDate }] },
        { $lte: [{ $month: "$createdAt" }, { $month: toDate }] },
        { $lte: [{ $year: "$createdAt" }, { $year: toDate }] },
      ],
    };

    Order.aggregate([
      {
        $match: {
          $expr: { $and: [compareStatus, compareFromDate, compareToDate] },
        },
      },
    ])
      .project({
        _id: 1,
        status: 1,
        createdAt: 1,
      })
      .then((result) => {
        Order.populate(result, [])
          .then((data) => {
            res.send(data);
          })
          .catch((err) => {
            res.status(400).send({ message: err.message });
          });
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
