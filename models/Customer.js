const { Schema, model } = require('mongoose');

const CustomerSchema = new Schema({
  full_name: { 
    type: String,
    trim: true,
  },
  mobile: {
    sparse: true,
    unique: true,
    type: String,
    trim: true,
  },
  email: {
    unique: true,
    type: String,
    trim: true,
    sparse: true,
  },
  address1: {
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
    type: String,
    trim: true,
  },
  dob: {
    type: String,
    trim: true,
  },
  medical_patient:{
    type:Boolean,
  },
  medical_patient_card:{
    type:String,
  }
});

const Customer = model('Customer', CustomerSchema);

module.exports = Customer;