const { Client } = require("pg");
function dateFormat(date, format) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  return format.replace("mm", month).replace("yyyy", year);
}
const currentDate = new Date();
const config = {
  db: {
    DB_HOST: "localhost",
    DB_NAME: "api_db",
    DB_USER: "postgres",
    DB_PASS: "root",
    DB_PORT: 5432,
  },

  logger: {
    SRV_ERROR_LOG_PATH: "./logs/access.log",
  },
  errorFileName: `/Users/Nikhil/Desktop/assignment/log/error_log_${dateFormat(
    currentDate,
    "mm_yyyy"
  )}.txt`,
  errorLogPath: `/log`,
  transportConfig: {
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: "add email",
      pass: "password",
    },
    // send email for error
  },

  webmasterMail: "nikhilsingheng@gmail.com",
  webmasterMailError: "nikhilsingheng@gmail.com",

  contactUsMail: "nikhilsingheng@gmail.com",
  sendTo: ["nikhilsingheng@gmail.com"],
  errorText: {
    value: "An internal error has occurred. Please try again later.",
  },
  environment: "local",
  mail_environment: "local",
  website: {
    backend_url: "http://localhost:3500",
  },
};
module.exports = config;
