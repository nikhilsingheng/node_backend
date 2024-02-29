const Config = require("../db/Config");
const admModel = require("../model/adm");
const globalAdminLimit = 8;
const slugify = require("slugify");
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const hours = String(now.getHours()).padStart(2, "0");
const minutes = String(now.getMinutes()).padStart(2, "0");
const seconds = String(now.getSeconds()).padStart(2, "0");
const common = require("./common");

module.exports = {
  create_product: async (req, res, next) => {
    try {
      const { title, description } = req.body;
      const created_at = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      updated_at = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      console.log("title", title, description);
      const slug = slugify(title, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
      });
      const product = await admModel.createProduct(
        !!req.file ? req.file.originalname : null,
        Config.environment == "local" ? req.file.filename : req.file.key,
        title,
        description,
        slug,
        created_at,
        1
      );
      res
        .status(200)
        .json({
          status: 1,
          data: product,
          message: "add product successfully",
        })
        .end();
    } catch (err) {
      common.logError(err);
      res
        .status(400)
        .json({
          status: 3,
          message: Config.errorText.value,
        })
        .end();
    }
  },
  get_product: async (req, res, next) => {
    try {
      if (req.query.page && req.query.page > 0) {
        var page = req.query.page;
        var limit = globalAdminLimit;
        var offset = (page - 1) * globalAdminLimit;
      } else {
        var limit = globalAdminLimit;
        var offset = 0;
      }
      var search_text = "";
      var status = "";
      if (!!req.query.search_text) {
        search_text = req.query.search_text;
      }
      if (!!req.query.status) {
        status = req.query.status;
      }

      await admModel
        .get_productfeed_list(search_text.toLowerCase(), status, limit, offset)
        .then(async function (data) {
          let count = await admModel.Product_count(
            search_text.toLowerCase(),
            status
          );
          res
            .status(200)
            .json({
              status: 1,
              data: data,
              count: Number(count[0].count),
            })
            .end();
        })
        .catch((err) => {
          common.logError(err);
          res
            .status(400)
            .json({
              status: 3,
              message: Config.errorText.value,
            })
            .end();
        });
    } catch (err) {
      common.logError(err);
      res
        .status(400)
        .json({
          status: 3,
          message: Config.errorText.value,
        })
        .end();
    }
  },
};
