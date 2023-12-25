const router = require("express").Router();
const dataBaseRoutes = require("./database");

router.use("/database", dataBaseRoutes);

module.exports = router;
