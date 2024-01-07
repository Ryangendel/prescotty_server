const router = require("express").Router();
const Onfleet = require("@onfleet/node-onfleet")
const onfleetLogic = require("../../utils/onfleetlogic")

router.get('/testingroute', async (req, res) => {
    const onfleetApi = new Onfleet(process.env.ONFLEET_API_KEY_LIVE);
    console.log(await onfleetApi.verifyKey())
    onfleetApi.workers.get().then((results) => {
        console.log("*********************")
        console.log(results)
        console.log("*********************")
    });
    res.send("tested")
})

router.post('/bestdazeorder', async (req, res) => {
    console.log(req.body)
    if (req.body._wpcf7_unit_tag == "wpcf7-f560-p590-o1") {
        var BestDazeOrder = {
            client_name: req.body["text-680"],
            customer_email: req.body["email-680"],
            client_phone_number: req.body["tel-630"],
            destination_address: req.body["textarea-398"],
            medical_patient: req.body["radio-98"] == "True" ? true : false,
            payment_type: req.body["radio-97"] == "cash" ? "cash" : "Jane",
            quantity_of_items_in_order: req.body["totalitemsinorder-680"],
            order_total: req.body["total-680"],
            order_subtotal: req.body["subtotal-680"],
            bestdaze_order_id: req.body["orderid-680"],
            products_in_order: []
        }

        if (req.body.product_1[0] && req.body.product_1[1] && req.body.product_1[2] && req.body.product_1[3] && req.body.product_1[4] && req.body.product_1[5]) {
            let product_name = req.body.product_1[0]
            let option = req.body.product_1[1]
            let quantity = req.body.product_1[2]
            let brand = req.body.product_1[3]
            let price = req.body.product_1[4]
            let sku = req.body.product_1[5]
            BestDazeOrder.products_in_order.push({ product_name, option, quantity, brand, price, sku })
        }
        if (req.body.product_2[0] && req.body.product_2[1] && req.body.product_2[2] && req.body.product_2[3] && req.body.product_2[4] && req.body.product_2[5]) {
            let product_name = req.body.product_2[0]
            let option = req.body.product_2[1]
            let quantity = req.body.product_2[2]
            let brand = req.body.product_2[3]
            let price = req.body.product_2[4]
            let sku = req.body.product_2[5]
            BestDazeOrder.products_in_order.push({ product_name, option, quantity, brand, price, sku })
        }
        if (req.body.product_3[0] && req.body.product_3[1] && req.body.product_3[2] && req.body.product_3[3] && req.body.product_3[4] && req.body.product_3[5]) {
            let product_name = req.body.product_3[0]
            let option = req.body.product_3[1]
            let quantity = req.body.product_3[2]
            let brand = req.body.product_3[3]
            let price = req.body.product_3[4]
            let sku = req.body.product_3[5]
            BestDazeOrder.products_in_order.push({ product_name, option, quantity, brand, price, sku })
        }
        if (req.body.product_4[0] && req.body.product_4[1] && req.body.product_4[2] && req.body.product_4[3] && req.body.product_4[4] && req.body.product_4[5]) {
            let product_name = req.body.product_4[0]
            let option = req.body.product_4[1]
            let quantity = req.body.product_4[2]
            let brand = req.body.product_4[3]
            let price = req.body.product_4[4]
            let sku = req.body.product_4[5]
            BestDazeOrder.products_in_order.push({ product_name, option, quantity, brand, price, sku })
        }
        if (req.body.product_5[0] && req.body.product_5[1] && req.body.product_5[2] && req.body.product_5[3] && req.body.product_5[4] && req.body.product_5[5]) {
            let product_name = req.body.product_5[0]
            let option = req.body.product_5[1]
            let quantity = req.body.product_5[2]
            let brand = req.body.product_5[3]
            let price = req.body.product_5[4]
            let sku = req.body.product_5[5]
            BestDazeOrder.products_in_order.push({ product_name, option, quantity, brand, price, sku })
        }

    }

    var success = await onfleetLogic.makeOrder(BestDazeOrder)
    if (success) {
        //return res.redirect('/orderconfirmation');
        res.redirect(`/frontend/gui/orderconfirmation?ordernumber=${req.body["orderid-680"]}`);
        return
    } else {
        res.send("There was an error, try building the order again. Make sure the phone number doesnt have any '-' and the address is inputted correctly")
    }
    //res.json([BestDazeOrder])
    //res.redirect(307, '/frontend/gui/bestdaze/home');
})

module.exports = router;