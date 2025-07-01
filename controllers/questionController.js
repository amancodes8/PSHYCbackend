// controllers/questionController.js

const Question = require('../models/Question'); // You must create this model

// Add a new question
exports.addQuestion = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Question text is required" });
    }

    const newQuestion = new Question({ text });
    await newQuestion.save();

    res.status(201).json({ message: "Question added successfully", question: newQuestion });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all questions
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions", error: error.message });
  }
};
