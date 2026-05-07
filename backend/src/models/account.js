const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: false,
    },
    dob: {
      type: Date,
      required: false,
    },
    nic: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['patient', 'admin', 'user'],
      required: true,
      set: (value) => (value === 'user' ? 'patient' : value),
    },
  },
  { timestamps: true }
);

accountSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.models.Account || mongoose.model('Account', accountSchema);
