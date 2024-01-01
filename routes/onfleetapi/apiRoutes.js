const router = require("express").Router();
const Onfleet = require("@onfleet/node-onfleet")
const onfleetLogic = require("../../utils/onfleetlogic")

router.get('/testingroute', async (req, res) => {
    var drivers = await onfleetLogic.getAllDriversOnDuty()
    res.json({drivers:drivers})
})

module.exports = router;