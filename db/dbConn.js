const Promise = require("bluebird");
const Config = require("./Config");
const common = require("../controllers/common");
const initOptions = {
  promiseLib: Promise,
  query(e) {
    // console.log("+++++++++++++++++++");
    console.log(e.query);
    // console.log("+++++++++++++++++++");
  },
  error(error, e) {
    if (e.cn) {
      console.log("CN:", e.cn);
      console.log("EVENT:", error.message || error);
      var toArr = ["nikhilsingheng@gmail.com"];
      common.sendMail({
        from: Config.webmasterMail,
        to: toArr,
        subject: `URL ||  ${Config.website.backend_url} || DB Error`,
        html: `Error: ${JSON.stringify(e.cn)} <br> ${JSON.stringify(
          error.message
        )} <br> ${JSON.stringify(error)}`,
      });
    }
  },
};
const pgp = require("pg-promise")(initOptions);

const cn = {
  host: Config.db.DB_HOST,
  port: Config.db.DB_PORT,
  database: Config.db.DB_NAME,
  user: Config.db.DB_USER,
  password: Config.db.DB_PASS,
};

pgp.pg.types.setTypeParser(1114, (s) => s);

const db = pgp(cn);

db.connect()
  .then((obj) => {
    obj.done();
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

module.exports = db;
