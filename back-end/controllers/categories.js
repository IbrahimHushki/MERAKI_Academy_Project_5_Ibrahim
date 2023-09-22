const pool = require("../models/DB");
const { throwError } = require("../middlewares/throwError");

exports.addCategory = (req, res, next) => {
  let { name, image } = req.body;

  const values = [name, image];

  pool
    .query(`INSERT INTO categories (name, image) VALUES ($1, $2)`, values)
    .then((result) => {
      if (result.command === "INSERT") {
        return res.status(200).json({
          error: false,
          message: "Category Added succefully",
        });
      }
      return throwError(400, "Something went wrong");
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateCategory = (req, res, next) => {
  let { name, image } = req.body;
  const { id } = req.params;
  const values = [name, image, id];

  pool
    .query(`UPDATE categories SET name = $1, image = $2 WHERE id = $3`, values)
    .then((result) => {
      if (result.command === "UPDATE") {
        return res.status(200).json({
          error: false,
          message: "Category Updated succefully",
        });
      }
      return throwError(400, "Something went wrong");
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getAllCategories = (req, res, next) => {
  pool
    .query(`SELECT * FROM categories`)
    .then((result) => {
      if (result.command === `SELECT`) {
        return res.status(200).json({
          error: false,
          categories: result.rows,
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getCateogoryById = (req, res, next) => {
  pool
    .query(`SELECT * FROM categories WHERE id = $1`, [req.params.id])
    .then((result) => {
      if (result.command === `SELECT`) {
        return res.status(200).json({
          error: false,
          category: result.rows[0],
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};