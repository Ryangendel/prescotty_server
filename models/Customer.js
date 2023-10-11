const { Schema, model } = require('mongoose');
const {OrderSchema, Orders} = require("./Order")

const CustomerSchema = new Schema({
  client_name: { 
    type: String,
    trim: true,
  },
  onfleet_task_id:{
    type: [String]
  },
  client_phone_number: {
    sparse: true,
    unique: true,
    type: String,
    trim: true,
  },
  // email: {
  //   unique: true,
  //   type: String,
  //   trim: true,
  //   sparse: true,
  // },
  destination_address: {
    type: String,
    trim: true,
  },
  // orders:{
  //   type:[OrderSchema]
  // },
  // city: {
  //   type: String,
  //   trim: true,
  // },
  // state: {
  //   type: String,
  //   trim: true,
  // },
  // zip: {
  //   type: String,
  //   trim: true,
  // },
  // dob: {
  //   type: String,
  //   trim: true,
  // },
  medical_patient:{
    type:Boolean,
  },
});

const Customer = model('Customer', CustomerSchema);

module.exports = Customer;