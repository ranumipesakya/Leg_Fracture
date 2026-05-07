const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: false,
  },
  result: {
    type: String,
    required: true,
    enum: ['Fractured', 'Not Fractured', 'Not an X-ray', 'Not a leg X-ray', 'Unknown'],
  },
  confidence: {
    type: Number,
    required: false,
  },
  filename: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ScanResult', scanResultSchema);
