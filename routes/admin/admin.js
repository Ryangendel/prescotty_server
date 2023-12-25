const router = require("express").Router();

router.post("/busyinesscontroller/:level", (req, res) => {
    console.log(req.params.level)
    res.status(200).send("busynesscontroller")
})


module.exports = router;