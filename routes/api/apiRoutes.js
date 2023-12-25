const router = require("express").Router();
const Onfleet = require("@onfleet/node-onfleet")

router.get('/testingroute', async (req, res) => {
    const onfleetApi = new Onfleet("433273baf931427ef6b294a5d14af7d4");
    console.log(await onfleetApi.verifyKey())
    onfleetApi.workers.get().then((results) => { 
        console.log("*********************")
        console.log(results)
        console.log("*********************")
    });
    res.send("tested")
})

module.exports = router;