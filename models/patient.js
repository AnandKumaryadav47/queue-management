const mongoose = require('mongoose');
const basemodal = require('./basemodal')

const patientSchema = new mongoose.Schema({
  name: String,
  age: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false
  },
  ...basemodal
});

module.exports = mongoose.model('Patient', patientSchema);
