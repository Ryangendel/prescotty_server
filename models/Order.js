const { Schema, model } = require('mongoose');

const OrderSchema = new Schema({
  order_number: {
    type: String,
    trim: true,
  },
  onfleet_task_id:{
    type: String,
    trim: true,
    unique:true
  },
  total_items_on_order:{
    type: Number,
    trim: true,
    sparse: true,
  },
  mobile: {
    type: String,
    trim: true,
    sparse: true,
  },
  created_at: {
    type: String,
  },
  subtotal: {
    type: Number,
    trim: true,
  },
  order_total: {
    type: Number,
    trim: true,
  },
  view_order_url: {
    type: String,
    trim: true,
  },
  order_detail: {
    type: Array,
    trim: true,
  },
  pos_system_used:{
    type: String,
    trim: true,
  },
  NOTES:{
    type: String,
    trim: true,
  },
  minutes_to_complete:{
    type:Number
  },
  distance_for_delivery:{
    type:Number
  }
});

const Order = model('Order', OrderSchema);

module.exports = Order;
