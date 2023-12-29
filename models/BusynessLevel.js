const { Schema, model } = require('mongoose');

const BusynesSchema = new Schema({
  busyness_level: { 
    type: String,
    trim: true,
  },
  currently_active:{
    type: Boolean
  },
});

const Busyness = model('Busyness', BusynesSchema);

module.exports = Busyness;