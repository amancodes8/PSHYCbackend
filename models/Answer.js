// models/Answer.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: Map, of: String, required: true },
  score: Number,
  evaluation: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Answer', answerSchema);
