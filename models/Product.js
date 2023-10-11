const { Schema, Types, model } = require('mongoose');


const ProductSchema = new Schema({
  priscottyId: {
    type: Schema.Types.ObjectId,
    default: () => new Types.ObjectId(),
  },
  product_name: {
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

module.exports = {Product, ProductSchema};