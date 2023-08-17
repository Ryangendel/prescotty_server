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

app.get('/all', (req, res) => {
    var results = []
    fs.createReadStream('./contacts_live.csv')
        .pipe(csv())
        .on('data', async (data) => {
            var formattedData = []
            var dataObj = {}
            var dataArr = [data]
            // console.log("-------------")
            // console.log(data)
            // console.log("-------------")
            // for (let i = 0; i < dataArr.length; i++) {
            dataObj.full_name = data.Name
            dataObj.mobile = data["Phone 1 - Value"]
            dataObj.address1 = data["Address 1 - Street"]
            dataObj.city = data["Address 1 - City"]
            dataObj.state = data["Address 1 - Region"]
            dataObj.zip = data["Address 1 - Postal Code"]
            const dobRegex = /DOB: (\d{2}\/\d{2}\/\d{4})/;
            console.log("************************************")
            console.log(data)
            console.log("************************************")

            const dob = data.Notes.match(dobRegex);
            if (dob && dob[1]) {
                dataObj.dob = dob[1];
            }
            const taskIdRegex = /Onfleet Task ID:\s+(\w+)/;
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

            // if (ProductName) {
            //     const productNames = ProductName.map(match => match.trim());
            //     dataObj.product_info = productNames
            // }

            const costRegex = /(\w+): (\$[\d.]+)/g;

            const matches = data.Notes.matchAll(costRegex);

            for (const match of matches) {
                const key = match[1];
                const value = match[2];
                dataObj[key] = value;
            }

            const itemRegex = /Option: ([^\n]+)\nQuantity: (\d+)\nBrand: ([^\n]+)\nPrice: (\d+)/g;

            const extractedItems = [];
            let match;
            
            while ((match = itemRegex.exec(data.Notes)) !== null) {
                const [, option, quantity, brand, price] = match;
                extractedItems.push({
                    itemPurchased: "N/A",
                    option,
                    quantity: parseInt(quantity),
                    brand,
                    price: parseFloat(price)
                });
            }
            
            console.log("----------------------------===============")
            console.log(extractedItems)
            console.log("----------------------------===============")
            dataObj.purchase_details = extractedItems
            // dataObj.notes = data.Notes
            results.push(dataObj)
            //   } 
        
            // console.log(formattedData)
        })
        .on('end', () => {
            console.log(results);
            res.json(results)
            // [
            //   { NAME: 'Daffy Duck', AGE: '24' },
            //   { NAME: 'Bugs Bunny', AGE: '22' }
            // ]
        });
    //     fs.readFile("./contacts.csv","utf8", function (err, fileData) {
    //      parse(fileData, {columns: false, trim: true}, function(err, rows) {
    //    console.log(fileData)
    // console.log(fileData)
    // })
    // })
    //   Order.find({})
    //     .then((dbNote) => {
    //       res.json(dbNote);
    //     })
    //     .catch((err) => {
    //       res.json(err);
    //     });
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
