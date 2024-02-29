const express = require("express");
const router = require("express-promise-router")();
const admController = require("../controllers/adm");

const { schema_posts } = require("../helpers/admValidate");

/**
 * @desc product
 * @return json
 */
router
  .route("/product")
  .post(schema_posts.product_image, admController.create_product);

router.route("/get_product").get(admController.get_product);

module.exports = router;
