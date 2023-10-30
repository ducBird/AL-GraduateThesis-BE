import config from "config";
import dateFormat from "dateformat";
import querystring from "qs";
import crypto from "crypto";
export const PaymentVNPay = (req, res, next) => {
  // console.log("aaaaaaaaa");
  res.set("Access-Control-Allow-Origin", "*");
  // res.redirect("https://google.com");
  var ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  var tmnCode = config.get("vnp_TmnCode");
  var secretKey = config.get("vnp_HashSecret");
  var vnpUrl = config.get("vnp_Url");
  var returnUrl = config.get("vnp_ReturnUrl");
  // console.log(vnpUrl);
  var date = new Date();

  var createDate = dateFormat(date, "yyyymmddHHMMss");
  var orderId = dateFormat(date, "HHMMss");
  var amount = req.body.amount;
  var bankCode = req.body.bankCode;
  var orderInfo = req.body.orderDescription;
  var orderType = req.body.orderType;
  var locale = req.body.language;
  if (locale === null || locale === "") {
    locale = "vn";
  }
  var currCode = "VND";
  var vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  // vnp_Params['vnp_Merchant'] = ''
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = orderInfo;
  vnp_Params["vnp_OrderType"] = orderType;
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }
  function sortObject(obj) {
    var sorted = {};
    var str = [];
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }

  vnp_Params = sortObject(vnp_Params);
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
  res.status(200).send(vnpUrl);
  // res.redirect("http://127.0.0.1:3000/shop");
};
