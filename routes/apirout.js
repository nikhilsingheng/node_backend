const express = require("express");
const adminRouter = require("./adm");
const router = express.Router();
const defaultRoutes = [
  {
    path: "/adm",
    route: adminRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
module.exports = router;
