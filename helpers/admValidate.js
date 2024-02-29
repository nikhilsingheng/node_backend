const Joi = require("joi");
const multer = require("multer");
const path = require("path");
const admModel = require("../model/adm");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");
// const dateFormat = require("dateformat");
const Config = require("../db/Config");
const common = require("../controllers/common");
const { encode, decode } = require("html-entities");
var moment = require("moment");
const uuid = require("uuid");

var storage_product = multer.diskStorage({
  destination: function (req, file, callback) {
    const destinationPath = path.join(__dirname, "../uploads/image");
    console.log("Destination Path:", destinationPath);
    callback(null, destinationPath);
  },
  filename: function (req, file, callback) {
    const extention = path.extname(file.originalname);
    const product_new_name = new Date().getTime() + "-" + uuid.v4() + extention;
    console.log("Generated Filename:", product_new_name);
    callback(null, product_new_name);
  },
});

var validatingImage = (schema) => {
  return (req, res, next) => {
    const result = Joi.validate(req.body, schema, {
      abortEarly: false,
    });
    if (result.error) {
      let err_msg = {};
      for (let counter in result.error.details) {
        let k = result.error.details[counter].context.key;
        let val = result.error.details[counter].message;
        err_msg[k] = val;
      }
      let return_err = { status: 2, errors: err_msg };
      return res.status(400).json(return_err);
    }

    if (!req.value) {
      req.value = {};
    }
    req.value["body"] = result.value;
    return true;
  };
};
module.exports = {
  validateBody: (schema) => {
    return (req, res, next) => {
      const result = schema.validate(req.body, { abortEarly: false });
      if (result.error) {
        let err_msg = {};
        for (let counter in result.error.details) {
          let k = result.error.details[counter].context.key;
          let val = result.error.details[counter].message;
          err_msg[k] = val;
        }
        let return_err = { status: 2, errors: err_msg };
        return res.status(400).json(return_err);
      }

      if (!req.value) {
        req.value = {};
      }
      req.value["body"] = result.value;
      next();
    };
  },

  validateParam: (schema) => {
    return (req, res, next) => {
      const result = schema.validate(req.params);
      if (result.error) {
        let return_err = { status: 2, errors: "Invalid argument" };
        return res.status(400).json(return_err);
      }

      if (!req.value) {
        req.value = {};
      }
      req.value["params"] = result.value;
      next();
    };
  },
  schemas: {
    product: Joi.object().keys({
      title: Joi.string().required(),
      image: Joi.array().optional(),
      description: Joi.string().required(),
    }),
  },

  schema_posts: {
    product_image: async (req, res, next) => {
      try {
        var upload = multer({
          storage: Config.environment == "local" ? storage_product : "s3",
          limits: {
            fileSize: 8242880,
          },
          fileFilter: (req, file, cb) => {
            var ext = path.extname(file.originalname).toLowerCase();
            if (
              ext == ".png" ||
              ext == ".jpg" ||
              ext == ".jpeg" ||
              ext == ".webp"
            ) {
              var validateImage = validatingImage(
                module.exports.schemas.product
              );

              if (validateImage) {
                cb(null, true);
              }
            } else {
              cb(null, false);
              return cb("Only images allowed!", null);
            }
          },
        }).single("image");
        upload(req, res, async function (err) {
          if (err) {
            let data = {};
            data.file = err;
            res
              .status(400)
              .json({
                status: 2,
                errors: data,
              })
              .end();
          } else {
            next();
          }
        });
      } catch (err) {
        console.log("====>", err);
        res.status(400).json({
          status: 3,
          message: "server error",
        });
      }
    },
  },
};
