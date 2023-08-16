const { Schema, model } = require('mongoose');

const ProductSchema = new Schema({
  product_id: {
    type: String,
    trim: true,
  },
  product_name: {
    type: String,
    trim: true,
  },
  product_description: {
    type: String,
  },
  price: {
    type: Number,
    trim: true,
  },
  cost: {
    type: Number,
    trim: true,
  },
  product_category: {
    type: String,
    trim: true,
  },
  strain_type: {
    type: String,
    trim: true,
  },
  product_image1: {
    type: String,
    trim: true,
  },
  product_image2: {
    type: String,
    trim: true,
  },
  variant_id: {
    type: String,
    trim: true,
  },
  variant_name: {
    type: String,
    trim: true,
  },
  variant_sku: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    trim: true,
  },

});

const Product = model('Product', ProductSchema);

module.exports = Product;