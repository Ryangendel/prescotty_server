const router = require("express").Router();
const crypto = require('crypto')

router.post('/testingroute/webhook/createtask', async (req, res) => {
    const secret = process.env.ONFLEET_SECRET
    const onfleetSignature = req.headers['x-onfleet-signature'];
    
    var parsedBody =  JSON.stringify(req.body)

    const hmac = crypto.createHmac('sha512', Buffer.from(secret, 'hex'))
        .update(parsedBody)
        .digest('hex');

    // Compare the generated HMAC with the X-Onfleet-Signature
    if (hmac === onfleetSignature) {
        console.log(req.body);
        return res.status(200).send('Webhook received');
    } else {
        console.log('Invalid webhook');
        return res.status(401).send('Invalid signature');
    }
})

router.get("/testingroute/webhook/createtask", (req, res) => {
    res.status(200).send(req.query.check)
})

router.post("/webhooks", (req, res) => {
    const secret = process.env.ONFLEET_SECRET
    const onfleetSignature = req.headers['x-onfleet-signature'];
    
    var parsedBody =  JSON.stringify(req.body)

    const hmac = crypto.createHmac('sha512', Buffer.from(secret, 'hex'))
        .update(parsedBody)
        .digest('hex');

    // Compare the generated HMAC with the X-Onfleet-Signature
    if (hmac === onfleetSignature) {
        console.log(req.body.data.task.completionDetails)
        console.log("--------")
        console.log(req.body.data.task.additionalQuantities)
        console.log("--------")
        console.log(req.body.data.task.identity)
        console.log("--------")
        console.log(req.body.data.task.appearance)
        console.log("--------")
        console.log(req.body.data.task.container)
        console.log("--------")
        console.log(req.body.data.task.recipients)
        console.log("--------")
        console.log(req.body.data.task.destination)

        return res.status(200).send('Webhook received');
    } else {
        console.log('Invalid webhook');
        return res.status(401).send('Invalid signature');
    }
})

router.get("/webhooks", (req, res) => {
    res.status(200).send(req.query.check)
})

module.exports = router;