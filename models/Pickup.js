const { Schema, model } = require('mongoose');

const PickupSchema = new Schema({
  signature_text: {
    type: String,
    trim: true,
  },
  signature_url:{
    type: String,
    trim: true,
  },
  photo_url:{
    type: String,
    trim: true,
  },
  onfleet_task_id: {
    type: String,
    trim: true,
    unique:true,
  },
  creation_time: {
    type: Date,
    trim: true,
  },
  completion_time: {
    type: Date,
    trim: true,
  },
  order_id: {
    type: String,
    trim: true,
  },
  pickup_dispensary: {
    type: String,
    trim: true,
  },
  pickup_dispensary_location: {
    type: String,
    trim: true,
  },
  driver:{
    type: String,
    trim: true,
  },
  quantity_of_items_in_order:{
    type: String,
    trim: true,
  },
  subtotal:{
    type: Number,
    trim: true,
  },
  order_total:{
    type: Number,
    trim: true,
  },

});

const Pickup = model('Pickup', PickupSchema);

module.exports = Pickup;