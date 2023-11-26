import express from "express";
import { EventEmitter } from "events";
const router = express.Router();
const customerEventEmitter = new EventEmitter();

export const getSSE = (req, res, next) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { customer_id } = req.params;
  console.log("customer_id", customer_id);

  const eventHandler = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  customerEventEmitter.on(`orderUpdate:${customer_id}`, eventHandler);

  // Close the connection when the browser is closed
  req.on("close", () => {
    customerEventEmitter.off(`orderUpdate:${customer_id}`, eventHandler);
  });
};

export const sendOrderUpdateToCustomer = (customerId, data) => {
  customerEventEmitter.emit(`orderUpdate:${customerId}`, data);
};

export default router;
