const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    sets: { type: String, required: true, trim: true },
    reps: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    category: {
      type: String,
      required: true,
      enum: ['post-surgery', 'after-fall', 'general-pain'],
    },
    instructions: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    precautions: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Exercise || mongoose.model('Exercise', exerciseSchema);
