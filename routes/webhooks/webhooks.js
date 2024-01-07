const router = require("express").Router();
const crypto = require('crypto')
const fs = require('fs');
var webhookdata = null;

router.post('/testingroute/webhook/createtask', async (req, res) => {
    const secret = process.env.ONFLEET_SECRET_TESTING
    const onfleetSignature = req.headers['x-onfleet-signature'];

    var parsedBody = JSON.stringify(req.body)

    const hmac = crypto.createHmac('sha512', Buffer.from(secret, 'hex'))
        .update(parsedBody)
        .digest('hex');

    // Compare the generated HMAC with the X-Onfleet-Signature
    if (hmac === onfleetSignature) {
        const dropoffTask = {}
        const pickupTask = {}
        if (req.body.data.task.pickupTask == false) {
            console.log("inside here-------------")
            dropoffTask.task_id = req.body.data.task.id
            dropoffTask.destination_address = req.body.data.task.destination.address
            dropoffTask.destination_coordinates = req.body.data.task.destination.location
            dropoffTask.merchant = req.body.data.task.merchant
            dropoffTask.container = req.body.data.task.container
            dropoffTask.webhook_trigger = req.body.triggerName
            dropoffTask.time_created = req.body.data.task.timeCreated
            dropoffTask.state = req.body.data.task.state
            dropoffTask.notes = req.body.data.task.notes
        }

        if (req.body.data.task.pickupTask == true) {
            pickupTask.dependencies = req.body.data.task.dependencies
            pickupTask.task_id = req.body.data.task.id
            pickupTask.destination_address = req.body.data.task.destination.address
            pickupTask.destination_coordinates = req.body.data.task.destination.location
            pickupTask.merchant = req.body.data.task.merchant
            pickupTask.container = req.body.data.task.container
            pickupTask.webhook_trigger = req.body.triggerName
            pickupTask.time_created = req.body.data.task.timeCreated
            pickupTask.state = req.body.data.task.state
            pickupTask.notes = req.body.data.task.notes
        }
        if (dropoffTask.time_created) {
            fs.writeFile('./routes/webhooks/mostRecientOrder/dropoff.json', JSON.stringify(dropoffTask, null, 2), err => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Dropoff data written to dropoff.json');
            });
        }
        if (pickupTask.time_created) {
            fs.writeFile('./routes/webhooks/mostRecientOrder/pickup.json', JSON.stringify(pickupTask, null, 2), err => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Pickup data written to pickup.json');
            });
        }
        //return res.redirect('/orderconfirmation');
        return res.status(200).send('Webhook received');
    } else {
        console.log('Invalid webhook');
        return res.status(401).send('Invalid signature');
    }
})

router.get("/testingroute/webhook/createtask", (req, res) => {
    res.status(200).send(req.query.check)
})

//----------------------------------------------------------LIVE WEBHOOK
router.get("/webhook/createtask/bestdaze", (req, res) => {
    res.status(200).send(req.query.check)
})

router.post('/webhook/createtask/bestdaze', async (req, res) => {
    const secret = process.env.ONFLEET_SECRET_TESTING
    const onfleetSignature = req.headers['x-onfleet-signature'];

    var parsedBody = JSON.stringify(req.body)

    const hmac = crypto.createHmac('sha512', Buffer.from(secret, 'hex'))
        .update(parsedBody)
        .digest('hex');

    // Compare the generated HMAC with the X-Onfleet-Signature
    if (hmac === onfleetSignature) {
        const dropoffTask = {}
        const pickupTask = {}
        console.log("------------------------------------------------++++++")
        console.log(req.body)
        console.log("------------------------------------------------++++++")
        if (req.body.data.task.pickupTask == false) {
            console.log("inside here-------------")
            dropoffTask.task_id = req.body.data.task.id
            dropoffTask.destination_address = req.body.data.task.destination.address
            dropoffTask.destination_coordinates = req.body.data.task.destination.location
            dropoffTask.merchant = req.body.data.task.merchant
            dropoffTask.container = req.body.data.task.container
            dropoffTask.webhook_trigger = req.body.triggerName
            dropoffTask.time_created = req.body.data.task.timeCreated
            dropoffTask.state = req.body.data.task.state
            dropoffTask.notes = req.body.data.task.notes
        }

        if (req.body.data.task.pickupTask == true) {
            pickupTask.dependencies = req.body.data.task.dependencies
            pickupTask.task_id = req.body.data.task.id
            pickupTask.destination_address = req.body.data.task.destination.address
            pickupTask.destination_coordinates = req.body.data.task.destination.location
            pickupTask.merchant = req.body.data.task.merchant
            pickupTask.container = req.body.data.task.container
            pickupTask.webhook_trigger = req.body.triggerName
            pickupTask.time_created = req.body.data.task.timeCreated
            pickupTask.state = req.body.data.task.state
            pickupTask.notes = req.body.data.task.notes
        }
        if (dropoffTask.time_created) {
            fs.writeFile('./routes/webhooks/mostRecientOrder/dropoff.json', JSON.stringify(dropoffTask, null, 2), err => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Dropoff data written to dropoff.json');
            });
        }
        if (pickupTask.time_created) {
            fs.writeFile('./routes/webhooks/mostRecientOrder/pickup.json', JSON.stringify(pickupTask, null, 2), err => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Pickup data written to pickup.json');
            });
        }
        //return res.redirect('/orderconfirmation');
        return res.status(200).send('Webhook received');
    } else {
        console.log('Invalid webhook');
        return res.status(401).send('Invalid signature');
    }
})

//---------------END

router.post("/webhooks", (req, res) => {
    const secret = process.env.ONFLEET_SECRET
    const onfleetSignature = req.headers['x-onfleet-signature'];

    var parsedBody = JSON.stringify(req.body)

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

router.get("/webhookdata", async (req, res) => {
    res.json(webhookdata)
})

module.exports = router;