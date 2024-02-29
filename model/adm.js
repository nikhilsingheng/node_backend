const db = require("../db/dbConn");
const common = require("../controllers/common");
const Config = require("../db/Config");
module.exports = {
  createProduct: async (
    product_original_name,
    product_new_name,
    title,
    description,
    created_at,
    slug,
    status
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        const existingProduct = await db.oneOrNone(
          "SELECT product_id FROM products WHERE slug = $1",
          [slug]
        );

        if (existingProduct) {
          await db.none(
            "UPDATE products SET product_original_name=$1, product_new_name=$2 title = $3, description = $4, created_at=$5,status=$6 WHERE slug = $7",
            [
              product_original_name,
              product_new_name,
              title,
              description,
              slug,
              created_at,
              status,
            ]
          );
          resolve(existingProduct.product_id);
        } else {
          try {
            const newProduct = await db.one(
              `INSERT INTO products (product_original_name,product_new_name,title, description,created_at,slug, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING product_id`,
              [
                product_original_name,
                product_new_name,
                title,
                description,
                slug,
                created_at,
                status,
              ]
            );

            resolve(newProduct.product_id);
          } catch (err) {
            reject(err);
          }
        }
      } catch (error) {
        console.log("error", error);
        var errorText = common.getErrorText(error);
        var error = new Error(errorText);
        reject(error);
      }
    });
  },
  get_productfeed_list: async (search_txt, status, limit, offset) => {
    var url =
      Config.environment === "local"
        ? `${Config.website.backend_url}/image/`
        : "";

    let condition = "";
    if (!!search_txt) {
      condition += ` AND (LOWER(products.title::varchar) LIKE '%${search_txt}%' OR LOWER(products.slug::varchar) LIKE '%${search_txt}%')`;
    }

    return db.any(
      `SELECT DISTINCT ON (products.product_id) 
      product_id,  products.title,  products.description, products.slug,products.created_at, 
      products.updated_at,
      CONCAT('${url}', products.product_new_name) AS image_url
    FROM products
    WHERE 1=1 ${condition}
    ORDER BY products.product_id DESC
    LIMIT ${limit} OFFSET ${offset}`
    );
  },

  Product_count: async (search_text, status) => {
    var condition = "";
    if (!!search_text) {
      condition += ` AND (LOWER(products.title) LIKE '%$1:value%' OR LOWER(products.slug) LIKE '%$1:value%')`;
    }
    return db.any(
      `SELECT COUNT(DISTINCT products.product_id)
      FROM products
      WHERE 1=1 ${condition}`,
      search_text.toLowerCase()
    );
  },
};
