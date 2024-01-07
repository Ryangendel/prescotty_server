const { Schema, model } = require('mongoose');

const BestDaze = new Schema({
  busyness_level: { 
    type: String,
    trim: true,
  },
  currently_active:{
    type: Boolean
  },
});

const BestDazeOrder = model('Busyness', BestDaze);

module.exports = BestDazeOrder;