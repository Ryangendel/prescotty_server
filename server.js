const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 3001;
const fs = require('fs')
// var parse = require('csv-parse')
const csv = require('csv-parser')
const { Customer, Order, Product } = require('./models');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
let db;
//un: gendelryan
//pw: 6NlDYpx8QPujyaZQ
const resetDatabase = async () => {
    await mongoose.connection.dropDatabase();
    console.log('Database reset');
};

// Connect to MongoDB
mongoose.connect(
    //     process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prescotty',
    'mongodb://127.0.0.1:27017/prescotty',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
)
    .then(() => {
        console.log('Connected successfully to MongoDB');
        resetDatabase()
        // You can use mongoose.connection to interact with the database
        const db = mongoose.connection;
        var PORT = 3002
        // Start up the express server
        // Replace with your port number
        const app = require('express')();  // Add your express initialization here

        app.listen(PORT, async () => {
            // await resetDatabase();  // Reset database
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Mongo connection error: ', err.message);
    });

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

var results = []

app.get('/all', (req, res) => {

    fs.createReadStream('./contacts_live.csv')
        .pipe(csv())
        .on('data', async (data) => {

            var dataObj = {}

            function removeLeadingOne(str) {
                if (str.startsWith('1')) {
                    return str.substring(1);
                }
                return str;
            }

            dataObj.full_name = data.Name
            dataObj.mobile = removeLeadingOne(data["Phone 1 - Value"])
            dataObj.address1 = data["Address 1 - Street"]
            dataObj.city = data["Address 1 - City"]
            dataObj.state = data["Address 1 - Region"]
            dataObj.zip = parseInt(data["Address 1 - Postal Code"])
            const dobRegex = /DOB: (\d{2}\/\d{2}\/\d{4})/;
            const dob = data.Notes.match(dobRegex);
            if (dob && dob[1]) {
                dataObj.dob = dob[1];
            }
            const taskIdRegex = /Onfleet Task ID:\s+(\w+)/;

            //IF DUTCHIE ORDER ---------------------------------------------       
            if (data.Notes.includes("https://dhcie")) {
                dataObj.pos_system_used = "Dutchie"
                function parseOrderString(orderString) {
                    const orderObj = {
                        products: []
                    };

                    const lines = orderString.split('\n');

                    for (const line of lines) {
                        if (line.startsWith("DOB:")) {
                            orderObj.dob = line.split("DOB:")[1].trim();
                        } else if (line.startsWith("Email:")) {
                            orderObj.user_email = line.split("Email:")[1].trim();
                        } else if (line.startsWith("Medical Card:")) {
                            const medicalCardInfo = line.split("Medical Card:")[1].trim();
                            if (medicalCardInfo) {
                                orderObj.medical = true;
                                orderObj.medical_patient_card = medicalCardInfo.split('-')[0].trim(); // Take only the first part before hyphen
                            }
                        } else if (line.startsWith("Onfleet Task ID:")) {
                            orderObj.onfleet_task_id = line.split("Onfleet Task ID:")[1].split("created at")[0].trim();
                            orderObj.time = line.split("created at")[1].trim();
                        } else if (line.startsWith("View order:")) {
                            orderObj.view_order = line.split("View order:")[1].trim();
                        } else if (line.startsWith("Order Number:")) {
                            orderObj.order_number = line.split("Order Number:")[1].trim();
                        } else if (line.startsWith("Products:")) {
                            let i = lines.indexOf(line) + 1;
                            while (lines[i] !== "" && !lines[i].startsWith("productSubtotal")) {
                                const productObj = {
                                    product: lines[i++],
                                    option: lines[i++].split("Option:")[1].trim(),
                                    quantity: parseInt(lines[i++].split("Quantity:")[1].trim()),
                                    brand: lines[i++].split("Brand:")[1].trim(),
                                    price: parseFloat(lines[i++].split("Price:")[1].trim())
                                };
                                orderObj.products.push(productObj);
                                i++; // Skip "-----------"
                            }
                        } else if (line.startsWith("productSubtotal:")) {
                            orderObj.subtotal = parseFloat(line.split("productSubtotal:")[1].replace("$", "").trim());
                        } else if (line.startsWith("deliveryFee:")) {
                            orderObj.delivery_fee = parseFloat(line.split("deliveryFee:")[1].replace("$", "").trim());
                        } else if (line.startsWith("total:")) {
                            orderObj.total = parseFloat(line.split("total:")[1].replace("$", "").trim());
                        }
                    }

                    return orderObj;
                }

                // Example usage
                const orderInfo = parseOrderString(data.Notes);

                dataObj.NOTES = data.Notes
                dataObj.customers_dob = orderInfo.dob
                dataObj.onfleet_task_id = orderInfo.onfleet_task_id
                dataObj.created_at = new Date(parseInt(orderInfo.time))
                dataObj.order_number = orderInfo.order_number
                dataObj.order_detail = orderInfo.products
                dataObj.subtotal = orderInfo.subtotal
                dataObj.order_total = orderInfo.total
                dataObj.drivers_license = orderInfo.drivers_license
                dataObj.medical_patient = orderInfo.medical
                dataObj.customer_email = orderInfo.user_email
                dataObj.medical_patient_card = orderInfo.medical_patient_card
                // dataObj.med_card_expiration_date = orderInfo.exp
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


                //new Date(parseInt(inputString.match(timePattern)[1])).toISOString();
                dataObj.created_at = new Date(extractedData1.time_stamp)
                dataObj.order_number = parseInt(extractedData1.order_id)
                dataObj.order_total = extractedData1.total
                dataObj.onfleet_task_id = extractedData1.task_id
                dataObj.pos_system_used = "Leafly"
            }

            //END LEAFLY ORDERS---------------------------------
            //START Transaction ID --- NOT SURE THE POS
            if (data.Notes.includes("Transaction ID")) {
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

                    const taskIDPattern = /Onfleet Task ID:\s+([^\n]+)/;
                    const taskIDMatch = data.Notes.match(taskIDPattern);

                    if (taskIDMatch) {
                        dataObj.onfleet_task_id = taskIDMatch[1].replace(/ created at \d+/, '').trim();
                        const timeStampPattern = /created at (\d+)/;
                        dataObj.created_at = new Date(parseInt(data.Notes.match(timeStampPattern)[1]));
                    }


                    const orderIDPattern = /Transaction ID:\s+(\d+)/;
                    data.Notes.match(orderIDPattern)[1].trim() ? dataObj.order_number = parseInt(data.Notes.match(orderIDPattern)[1].trim()) : ""

                    return { productInfo, subTotal, total };
                }

                const { productInfo, subTotal, total } = extractProductInfo(data.Notes);
                dataObj.pos_system_used = "not sure1"
                dataObj.order_detail = productInfo
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

                //----
                const taskIDPattern = /Onfleet Task ID:\s+([^\n]+)/;
                const taskIDMatch = data.Notes.match(taskIDPattern);

                if (taskIDMatch) {
                    dataObj.onfleet_task_id = taskIDMatch[1].replace(/ created at \d+/, '').trim();
                    const timeStampPattern = /created at (\d+)/;
                    dataObj.created_at = new Date(parseInt(data.Notes.match(timeStampPattern)[1]));
                }


                const orderIDPattern = /Order #:\s+(\d+)/;
                data.Notes.match(orderIDPattern)[1].trim() ? dataObj.order_number = parseInt(data.Notes.match(orderIDPattern)[1].trim()) : ""

                //----

                dataObj.pos_system_used = "not sure2"
                dataObj.order_detail = productInfo1
                dataObj.order_total = total1
            }
            // JANE START -------------------------------------------------------------------
            if (data.Notes.includes("Jane Customer")) {
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

                //----
                const taskIDPattern = /Onfleet Task ID:\s+([^\n]+)/;
                const taskIDMatch = data.Notes.match(taskIDPattern);

                if (taskIDMatch) {
                    dataObj.onfleet_task_id = taskIDMatch[1].replace(/ created at \d+/, '').trim();
                    const timeStampPattern = /created at (\d+)/;
                    dataObj.created_at = new Date(parseInt(data.Notes.match(timeStampPattern)[1]));
                }


                // const orderIDPattern = /Order\s\w+/;
                // dataObj.order_id = data.Notes.match(orderIDPattern)[1].trim()?dataObj.order_number = parseInt(data.Notes.match(orderIDPattern)[1].trim()):""
                function extractOrderNumber(str) {
                    const match = str.match(/Order\s(\w+)/);
                    return match ? match[1] : null;
                }

                dataObj.order_number = extractOrderNumber(data.Notes);
                //----


                // Extract product information and order total
                const { orderTotal, productInfo } = extractProductInfo(data.Notes);

                dataObj.pos_system_used = "Jane"
                dataObj.order_total = orderTotal
                dataObj.order_detail = productInfo

            }
            // JANE END -------------------------------------------------------------------


            if (dataObj.order_total > 15) {
                // console.log(dataObj.order_detail)
                results.push(dataObj)
                const options = { upsert: true, new: true, setDefaultsOnInsert: true };
                let customer = {}
                let order = {}
                let product_detail = {}

                if (!dataObj.mobile) {
                    customer.mobile = undefined
                } else {
                    customer.mobile = dataObj.mobile
                }

                customer.full_name = dataObj.full_name
                // customer.mobile = dataObj.mobile
                customer.email = dataObj.email
                customer.address1 = dataObj.address1
                customer.city = dataObj.city
                customer.state = dataObj.state
                customer.zip = dataObj.zip
                customer.dob = dataObj.dob
                customer.medical_patient = dataObj.medical_patient
                customer.medical_patient_card = dataObj.medical_patient_card


                //------------------------------------------WORKING BElOW               
                try {
                    const newCustomer = new Customer(customer);
                    if (newCustomer) {
                        await newCustomer.save();
                    } else {

                        throw new Error('duplicate');
                    }
                } catch (error) {
                    console.log(error)
                }

                //------------------------------------------WORKING ABOVE
                console.log("================================")
                console.log(dataObj.order_detail)
                console.log(dataObj.order_detail?.length)
                console.log("================================")

                order.order_number = dataObj.order_number
                order.onfleet_task_id = dataObj.onfleet_task_id
                order.mobile = dataObj.mobile
                order.created_at = dataObj.created_at
                order.subtotal = dataObj.subtotal
                order.order_total = dataObj.order_total
                order.view_order_url = dataObj.view_order_url
                order.order_detail = dataObj.order_detail
                order.total_items_on_order = dataObj.order_detail?.length
                order.pos_system_used = dataObj.pos_system_used
                order.NOTES = dataObj.NOTES

                //------------------------------------------WORKING BElOW
                try {
                    const newOrder = new Order(order);
                    if (newOrder) {
                        await newOrder.save();
                    } else {
                        throw new Error('duplicate');
                    }
                } catch (error) {
                    console.log(error)
                }

                //------------------------------------------WORKING ABOVE
                if (dataObj.order_detail) {
                    for (let i = 0; i < dataObj.order_detail.length; i++) {

                        product_detail.product = dataObj.order_detail[i].product
                        product_detail.option = dataObj.order_detail[i].option
                        product_detail.quantity = dataObj.order_detail[i].quantity
                        product_detail.price = dataObj.order_detail[i].price
                        product_detail.brand = dataObj.order_detail[i].brand
                        product_detail.sku = dataObj.order_detail[i].sku
                        product_detail.type = dataObj.order_detail[i].type
                        //------------------------------------------WORKING BElOW
                        try {
                            const newProduct = new Product(product_detail);
                            if (newProduct) {
                                await newProduct.save();
                            } else {
                                throw new Error('duplicate');
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    //------------------------------------------WORKING ABOVE
                }

            }

        })
        .on('end', () => {
            //res.send("CHECK DATABASE ")
            res.json(results)
        });
});

app.get('/update/:month', (req, res) => {
    fs.createReadStream(`./on_fleet_${req.params.month}.csv`)
        .pipe(csv())
        .on('data', async (data) => {

            const startDate = new Date(data.startTime);
            const completionDate = new Date(data.completionTime);

            // Subtract to get the difference in milliseconds
            const elapsedMilliseconds = completionDate - startDate;

            // Convert milliseconds to seconds, minutes, and hours
            const elapsedSeconds = elapsedMilliseconds / 1000;
            const elapsedMinutes = elapsedSeconds / 60;
            const elapsedHours = elapsedMinutes / 60;


            if(elapsedMinutes>7){
            Order.findOneAndUpdate({ onfleet_task_id: data.shortId }, {$set:{"minutes_to_complete": Math.round(elapsedMinutes * 1000) / 1000}},{ new: true, runValidators: true } )
            .then((dbNote) => {
                // if (!dbNote) {
                //     res.json({ message: 'No note found with this id!' });
                //     return;
                // }
                // res.json(dbNote);
                console.log("worked")
            })
            .catch((err) => {
                res.json(err);
            });
            }
            
        })
        .on('end', () => {
            res.send("CHECK DATABASE ")
            //res.json(results)
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
