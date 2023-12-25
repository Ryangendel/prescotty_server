const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 3001;
const { Customer, Order, Product, Pickup } = require('./models');
const routes = require('./routes');



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
let db;

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
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prescotty',
    //'mongodb://127.0.0.1:27017/prescotty',
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
        // resetDatabase()
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


app.use(routes);

// app.post('/submit', ({ body }, res) => {
//     Order.create(body)
//         .then((dbNote) => {
//             res.json(dbNote);
//         })
//         .catch((err) => {
//             res.json(err);
//         });
// });




// app.get('/update/:month', (req, res) => {
//     fs.createReadStream(`./on_fleet_${req.params.month}.csv`)
//         .pipe(csv())
//         .on('data', async (data) => {

//             const startDate = new Date(data.startTime);
//             const completionDate = new Date(data.completionTime);

//             // Subtract to get the difference in milliseconds
//             const elapsedMilliseconds = completionDate - startDate;

//             // Convert milliseconds to seconds, minutes, and hours
//             const elapsedSeconds = elapsedMilliseconds / 1000;
//             const elapsedMinutes = elapsedSeconds / 60;
//             const elapsedHours = elapsedMinutes / 60;


//             if (elapsedMinutes > 7) {
//                 Order.findOneAndUpdate({ onfleet_task_id: data.shortId }, { $set: { "minutes_to_complete": Math.round(elapsedMinutes * 1000) / 1000 } }, { new: true, runValidators: true })
//                     .then((dbNote) => {
//                         // if (!dbNote) {
//                         //     res.json({ message: 'No note found with this id!' });
//                         //     return;
//                         // }
//                         // res.json(dbNote);
//                         console.log("worked")
//                     })
//                     .catch((err) => {
//                         res.json(err);
//                     });
//             }

//         })
//         .on('end', () => {
//             res.send(`${req.params.month} was added!`)
//             //res.json(results)
//         });
// });


// app.get('/testingroute/webhook/createtask', async (req, res) => {
// //     console.log("=================================================================")
// //     const hash = crypto.createHmac('sha512', secret_in_hex).update(req.body).digest('hex')
// //     if(hash == "72aef1f1d89d27c7117a5cff6548332bbe6916ec601832d00ce49cca746015cc4bb3dbd8f2a368a66694332d568d064604320f8deb1b4b0740905f97fa835d30"){
// //         console.log(req)
// //         console.log("=================================================================")
// //         res.send("working")
// //     }
// //    res.send("not working")

// console.log("=================================================================")

// const receivedSignature = req.headers['X-Onfleet-Signature'];
// const message = JSON.stringify(req.body);
// const secret = "72aef1f1d89d27c7117a5cff6548332bbe6916ec601832d00ce49cca746015cc4bb3dbd8f2a368a66694332d568d064604320f8deb1b4b0740905f97fa835d30";

// const hash = crypto.createHmac('sha512', secret)
//                    .update(message)
//                    .digest('hex');

// if (hash === receivedSignature) {
//     console.log('Valid signataure. Processing webhook...');
//     // Process the webhook
// } else {
//     console.log('Invalid signature. Rejecting the request...');
//     return res.status(403).send('Invalid signature');
// }

// res.status(200).send('Webhook received');
// })



app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});
