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
                dataObj.pos_system_used = "Dutchie"
                const taskId = data.Notes.match(taskIdRegex);
                if (taskId && taskId[1]) {
                    dataObj.task_id = taskId[1];
                }
                const createdAtRegex = /created at (\d+)/;
                const order_time = data.Notes.match(createdAtRegex);
                if (order_time && order_time[1]) {
                    const createdAtTime = new Date(parseInt(order_time[1]));
                    dataObj.order_date = createdAtTime;
                }
                const viewOrderRegex = /View order: (https:\/\/[^\s]+)/;
                const viewOrder = data.Notes.match(viewOrderRegex);
                if (viewOrder && viewOrder[1]) {
                    const viewOrderLink = viewOrder[1];
                    dataObj.view_order = viewOrderLink;
                }

                const orderNumberRegex = /Order Number: (\d+)/;
                const OrderNumber = data.Notes.match(orderNumberRegex);
                if (OrderNumber && OrderNumber[1]) {
                    const orderNumber = OrderNumber[1];
                    dataObj.order_number = orderNumber;
                }
                const productRegex = /([A-Za-z\s]+)\nOption: [^\n]+\nQuantity: \d+\nBrand: [^\n]+\nPrice: \d+/g;
                const ProductName = data.Notes.match(productRegex);

                if (ProductName) {
                    const productNames = ProductName.map(match => match.trim());
                    dataObj.product_info = productNames
                }

                const costRegex = /(\w+): (\$[\d.]+)/g;

                const matches = data.Notes.matchAll(costRegex);

                for (const match of matches) {
                    const key = match[1];
                    const value = match[2];
                    dataObj[key] = value;
                }

                var orders = dataObj.product_info
                //r65253f%@reafqertr43ret235f4/#QR#$R$#F#$F#qcfewqrfeqw
                if (orders?.length) {
                    var extractedItems = [];
                    orders.forEach(entry => {
                        const lines = entry.split('\n');
                        const [productNameLine, optionLine, quantityLine, brandLine, priceLine] = lines;
                        const productName = productNameLine.split('\n')[0];
                        const option = optionLine.split(": ")[1];
                        const quantity = quantityLine.split(": ")[1];
                        const brand = brandLine.split(": ")[1];
                        const price = priceLine.split(": ")[1];

                        extractedItems.push({
                            product_name: productName,
                            option,
                            quantity: parseInt(quantity),
                            brand,
                            price: parseFloat(price)
                        });
                    });
                }
                dataObj.pos_system_used = "Dutchie"
                dataObj.purchase_details = extractedItems
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
                function extractInfo(line) {
                    const regex = /([\d.]+) x (.+?) ([\d.]+(?: Gram|g)) .+?\| (\d+)/;
                    const match = line.match(regex);
                    if (match) {
                        const quantity = parseFloat(match[1]);
                        const product = match[2];
                        const option = match[3];
                        const sku = parseInt(match[4]);
                        return { quantity, product, option, sku };
                    }
                    return null;
                }

                // Function to extract Total and Sub-Total
                function extractTotals(lines) {
                    // console.log("llllllllllllllllll")
                    // console.log(lines)
                    // console.log("llllllllllllllllll")
                    const subTotalLine = lines.find(line => line.includes('Sub-Total:'));
                    const totalLine = lines.find(line => line.includes('Total:'));
                    const subTotal = parseFloat(subTotalLine.match(/\$([\d.]+)/)[1]);
                    const total = parseFloat(totalLine.match(/\$([\d.]+)/)[1]);
                    return { subTotal, total };
                }

                // Split the input string into lines
                const lines1 = data.Notes.split('\n');

                // Extract information and totals
                const info1 = lines1.map(extractInfo).filter(Boolean);
                const totals1 = extractTotals(lines1);

                dataObj.pos_system_used = "not sure1"
                // console.log("llllllllllllllllll")
                // console.log(totals1)
                // console.log("llllllllllllllllll")
                dataObj.order = info1
                dataObj.subtotal = totals1.subTotal
                dataObj.total = totals1.total
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

            if (data.Notes.includes("Jane Customer")) {
                console.log("INSIDE JANE0000000000000000000000")
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
