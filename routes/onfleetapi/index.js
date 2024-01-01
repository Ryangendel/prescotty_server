const router = require("express").Router();
const apiRoutes = require("./apiRoutes");

router.use("/onfleetapi", apiRoutes);

module.exports = router;
