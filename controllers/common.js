const moment = require("moment");
const nodemailer = require("nodemailer");
const dateMath = require("date-arithmetic");
const fs = require("fs");
const Config = require("../db/Config");
const errorLogFile = Config.errorFileName;
var transportConfig = Config.transportConfig;

module.exports = {
  nextDate: (value, unit) => {
    var unitArr = [
      "milliseconds",
      "second",
      "minutes",
      "hours",
      "day",
      "weekday",
      "month",
      "year",
      "decade",
      "century",
    ];

    if (unitArr.indexOf(unit) == "-1") {
      var e = new Error("Invalid unit given.");
      return e;
    }

    if (value <= 0) {
      var e = new Error("Invalid days given.");
      return e;
    }

    return dateMath.add(date, value, unit);
  },

  logError: (err) => {
    try {
      var matches = err.stack.split("\n");
      var regex1 = /\((.*):(\d+):(\d+)\)$/;
      var regex2 = /(.*):(\d+):(\d+)$/;
      var errorArr1 = regex1.exec(matches[1]);
      var errorArr2 = regex2.exec(matches[1]);

      if (errorArr1 !== null || errorArr2 !== null) {
        var errorText = matches[0];
        var errorFile, errorLine;

        if (errorArr1 !== null) {
          errorFile = errorArr1[1];
          errorLine = errorArr1[2];
        } else if (errorArr2 !== null) {
          errorFile = errorArr2[1];
          errorLine = errorArr2[2];
        }

        var now = new Date();
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, "0");
        var day = String(now.getDate()).padStart(2, "0");
        var hours = String(now.getHours()).padStart(2, "0");
        var minutes = String(now.getMinutes()).padStart(2, "0");
        var seconds = String(now.getSeconds()).padStart(2, "0");

        var date_format = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        var errMsg = `\n DateTime: ${date_format} \n ${errorText} \n Line No : ${errorLine} \n File Path: ${errorFile} \n`;
        var errHtml = `<!DOCTYPE html><html><body><p>${errorText}</p><p>Line No : ${errorLine}</p><p>File Path: ${errorFile}</p></body></html>`;

        // LOG ERR
        fs.appendFile(errorLogFile, errMsg, (err) => {
          if (err) {
            console.log("Error occurred while writing to file:", err);
          } else {
            console.log("The file has been saved!");
          }
        });
        var toArr = [Config.webmasterMailError];
        var mailOptions = {
          from: Config.webmasterMail,
          to: toArr,
          subject: `Error In ${Config.website.backend_url}`,
          html: errHtml,
        };
        var transporter = nodemailer.createTransport(transportConfig);
        transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            console.log("err", err);
          } else {
            console.log(info);
          }
        });
      }
    } catch (error) {
      console.log("Error occurred during error handling:", error);
    }
  },
  trimSpaces: (str) => {
    return str ? str.trim().replace(/\s+/g, " ") : "";
  },
  lowerTrimWs: (str) => {
    return str ? str.trim().toLowerCase() : "";
  },
  getErrorText: (err) => {
    console.log({ err });
    var matches = err.stack.split("\n");
    return matches[0];
  },
  isEmptyObj: (obj) => {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  },
};
