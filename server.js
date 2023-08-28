const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 3001;
const fs = require('fs')
// var parse = require('csv-parse')
const csv = require('csv-parser')

const { Customer } = require('./models/Customer');
const { Product } = require('./models/Product');
const { Order } = require('./models/Order');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//un: gendelryan
//pw: 6NlDYpx8QPujyaZQ
mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prescotty',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

mongoose.set('debug', true);

app.post('/submit', ({ body }, res) => {
    Order.create(body)
        .then((dbNote) => {
            res.json(dbNote);
        })
        .catch((err) => {
            res.json(err);
        });
});
var count = 0
app.get('/all', (req, res) => {
    var results = []
    fs.createReadStream('./contacts_live.csv')
        .pipe(csv())
        .on('data', async (data) => {

            var dataObj = {}
            //LOOOP OF DATA OBJECTS


            dataObj.full_name = data.Name
            dataObj.mobile = data["Phone 1 - Value"]
            dataObj.address1 = data["Address 1 - Street"]
            dataObj.city = data["Address 1 - City"]
            dataObj.state = data["Address 1 - Region"]
            dataObj.zip = data["Address 1 - Postal Code"]
            const dobRegex = /DOB: (\d{2}\/\d{2}\/\d{4})/;
            const dob = data.Notes.match(dobRegex);
            if (dob && dob[1]) {
                dataObj.dob = dob[1];
            }
            const taskIdRegex = /Onfleet Task ID:\s+(\w+)/;

            //IF DUTCHIE ORDER ---------------------------------------------       
            if (data.Notes.includes("https://dhcie")) {
                console.log("************************************")
                dataObj.pos_system_used = "Dutchie"
                function extractOrderInfo(input) {
                    const orderInfo = {};

                    // Extract DOB, Drivers License, Onfleet Task ID, View Order, Order Number
                    const dobMatch = input.match(/DOB: ([^\n]+)/);
                    const driversLicenseMatch = input.match(/Drivers License: ([^\n]+)/);
                    const onFleetTaskIDMatch = input.match(/Onfleet Task ID:  ([^\n]+)/);
                    const viewOrderMatch = input.match(/View order: ([^\n]+)/);
                    const orderNumberMatch = input.match(/Order Number: ([^\n]+)/);

                    orderInfo.dob = dobMatch ? dobMatch[1].trim() : null;
                    orderInfo.drivers_license = driversLicenseMatch ? driversLicenseMatch[1].trim() : null;

                    // Split "created at" time from "on_fleet_task_id"
                    if (onFleetTaskIDMatch) {
                        const onFleetTaskIDParts = onFleetTaskIDMatch[1].split(" created at ");
                        orderInfo.on_fleet_task_id = onFleetTaskIDParts[0].trim();
                        const created_at_timestamp = parseInt(onFleetTaskIDParts[1]);
                        orderInfo.created_at = new Date(created_at_timestamp).toISOString();
                    } else {
                        orderInfo.on_fleet_task_id = null;
                        orderInfo.created_at = null;
                    }

                    orderInfo.view_order = viewOrderMatch ? viewOrderMatch[1].trim() : null;
                    orderInfo.order_number = orderNumberMatch ? orderNumberMatch[1].trim() : null;

                    // Extract Product Info
                    const productInfo = [];

                    const productBlocks = input.match(/Products:(.*?)productSubtotal:/s);
                    if (productBlocks) {
                        const productLines = productBlocks[1].split("\n");
                        let product = {};

                        for (let i = 0; i < productLines.length; i++) {
                            const line = productLines[i].trim();
                            if (line === "-----------") {
                                if (Object.keys(product).length > 0) {
                                    // Convert quantity and price to integers
                                    product.quantity = parseInt(product.quantity);
                                    product.price = parseFloat(product.price);
                                    productInfo.push(product);
                                    product = {};
                                }
                            } else {
                                const keyValue = line.split(":");
                                if (keyValue.length === 2) {
                                    const key = keyValue[0].trim();
                                    const value = keyValue[1].trim();
                                    product[key.toLowerCase()] = key === "price" ? parseFloat(value) : value;
                                }
                            }
                        }

                        if (Object.keys(product).length > 0) {
                            // Convert quantity and price to integers for the last product
                            product.quantity = parseInt(product.quantity);
                            product.price = parseFloat(product.price);
                            productInfo.push(product);
                        }
                    }

                    orderInfo.products = productInfo;

                    // Extract productSubtotal, deliveryFee, total, medical card, etc.
                    const productSubtotalMatch = input.match(/productSubtotal: \$([\d.]+)/);
                    const deliveryFeeMatch = input.match(/deliveryFee: \$([\d.]+)/);
                    const totalMatch = input.match(/total: \$([\d.]+)/);
                    const medicalCardMatch = input.match(/Medical Card: ([^\n]+)/);
                    const emailMatch = input.match(/Email: ([^\n]+)/);
                    const expirationDateMatch = input.match(/Exp: ([^\n]+)/);

                    orderInfo.productSubtotal = productSubtotalMatch ? parseFloat(productSubtotalMatch[1]) : null;
                    orderInfo.deliveryFee = deliveryFeeMatch ? parseFloat(deliveryFeeMatch[1]) : null;
                    orderInfo.total = totalMatch ? parseFloat(totalMatch[1]) : null;
                    orderInfo.medical = medicalCardMatch ? true : false;
                    orderInfo.email = emailMatch ? emailMatch[1].trim() : null;
                    orderInfo.expiration_date = expirationDateMatch ? expirationDateMatch[1].trim() : null;

                    return orderInfo;
                }

                const orderInfo = extractOrderInfo(data.Notes);

                dataObj.dob = orderInfo.dob
                dataObj.drivers_license = orderInfo.drivers_license
                dataObj.on_fleet_task_id = orderInfo.on_fleet_task_id
                dataObj.created_at = orderInfo.created_at
                dataObj.order_number = orderInfo.order_number
                dataObj.order_detail = orderInfo.products
                dataObj.subtotal = orderInfo.productSubtotal
                dataObj.drivers_license = orderInfo.drivers_license
                dataObj.delivery_fee = orderInfo.deliveryFee
                dataObj.order_total = orderInfo.total
                dataObj.medical = orderInfo.medical
                dataObj.customer_email = orderInfo.email
                dataObj.med_card_expiration_date = orderInfo.expiration_date

            }
            //END DUTCHIE ORDER------------------------------

            //START LEAFLY ORDERS
            if (data.Notes.includes("Leafly")) {
                // Function to extract purchase details
                function extractOrderInfo(inputString) {
                    const taskIDPattern = /Onfleet Task ID:\s+([^\n]+)/;
                    const timeStampPattern = /created at (\d+)/;
                    const orderIDPattern = /Leafly Order ID:\s+(\d+)/;
                    const orderTotalPattern = /Order Total \(tax incl.\):\s+([\d.]+)/;

                    const extractedOrder = {};
                    const taskIDMatch = inputString.match(taskIDPattern);

                    if (taskIDMatch) {
                        // Remove "created at" from task_id
                        extractedOrder.task_id = taskIDMatch[1].replace(/ created at \d+/, '').trim();
                    }

                    extractedOrder.time_stamp = parseInt(inputString.match(timeStampPattern)[1]);
                    extractedOrder.order_id = inputString.match(orderIDPattern)[1].trim();
                    extractedOrder.total = parseFloat(inputString.match(orderTotalPattern)[1]);

                    return extractedOrder;
                }

                const extractedData1 = extractOrderInfo(data.Notes);

                dataObj.task_id = extractedData1.task_id

                //new Date(parseInt(inputString.match(timePattern)[1])).toISOString();
                dataObj.time_stamp = new Date(extractedData1.time_stamp)
                dataObj.order_id = extractedData1.order_id
                dataObj.total = extractedData1.total
                dataObj.pos_system_used = "Leafly"
            }

            //END LEAFLY ORDERS---------------------------------
            //START Transaction ID --- NOT SURE THE POS
            if (data.Notes.includes("Transaction ID")) {
                // console.log(data.Notes)
                //******************************************** */
                function extractProductInfo(input) {
                    const productInfo = [];

                    const lines = input.split('\n');
                    let isProductsSection = false;
                    let subTotal = null;
                    let total = null;

                    for (const line of lines) {
                        if (line.startsWith("Sub-Total: $")) {
                            subTotal = parseFloat(line.match(/\$([\d.]+)/)?.[1]) || null;
                        } else if (line.startsWith("Total: $")) {
                            total = parseFloat(line.match(/\$([\d.]+)/)?.[1]) || null;
                        } else if (isProductsSection && line.trim() !== "") {
                            const parts = line.split("|");
                            if (parts.length === 2) {
                                const [productPart, skuPart] = parts;
                                const matchQuantityProduct = productPart.trim().match(/(\d+\.\d+)\s*x\s+(.+)/);
                                const matchOptionType = productPart.trim().match(/(\d\s*Gram|\d\s*g)\s*(.+)/);

                                if (matchQuantityProduct && matchOptionType) {
                                    const [, quantity, productKey] = matchQuantityProduct;
                                    const [, option, type] = matchOptionType;

                                    const sku = parseInt(skuPart.trim().split(" ")[0], 10);

                                    // Remove the number and any following characters after the option
                                    const trimmedProductKey = productKey.trim().replace(/\d+\s*(g|Gram|gram)?.*$/, "");

                                    productInfo.push({
                                        quantity: parseFloat(quantity),
                                        product: trimmedProductKey.trim(),
                                        option: option.trim(),
                                        type: type.trim(),
                                        sku,
                                    });
                                }
                            }
                        } else if (line.startsWith("ONFLEET ORDER NOTES")) {
                            isProductsSection = true;
                        }
                    }

                    return { productInfo, subTotal, total };
                }

                const { productInfo, subTotal, total } = extractProductInfo(data.Notes);
                console.log("Product Info:", productInfo);
                console.log("Sub-Total:", subTotal);
                console.log("Total:", total);
                dataObj.pos_system_used = "not sure1"
                dataObj.order = productInfo
                dataObj.subtotal = subTotal
                dataObj.total = total
            }
            //END Transaction ID --- NOT SURE THE POS
            if (data.Notes.includes("-------------------")) {
                function extractProductInfo(line) {
                    const regex = /(\d+(\.\d+)?) x ([^\d]+)([\d.]*(?: Gram|g)?(?: Pre-Roll)?)/i;
                    const match = line.match(regex);
                    if (match) {
                        const quantity = Math.ceil(parseFloat(match[1]));
                        const product = match[3].trim().replace(/-+$/, '').trim();
                        const option = match[4].trim();
                        return { quantity, product, option };
                    }
                    return null;
                }

                // Function to extract Total
                function extractTotal(lines) {
                    const totalLine = lines.find(line => line.includes('Total:'));
                    const total = parseFloat(totalLine.match(/\$([\d.]+)/)[1]);
                    return total;
                }

                // Split the input string into lines
                const lines1 = data.Notes.split('\n');

                // Find the start and end of the "Order Details" section
                const start1 = lines1.indexOf('-------------------\nOrder Details\n-------------------') + 2;
                const end1 = lines1.indexOf('Total:', start1);

                // Extract product information and totals
                const productInfo1 = lines1.slice(start1, end1).map(extractProductInfo).filter(Boolean);
                const total1 = extractTotal(lines1);


                // Output results
                // console.log("Product Info from input1:", productInfo1);
                // console.log("Total from input1:", total1);
                dataObj.pos_system_used = "not sure2"
                dataObj.order = productInfo1
                dataObj.total = total1.total
            }
            // JANE START -------------------------------------------------------------------
            if (data.Notes.includes("Jane Customer")) {
                console.log(data.Notes)
                function extractProductInfo(input) {
                    const lines = input.split('\n');
                    let orderTotal = null;
                    const productInfo = [];
                    let currentProduct = {};

                    for (const line of lines) {
                        if (line.includes('Total = $')) {
                            orderTotal = parseFloat(line.match(/Total = \$([\d.]+)/)[1]);
                        } else if (line.trim().length > 0) {
                            const quantityMatch = line.match(/(\d+)x\s+/);
                            if (quantityMatch) {
                                if (currentProduct.product) {
                                    productInfo.push(currentProduct);
                                }
                                currentProduct = {};
                                currentProduct.quantity = parseInt(quantityMatch[1]);
                                const productOptionMatch = line.replace(quantityMatch[0], '').match(/(.*?)\s+\|\s+(.*):\s+\$([\d.]+)/);
                                if (productOptionMatch) {
                                    currentProduct.product = productOptionMatch[1].trim();
                                    currentProduct.option = productOptionMatch[2].trim();
                                    currentProduct.price = parseFloat(productOptionMatch[3]);
                                } else {
                                    // Handle cases where productOptionMatch is null
                                    currentProduct.product = line.replace(quantityMatch[0], '').replace(/:\s+\$([\d.]+)/, '').trim();
                                    currentProduct.price = parseFloat(line.match(/:\s+\$([\d.]+)/)[1]);
                                }
                            }
                        }
                    }

                    if (currentProduct.product) {
                        productInfo.push(currentProduct);
                    }

                    return { orderTotal, productInfo };
                }

                // Extract product information and order total
                const { orderTotal, productInfo } = extractProductInfo(data.Notes);

                // Output results
                dataObj.pos_system_used = "Jane"
                dataObj.order = productInfo
                dataObj.total = orderTotal

            }
            // JANE END -------------------------------------------------------------------

            results.push(dataObj)
        })
        .on('end', () => {

            res.json(results)
        });
});

app.put('/update/:id', ({ params, body }, res) => {
    Order.findOneAndUpdate({ _id: params.id }, body, { new: true })
        .then((dbNote) => {
            if (!dbNote) {
                res.json({ message: 'No note found with this id!' });
                return;
            }
            res.json(dbNote);
        })
        .catch((err) => {
            res.json(err);
        });
});

app.delete('/delete/:id', ({ params }, res) => {
    Order.findOneAndDelete({ _id: params.id })
        .then((dbNote) => {
            if (!dbNote) {
                res.json({ message: 'No note found with this id!' });
                return;
            }
            res.json(dbNote);
        })
        .catch((err) => {
            res.json(err);
        });
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});
