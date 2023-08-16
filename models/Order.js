const { Schema, model } = require('mongoose');

const OrderSchema = new Schema({
  order_id: {
    type: String,
    trim: true,
  },
  customer_number: {
    type: String,
    trim: true,
  },
  product_id: {
    type: Array,
  },
  variant_id: {
    type: String,
    trim: true,
  },
  discount: {
    type: Number,
    trim: true,
  },
  order_date: {
    type: Date,
    trim: true,
  },
  price: {
    type: Number,
    trim: true,
  },
  quantity: {
    type: Number,
    trim: true,
  },
  total: {
    type: String,
    trim: true,
  },

});

const Order = model('Order', OrderSchema);

module.exports = Order;
