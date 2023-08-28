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
                console.log("--------------------------------------PPPPPPPPPPP")
                function extractOrderInfo(input) {
                    let orderInfo = {};
                  
                    // Personal information
                    const dobMatch = input.match(/DOB: (\d{2}\/\d{2}\/\d{4})/);
                    const emailMatch = input.match(/Email: ([\w.-]+@[\w.-]+\.[a-zA-Z]{2,4})/);
                    const medicalCardMatch = input.match(/Medical Card: (.*)/);
                    const expDateMatch = input.match(/Exp: (\d{2}\/\d{2}\/\d{4})/);
                  
                    orderInfo.dob = dobMatch ? dobMatch[1] : null;
                    orderInfo.user_email = emailMatch ? emailMatch[1] : null;
                    orderInfo.medical = medicalCardMatch && medicalCardMatch[1].trim() ? true : false;
                    orderInfo.medical_card = medicalCardMatch && medicalCardMatch[1].trim() ? medicalCardMatch[1].trim() : null;
                    orderInfo.exp = expDateMatch ? expDateMatch[1] : null;
                  
                    // Onfleet order notes
                    const onfleetTaskIdMatch = input.match(/Onfleet Task ID:  (\w+) created at (\d+)/);
                    const viewOrderMatch = input.match(/View order: (https:\/\/dhcie\.(org|biz)\/c\/\w+)/);
                    const orderNumberMatch = input.match(/Order Number: (\d+)/);
                  
                    orderInfo.onfleet_task_id = onfleetTaskIdMatch ? onfleetTaskIdMatch[1] : null;
                    orderInfo.time = onfleetTaskIdMatch ? parseInt(onfleetTaskIdMatch[2]) : null;
                    orderInfo.view_order = viewOrderMatch ? viewOrderMatch[1] : null;
                    orderInfo.order_number = orderNumberMatch ? parseInt(orderNumberMatch[1]) : null;
                  
                    // Products
                    const productsString = input.split("Products:")[1].split("productSubtotal:")[0];
                    const productsArray = productsString.split("-----------").filter(p => p.trim().length > 0);
                    let products = [];
                  
                    for (const product of productsArray) {
                      let productInfo = {};
                      const lines = product.trim().split("\n");
                      productInfo.product_name = lines[0];
                      productInfo.option = lines[1].replace("Option: ", "");
                      productInfo.quantity = parseInt(lines[2].replace("Quantity: ", ""));
                      productInfo.brand = lines[3].replace("Brand: ", "");
                      productInfo.price = parseFloat(lines[4].replace("Price: ", ""));
                  
                      products.push(productInfo);
                    }
                  
                    orderInfo.products = products;
                  
                    // Summary
                    const lines = input.split("\n");
                    const subtotalLine = lines.find(line => line.startsWith("productSubtotal:"));
                    const totalLine = lines.find(line => line.startsWith("total:"));
                    
                    orderInfo.subtotal = subtotalLine ? parseFloat(subtotalLine.replace("productSubtotal: $", "")) : null;
                    orderInfo.delivery_fee? orderInfo.delivery_fee= parseFloat(input.match(/deliveryFee: \$(\d+(\.\d{2})?)/)[1]):null;
                    orderInfo.total = totalLine ? parseFloat(totalLine.replace("total: $", "")) : null;
                  
                    return orderInfo;
                  }
                  
                  // Example usage
                  var orderInfo=extractOrderInfo(data.Notes)
               
                //7777777777777777777777777777777777777777777777777777777777
                dataObj.NOTES = data.Notes
                dataObj.customers_dob = orderInfo.dob
                dataObj.drivers_license = orderInfo.drivers_license
                dataObj.on_fleet_task_id = orderInfo.on_fleet_task_id
                dataObj.created_at = new Date(orderInfo.time)
                dataObj.order_number = orderInfo.order_number
                dataObj.order_detail = orderInfo.products
                dataObj.subtotal = orderInfo.subtotal
                dataObj.delivery_fee = orderInfo.delivery_fee
                dataObj.order_total = orderInfo.total
                dataObj.drivers_license = orderInfo.drivers_license
                dataObj.delivery_fee = orderInfo.deliveryFee
                dataObj.medical_patient = orderInfo.medical
                dataObj.medical_patient_card = orderInfo.medical_card
                dataObj.customer_email = orderInfo.user_email
                dataObj.med_card_expiration_date = orderInfo.exp
                dataObj.view_order_url = orderInfo.view_order

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
                dataObj.order_total = extractedData1.total
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
                dataObj.pos_system_used = "not sure1"
                dataObj.order = productInfo
                dataObj.subtotal = subTotal
                dataObj.order_total = total
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
                dataObj.order_total = total1.total
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
                dataObj.order_total = productInfo
                dataObj.total = orderTotal

            }
            // JANE END -------------------------------------------------------------------
            if(dataObj.order_total > 15){
                results.push(dataObj)
            }
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
