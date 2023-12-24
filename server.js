const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 3001;
const fs = require('fs')
// var parse = require('csv-parse')
const csv = require('csv-parser')
const fastcsv = require('fast-csv');
const dispensariesList = require('./utils/dispensary_locations.js');
const dispensariesLibrary = require('./utils/dispensary_library.js');
const { Customer, Order, Product, Pickup } = require('./models');
const Onfleet = require("@onfleet/node-onfleet")

var count123 = 0

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
let db;
const database = require('./utils/db_queries.js')

// await Post.deleteMany({});
// await Tags.deleteMany({});

//un: gendelryan
//pw: 6NlDYpx8QPujyaZQ
const resetDatabase = async () => {
    // await mongoose.connection.dropDatabase();
    await Order.deleteMany({});
    await Product.deleteMany({});
    await Pickup.deleteMany({});
    await Customer.deleteMany({});
    console.log('Database reset');
};

// Connect to MongoDB
mongoose.connect(
    //process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prescotty',
    'mongodb://127.0.0.1:27017/prescotty',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
)

    //PW1: geGnib-cobbu0-nevmap
    //UN: ryangendel

    //PW:4ko9PWpSQ3CUpj0P <= for the MONGO_URI
    .then(() => {
        console.log('Connected successfully to MongoDB');
        //resetDatabase()
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
// resetDatabase()

var total_orders_dutchie = 0
app.get('/all/:month', (req, res) => {
    //fs.createReadStream(`onfleet_example_data.csv`)
    fs.createReadStream(`./on_fleet_${req.params.month}.csv`)
        .pipe(csv())
        .on('data', async (data) => {

            function getDayOfWeekFromMTDateString(dateString) {
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                // Create a new Date object using the given date string
                const date = new Date(dateString);

                // Get the day of the week using the local time (since it's already in MT)
                const dayNumber = date.getDay();

                return days[dayNumber];
            }
            // Example usage:
            const timestamp = data.creationTime; // This gets the current timestamp
            const day_of_the_week = getDayOfWeekFromMTDateString(timestamp);

            const dataObj = {}

            // Example usage:

            dataObj.onfleet_task_id = data.shortId
            dataObj.delivery_driver = data.workerName
            dataObj.creation_time = data.creationTime
            dataObj.delivery_start_time = data.startTime
            dataObj.day_of_the_week = day_of_the_week
            dataObj.dependant_task = data.dependencies

            if (data.taskType === "dropoff") {
                if (!data.taskDetails.includes("recon") || !data.taskDetails.includes("recon")) {
                    if (data.distance > .5) {
                        count123 = count123 + 1
                        dataObj.destination_address = data.destinationAddress
                        dataObj.client_name = data.recipientsNames
                        dataObj.client_phone_number = data.recipientsNumbers
                        dataObj.delivery_distance = data.distance
                        dataObj.task_details = data.taskDetails

                        if (data.recipientNotes.includes("Exp")) {
                            dataObj.task_notes = data.recipientNotes
                            dataObj.medical_patient = true
                        }
                        dataObj.signature_picture = data.signatureUrl
                        dataObj.client_picture = data.photoUrl
                        dataObj.driver_departure_time = data.departureTime
                        dataObj.driver_arrival_time = data.arrivalTime

                        //=====
                        if (data.taskDetails.includes("dhcie")) {
                            total_orders_dutchie = total_orders_dutchie + 1
                            const str = data.taskDetails
                            dataObj.pos_system = "dutchie"
                            const orderUrl = str.match(/https:\/\/[^\s]+/)[0];
                            const transaction_id = str.match(/Order Number: (\d+)/)[1];
                            const productsString = str.split('Products:\n')[1].split('\nproductSubtotal:')[0];
                            const products = productsString.split('-----------\n')
                                .map(p => {
                                    const lines = p.trim().split('\n');
                                    if (lines.length > 1) {
                                        return {
                                            product_name: lines[0],
                                            option: lines[1] ? lines[1].split(': ')[1] : null,
                                            quantity: lines[2] ? lines[2].split(': ')[1] : null,
                                            brand: lines[3] ? lines[3].split(': ')[1] : null,
                                            price: lines[4] ? parseFloat(lines[4].split(': ')[1]) : null
                                        };
                                    }
                                    return null;
                                })
                                .filter(p => p !== null); // Filter out null values

                            const subtotal = parseFloat(str.match(/productSubtotal: \$(\d+\.\d+)/)[1]);
                            if (parseFloat(str.match(/discount: \$(\d+\.\d+)/))) {
                                var discount = parseFloat(str.match(/discount: \$(\d+\.\d+)/)[1]);
                            }
                            const total = parseFloat(str.match(/total: \$(\d+\.\d+)/)[1]);

                            dataObj.order_url = orderUrl
                            dataObj.transaction_id = transaction_id
                            dataObj.products = products
                            dataObj.subtotal = subtotal
                            dataObj.discount = discount
                            dataObj.order_total = total
                            var total_orders = 0
                            console.log(products.length)
                            for (let i = 0; i < products.length; i++) {
                                if (products[i].quantity !== "No match found") {
                                    var integer = parseInt(products[i].quantity)
                                    total_orders = integer + total_orders
                                }
                            }
                            dataObj.quantity_of_items_in_order = total_orders

                            database.dutchie(dataObj)
                        }

                        if (data.taskDetails.includes("Leafly")) {
                            const str = data.taskDetails
                            dataObj.pos_system = "leafly"
                            // Extract order ID and order total
                            var orderId = ""
                            if (str.match(/Leafly Order ID: (\d+)/)) {
                                orderId = str.match(/Leafly Order ID: (\d+)/)[1]
                            };

                            var orderTotal = ""

                            if (str.match(/Order Total \(tax incl.\): (\d+\.\d+)/)) {
                                orderTotal = parseFloat(str.match(/Order Total \(tax incl.\): (\d+\.\d+)/)[1]);
                            }


                            // Extract item summary and split into lines
                            var itemSummaryStr = ""
                            if (str.split('Item Summary:\n')) {
                                if (str.split('Item Summary:\n')[1]) {
                                    itemSummaryStr = str.split('Item Summary:\n')[1].trim();
                                }
                            }

                            const itemsLines = itemSummaryStr.split('\n');

                            const items = itemsLines.map(line => {
                                let option = null, quantity = null, productName = null;

                                // Check for option and quantity in the line
                                const optionMatch = line.match(/(\d+(\.\d+)?)(g|mg|MG)/);
                                const quantityMatch = line.match(/(\d+) x /);

                                if (optionMatch) {
                                    option = optionMatch[0];
                                    line = line.replace(optionMatch[0], '').trim(); // remove option from line
                                }

                                if (quantityMatch) {
                                    quantity = quantityMatch[1];
                                    line = line.replace(quantityMatch[0], '').trim(); // remove quantity from line
                                }

                                // Remaining text is product name
                                productName = line;

                                const item = {
                                    product_name: productName.toLowerCase()
                                };
                                if (option) item.option = option;
                                if (quantity) item.quantity = parseInt(quantity);

                                return item;
                            });

                            const result = {
                                transaction_id: orderId,
                                total: orderTotal,
                                items: items
                            };

                            dataObj.transaction_id = orderId
                            dataObj.products = items
                            dataObj.order_total = orderTotal

                            var total_orders = 0
                            for (let i = 0; i < items.length; i++) {

                                var integer = parseInt(items[i].quantity)
                                total_orders = integer + total_orders

                            }
                            dataObj.quantity_of_items_in_order = total_orders
                            database.leafly(dataObj)
                        }

                        if (data.taskDetails.includes("Transaction ID:")) {
                            dataObj.pos_system = "unknown1"
                            const parseOrder = (order) => {
                                const lines = order.split('\n');
                                const transaction_id = lines[0].match(/Transaction ID: (\d+)/)[1];

                                const products = [];
                                for (let i = 1; i < lines.length - 2; i++) {
                                    const productLine = lines[i];
                                    const quantityMatch = productLine.match(/^(\d+\.?\d*) x /);
                                    const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : null;

                                    let rest = productLine.replace(/^(\d+\.?\d*) x /, '');
                                    const skuMatch = rest.match(/\| (\d+)$/);
                                    const sku = skuMatch ? skuMatch[1] : null;
                                    rest = rest.replace(/\| \d+$/, '');

                                    // Updated regular expression to handle "gs" as well
                                    let option = rest.match(/ (\d+(\.\d+)?[mg|g|gs|MG|G|GS]) /i);
                                    option = option ? option[0].trim() : null;
                                    rest = rest.replace(/ \d+(\.\d+)?[mg|g|gs|MG|G|GS] /i, '');

                                    products.push({
                                        quantity,
                                        product_name: rest.trim(),
                                        option,
                                        sku
                                    });
                                }

                                var sub_total = 0

                                let result1 = lines[lines.length - 2].match(/Sub-Total: \$([\d,]+(\.\d{2})?)/);

                                if (result1 !== null && result1[1]) {
                                    sub_total = parseFloat(result1[1].replace(',', ''));
                                } else {
                                    console.log('No match found');
                                }

                                // var total = parseFloat(lines[lines.length - 1].match(/Total: \$([\d,]+(\.\d{2})?)/)[1].replace(',', ''));
                                var total = 0

                                let result = lines[lines.length - 1].match(/Total: \$([\d,]+(\.\d{2})?)/);

                                if (result !== null && result[1]) {
                                    total = parseFloat(result[1].replace(',', ''));
                                } else {
                                    console.log('No match found');
                                }

                                return {
                                    transaction_id,
                                    sub_total,
                                    total,
                                    products: products.map(product => ({
                                        ...product,
                                        product_name: product.product_name.replace(/\|.*$/, '').trim()
                                    }))
                                };

                            };

                            //==================
                            var orderEverything = parseOrder(data.taskDetails);

                            dataObj.transaction_id = orderEverything.transaction_id
                            dataObj.products = orderEverything.products
                            dataObj.order_total = orderEverything.total
                            dataObj.subtotal = orderEverything.sub_total

                            var total_orders = 0
                            for (let i = 0; i < orderEverything.products.length; i++) {
                                total_orders = orderEverything.products[i].quantity + total_orders
                            }
                            dataObj.quantity_of_items_in_order = total_orders


                            database.unknown1(dataObj)
                        }

                        if (data.taskDetails.includes("-------------------")) {
                            dataObj.pos_system = "unknown2"
                            function processInvoice(invoice) {
                                const lines = invoice.split('\n');

                                // Extracting transaction_id
                                const orderLine = lines.find(line => line.includes('Order #:'));
                                const transaction_id = orderLine ? orderLine.split('Order #:')[1].trim() : null;

                                // Extracting total
                                const totalLine = lines.find(line => line.includes('Total:'));
                                const total = totalLine ? parseFloat(totalLine.split('$')[1].trim()) : null;

                                // Extracting products
                                const productsStart = lines.indexOf('Order Details') + 3;
                                const productsEnd = totalLine ? lines.indexOf(totalLine) : lines.length;
                                const productLines = lines.slice(productsStart, productsEnd);
                                const products = productLines.map(line => {
                                    const [quantity, rest] = line.split(' x ');
                                    let productName = rest ? rest.trim() : null;
                                    const optionMatch = productName ? productName.match(/\d+(\.\d+)?(g|mg)/i) : null; // added 'i' flag here
                                    let option = optionMatch ? optionMatch[0] : null;
                                    if (option) {
                                        productName = productName.replace(option, '').trim();
                                    }
                                    return {
                                        quantity: parseFloat(quantity),
                                        product_name: productName,
                                        option: option
                                    };
                                });

                                return {
                                    transaction_id,
                                    total,
                                    products
                                };
                            }

                            const result1 = processInvoice(data.taskDetails);

                            if (!result1.products[result1.products.length - 1].quantity) {
                                result1.products.pop();
                            }

                            // console.log(result1);


                            dataObj.transaction_id = result1.transaction_id
                            dataObj.products = result1.products
                            dataObj.order_total = result1.total
                            var total_orders = 0
                            for (let i = 0; i < result1.products.length; i++) {
                                total_orders = result1.products[i].quantity + total_orders
                            }
                            dataObj.quantity_of_items_in_order = total_orders

                            database.unknown2(dataObj)
                        }
                    }
                }
            }//END IF "dropoff"

            if (data.taskType === "pickup") {
                if (data.didSucceed === "TRUE") {
                   
                    dataObj.signature_text = data.signatureText
                    dataObj.signature_url = data.signatureUrl
                    dataObj.photo_url = data.signatureUrl
                    dataObj.onfleet_task_id = data.shortId
                    dataObj.creation_time = data.creationTime
                    dataObj.completion_time = data.completionTime

                    function extractOrderId(order) {
                        const orderNumberRegex = /(?:Order Number:|Transaction ID:|Leafly Order ID:|Order #:)\s*(\d+)/;
                        const match = order.match(orderNumberRegex);
                        if (match) {
                            return match[1]; // return ID
                        } else {
                            return null;
                        }
                    }

                    const orderId = extractOrderId(data.taskDetails);
                    dataObj.order_id = orderId


                    //-------------TOTAL TIME TO COMPLETE
                    const creationTime = data.creationTime;
                    const completionTime = data.completionTime;

                    // Convert the timestamp strings to Date objects
                    const creationDate = new Date(creationTime);
                    const completionDate = new Date(completionTime);

                    // Find the difference in milliseconds
                    const differenceMs = completionDate - creationDate;

                    // Convert the difference to minutes
                    const differenceMinutes = differenceMs / (1000 * 60);
                    dataObj.time_to_complete = Math.round(differenceMinutes * 100) / 100;
                    //-------------END
                    //======================
                    function extractNumber(address) {
                        var regex = /\b\d{3,5}\b/;
                        var match = address.match(regex);
                        return match ? match[0] : null;
                    }

                    var number = extractNumber(data.destinationAddress);
                    //=====================
                    for (let key in dispensariesLibrary) {
                        if (dispensariesLibrary[key].includes(`${number}`)) {
                            dataObj.pickup_dispensary = key.split("_")[0]
                            dataObj.pickup_dispensary_location = key.split("_")[1]
                            dataObj.pickup_dispensary_with_location = key.split("_")[0] + " " + key.split("_")[1]
                        }
                    }

                    //EXTRACTING TRANSACTION TOTALS
                    if (data.taskDetails.includes("dhcie")) {
                        const str = data.taskDetails
                        dataObj.pos_system = "dutchie"
                        var total_orders = 0
                        const productsString = str.split('Products:\n')[1].split('\nproductSubtotal:')[0];
                        const products = productsString.split('-----------\n')
                            .map(p => {
                                const lines = p.trim().split('\n');
                                if (lines.length > 1) {
                                    return {
                                        product_name: lines[0],
                                        option: lines[1] ? lines[1].split(': ')[1] : null,
                                        quantity: lines[2] ? lines[2].split(': ')[1] : null,
                                        brand: lines[3] ? lines[3].split(': ')[1] : null,
                                        price: lines[4] ? parseFloat(lines[4].split(': ')[1]) : null
                                    };
                                }
                                return null;
                            })
                            .filter(p => p !== null); // Filter out null values

                        var subtotal = 0

                        if (parseFloat(str.match(/productSubtotal: \$(\d+\.\d+)/)[1])) {
                            subtotal = parseFloat(str.match(/productSubtotal: \$(\d+\.\d+)/)[1])
                        }

                        var total = 0

                        if (parseFloat(str.match(/total: \$(\d+\.\d+)/)[1])) {
                            total = parseFloat(str.match(/total: \$(\d+\.\d+)/)[1]);
                        }

                        dataObj.subtotal = subtotal
                        dataObj.order_total = total


                        for (let i = 0; i < products.length; i++) {
                            if (products[i].quantity !== "No match found") {
                                var integer = parseInt(products[i].quantity)
                                total_orders = integer + total_orders
                            }
                        }
                        dataObj.quantity_of_items_in_order = total_orders
                    }
                    //=========DUTCHIE ABOVE
                    if (data.taskDetails.includes("Leafly")) {
                        const str = data.taskDetails
                        dataObj.pos_system = "leafly"
                        // Extract order ID and order total

                        var orderTotal = ""

                        if (str.match(/Order Total \(tax incl.\): (\d+\.\d+)/)) {
                            orderTotal = parseFloat(str.match(/Order Total \(tax incl.\): (\d+\.\d+)/)[1]);
                        }


                        // Extract item summary and split into lines
                        var itemSummaryStr = ""
                        if (str.split('Item Summary:\n')) {
                            if (str.split('Item Summary:\n')[1]) {
                                itemSummaryStr = str.split('Item Summary:\n')[1].trim();
                            }
                        }

                        const itemsLines = itemSummaryStr.split('\n');

                        const items = itemsLines.map(line => {
                            let option = null, quantity = null, productName = null;

                            // Check for option and quantity in the line
                            const optionMatch = line.match(/(\d+(\.\d+)?)(g|mg|MG)/);
                            const quantityMatch = line.match(/(\d+) x /);

                            if (optionMatch) {
                                option = optionMatch[0];
                                line = line.replace(optionMatch[0], '').trim(); // remove option from line
                            }

                            if (quantityMatch) {
                                quantity = quantityMatch[1];
                                line = line.replace(quantityMatch[0], '').trim(); // remove quantity from line
                            }

                            // Remaining text is product name
                            productName = line;

                            const item = {
                                product_name: productName.toLowerCase()
                            };
                            if (option) item.option = option;
                            if (quantity) item.quantity = parseInt(quantity);

                            return item;
                        });

                        const result = {
                            transaction_id: orderId,
                            total: orderTotal,
                            items: items
                        };

                        dataObj.order_total = orderTotal

                        var total_orders = 0
                        for (let i = 0; i < items.length; i++) {
                            var integer = parseInt(items[i].quantity)
                            total_orders = integer + total_orders

                        }
                        dataObj.quantity_of_items_in_order = total_orders
                    }

                    //===============================
                    if (data.taskDetails.includes("Transaction ID:")) {
                        dataObj.pos_system = "unknown1"
                        const parseOrder = (order) => {
                            const lines = order.split('\n');

                            const products = [];
                            for (let i = 1; i < lines.length - 2; i++) {
                                const productLine = lines[i];
                                const quantityMatch = productLine.match(/^(\d+\.?\d*) x /);
                                const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : null;

                                let rest = productLine.replace(/^(\d+\.?\d*) x /, '');
                                const skuMatch = rest.match(/\| (\d+)$/);
                                const sku = skuMatch ? skuMatch[1] : null;
                                rest = rest.replace(/\| \d+$/, '');

                                // Updated regular expression to handle "gs" as well
                                let option = rest.match(/ (\d+(\.\d+)?[mg|g|gs|MG|G|GS]) /i);
                                option = option ? option[0].trim() : null;
                                rest = rest.replace(/ \d+(\.\d+)?[mg|g|gs|MG|G|GS] /i, '');

                                products.push({
                                    quantity,
                                    product_name: rest.trim(),
                                    option,
                                    sku
                                });
                            }

                            var sub_total = 0

                            let result1 = lines[lines.length - 2].match(/Sub-Total: \$([\d,]+(\.\d{2})?)/);

                            if (result1 !== null && result1[1]) {
                                sub_total = parseFloat(result1[1].replace(',', ''));
                            } else {
                                console.log('No match found');
                            }

                            // var total = parseFloat(lines[lines.length - 1].match(/Total: \$([\d,]+(\.\d{2})?)/)[1].replace(',', ''));
                            var total = 0

                            let result = lines[lines.length - 1].match(/Total: \$([\d,]+(\.\d{2})?)/);

                            if (result !== null && result[1]) {
                                total = parseFloat(result[1].replace(',', ''));
                            } else {
                                console.log('No match found');
                            }

                            return {
                                sub_total,
                                total,
                                products: products.map(product => ({
                                    ...product,
                                    product_name: product.product_name.replace(/\|.*$/, '').trim()
                                }))
                            };

                        };

                        //==================
                        var orderEverything = parseOrder(data.taskDetails);

                        dataObj.order_total = orderEverything.total
                        dataObj.subtotal = orderEverything.sub_total

                        var total_orders = 0
                        for (let i = 0; i < orderEverything.products.length; i++) {
                            total_orders = orderEverything.products[i].quantity + total_orders
                        }
                        dataObj.quantity_of_items_in_order = total_orders
                    }
                    //================================
                    if (data.taskDetails.includes("-------------------")) {
                        dataObj.pos_system = "unknown2"
                        function processInvoice(invoice) {
                            const lines = invoice.split('\n');

                            // Extracting transaction_id
                            const orderLine = lines.find(line => line.includes('Order #:'));
                            const transaction_id = orderLine ? orderLine.split('Order #:')[1].trim() : null;

                            // Extracting total
                            const totalLine = lines.find(line => line.includes('Total:'));
                            const total = totalLine ? parseFloat(totalLine.split('$')[1].trim()) : null;

                            // Extracting products
                            const productsStart = lines.indexOf('Order Details') + 3;
                            const productsEnd = totalLine ? lines.indexOf(totalLine) : lines.length;
                            const productLines = lines.slice(productsStart, productsEnd);
                            const products = productLines.map(line => {
                                const [quantity, rest] = line.split(' x ');
                                let productName = rest ? rest.trim() : null;
                                const optionMatch = productName ? productName.match(/\d+(\.\d+)?(g|mg)/i) : null; // added 'i' flag here
                                let option = optionMatch ? optionMatch[0] : null;
                                if (option) {
                                    productName = productName.replace(option, '').trim();
                                }
                                return {
                                    quantity: parseFloat(quantity),
                                    product_name: productName,
                                    option: option
                                };
                            });

                            return {
                                transaction_id,
                                total,
                                products
                            };
                        }

                        const result1 = processInvoice(data.taskDetails);

                        if (!result1.products[result1.products.length - 1].quantity) {
                            result1.products.pop();
                        }

                        // console.log(result1);


                        dataObj.order_total = result1.total
                        var total_orders = 0
                        for (let i = 0; i < result1.products.length; i++) {
                            total_orders = result1.products[i].quantity + total_orders
                        }
                        dataObj.quantity_of_items_in_order = total_orders

                    }

                    //EXTRACTING TRANSACTION TOTALS
                    dataObj.driver = data.workerName
                    database.pickupOrder(dataObj)
                }
            }


        })
        .on('end', () => {

            //res.send("CHECK DATABASE ")
            res.send(`count ${count123}`)
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


            if (elapsedMinutes > 7) {
                Order.findOneAndUpdate({ onfleet_task_id: data.shortId }, { $set: { "minutes_to_complete": Math.round(elapsedMinutes * 1000) / 1000 } }, { new: true, runValidators: true })
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
            res.send(`${req.params.month} was added!`)
            //res.json(results)
        });
});

app.get('/averageordervalue', async (req, res) => {
    var average

    const pipeline = [
        { $match: { order_total: { $ne: null } } },
        { $group: { _id: null, average_order_total: { $avg: '$order_total' } } }
    ];

    await Order.aggregate(pipeline)
        .then(result => {

            if (result.length > 0) {
                average = result[0].order_total;
                console.log(`The average Order total is: ${average}`);
            } else {
                console.log('No documents matched the query.');
            }
        })
        .catch(err => {
            console.error('An error occurred:', err);
        });

    res.send(`The average order total is ${average} dollars`)
});

app.get('/averageminutesperorder', async (req, res) => {
    var average
    const pipeline = [
        { $match: { minutes_to_complete: { $ne: null } } },
        { $group: { _id: null, average_minutes: { $avg: '$minutes_to_complete' } } }
    ];

    await Order.aggregate(pipeline)
        .then(result => {

            if (result.length > 0) {
                average = result[0].average_minutes;
                console.log(`The average minutes to complete tasks are: ${average}`);
            } else {
                console.log('No documents matched the query.');
            }
        })
        .catch(err => {
            console.error('An error occurred:', err);
        });

    res.send(`The average time per delivery is ${average} minutes`)
});

app.get('/averagedistanceperorder/:months', async (req, res) => {
    fs.createReadStream(`./on_fleet_${req.params.months}.csv`)
        .pipe(csv())
        .on('data', async (data) => {

            if (data.taskType == "dropoff") {

                Order.findOneAndUpdate({ onfleet_task_id: data.shortId }, { $set: { "distance_for_delivery": data.distance } }, { new: true, runValidators: true })
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



    res.send(`The average time per delivery is minutes`)
});

app.get('/averagedistanceperorder', async (req, res) => {
    var average
    const pipeline = [
        { $match: { distance_for_delivery: { $ne: null } } },
        { $group: { _id: null, average_distance: { $avg: '$distance_for_delivery' } } }
    ];

    await Order.aggregate(pipeline)
        .then(result => {

            if (result.length > 0) {
                average = result[0].average_distance;
                console.log(`The average minutes to complete tasks are: ${average}`);
            } else {
                console.log('No documents matched the query.');
            }
        })
        .catch(err => {
            console.error('An error occurred:', err);
        });

    res.send(`The average distance for each delivery is ${average} miles `)
});

app.get('/getcustomerinfo', async (req, res) => {
// CSV file output path
const outputPath = 'customer_info.csv';

async function exportToCsv() {
    try {
        // Select only 'client_name' and 'client_phone_number' fields
        const docs = await Customer.find({}, { client_name: 1, client_phone_number: 1, _id: 0 }).lean();
        const writeStream = fs.createWriteStream(outputPath);
        const csvStream = fastcsv.format({ headers: true });

        csvStream.pipe(writeStream);
        docs.forEach(doc => csvStream.write(doc));
        csvStream.end();

        writeStream.on('finish', () => {
            console.log(`Successfully exported data to ${outputPath}`);
        });
    } catch (err) {
        console.error('Error during export:', err);
    }
}

exportToCsv();
res.send("done")
})

app.get('/testingroute', async (req, res) => {
    const onfleetApi = new Onfleet("433273baf931427ef6b294a5d14af7d4");
    console.log(await onfleetApi.verifyKey())
    res.send("tested")
})

app.post('/testingroute/api/createtask', async (req, res) => {
    console.log("=================================================================IN POST")
    var info = await JSON.stringify(req)
    console.log(info)
    console.log("=================================================================")
    res.status(200).send(req.query.check)
})

app.get('/testingroute/webhook/createtask', async (req, res) => {
    console.log("=================================================================")
    var info = await JSON.stringify(req)
    console.log(info)
    console.log("=================================================================")
    res.status(200).send(req.query.check)
})

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});
