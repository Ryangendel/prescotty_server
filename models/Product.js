const { Schema, model } = require('mongoose');

const ProductSchema = new Schema({
  product: {
    type: String,
    trim: true,
  },
  option: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    trim: true,
  },
  price: {
    type: Number,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  sku: {
    type: Number,
    trim: true,
  },
  type: {
    type: String,
    trim: true,
  },
});

const Product = model('Product', ProductSchema);

module.exports = Product;