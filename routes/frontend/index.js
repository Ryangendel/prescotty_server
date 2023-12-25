const router = require("express").Router();
const frontend = require("./frontend");

router.use("/gui", frontend);

module.exports = router;
