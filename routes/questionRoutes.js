// routes/questionRoutes.js

const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const auth = require("../middleware/auth");

// ✅ Create Question
router.post("/add", auth, async (req, res) => {
  try {
    const { question, options, correctAnswer } = req.body;
    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      createdBy: req.user._id,
    });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(500).json({ error: "Could not create question" });
  }
});

// ✅ Get All Questions
router.get("/all", async (req, res) => {
  const questions = await Question.find({});
  res.json(questions);
});

// ✅ Delete Question (admin only)
router.delete("/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: "Forbidden" });

  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
