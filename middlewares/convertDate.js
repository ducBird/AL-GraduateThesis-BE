import moment from "moment";

export const convertDateMiddleware = (req, res, next) => {
  const { body } = req;
  const { birth_day, date_of_manufacture, expiration_date } = body;

  if (birth_day) {
    const formattedDate = moment(
      birth_day,
      "YYYY/MM/DD HH:mm:ss"
    ).toISOString();
    req.body.birth_day = formattedDate;
  }

  if (date_of_manufacture) {
    const formattedDate = moment(
      date_of_manufacture,
      "YYYY/MM/DD HH:mm:ss"
    ).toISOString();
    req.body.date_of_manufacture = formattedDate;
  }

  if (expiration_date) {
    const formattedDate = moment(
      expiration_date,
      "YYYY/MM/DD HH:mm:ss"
    ).toISOString();
    req.body.expiration_date = formattedDate;
  }
  next();
};
