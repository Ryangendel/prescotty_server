const { Schema, model } = require('mongoose');

const CustomerSchema = new Schema({
  customer_id: {
    type: String,
    trim: true,
  },
  full_name: { //have
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  mobile: {
    type: String,
    trim: true,
  },
  address1: {
    type: String,
    trim: true,
  },
  address2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  zip: {
    type: Number,
    trim: true,
  },
  dob: {
    type: Date,
    trim: true,
  },
  medical_patient:{
    type:Boolean,
  }

});

const Customer = model('Customer', CustomerSchema);

module.exports = Customer;