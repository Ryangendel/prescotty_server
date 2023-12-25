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
app.use(routes);

const resetDatabase = async () => {
    // await mongoose.connection.dropDatabase();
    await Order.deleteMany({});
    await Product.deleteMany({});
    await Pickup.deleteMany({});
    await Customer.deleteMany({});
    console.log('Database reset');
};

mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prescotty',
    //'mongodb://127.0.0.1:27017/prescotty',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
).then(() => {
        console.log('Connected successfully to MongoDB');
        // resetDatabase()
    })
    .catch((err) => {
        console.error('Mongo connection error: ', err.message);
    });

mongoose.set('debug', true);

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});