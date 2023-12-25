const router = require("express").Router();
const getdata = require("./getdata");

router.use("/getData", getdata);

module.exports = router;
