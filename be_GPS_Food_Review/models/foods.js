const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  coordinate: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  radiusMeters: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  translations: {
    type: Object,
    of: {
      name: String,
      specialty: String,
      description: String,
      address: String
    },
    required: true
  }
});

module.exports = mongoose.model('Food', foodSchema);