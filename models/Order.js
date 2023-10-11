const { Schema, model, Types } = require('mongoose');
const {ProductSchema} = require("./Product")


const OrderSchema = new Schema({
  priscotty_orderID: {
    type: Schema.Types.ObjectId,
    default: () => new Types.ObjectId(),
  },
  onfleet_task_id: 
    {
      type: Schema.Types.String,
      ref: 'Customer',
    },
  
  delivery_driver:{
    type: String,
    trim: true,
  },
  creation_time:{
    type: Date,
  },
  delivery_start_time: {
    type: Date,
  },
  day_of_the_week:{
    type:String
  },
  destination_address: {
    type: String,
    trim:true
  },
  client_name: {
    type: String,
    trim: true,
  },
  client_phone_number: {
    type: String,
    trim: true,
  },
  delivery_distance: {
    type: Number,
    trim: true,
  },
  task_details: {
    type: String,
    trim: true,
  },
  signature_picture:{
    type: String,
    trim: true,
    sparse: true,
    unique: true,
  },
  client_picture:{
    type: String,
    trim: true,
    sparse: true,
    unique: true,
  },
  driver_departure_time:{
    type:Date,
    trim: true,
  },
  driver_arrival_time:{
    type:Date,
    trim: true,
  },
  pos_system:{
    type:String,
    trim: true,
  },
  order_url:{
    type:String,
    trim: true,
  },
  transaction_id:{
    type:String,
    trim: true,
  },
  products:[ProductSchema],
  subtotal:{
    type: Number,
    trim: true,
  },
  discount:{
    type: String,
    trim: true,
  },
  order_total:{
    type: Number,
    trim: true,
  },
  quantity_of_items_in_order:{
    type:Number,
    trim: true,
  },
});

const Order = model('Order', OrderSchema);

module.exports = {OrderSchema, Order};
