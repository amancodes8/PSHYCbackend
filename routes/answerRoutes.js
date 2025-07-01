const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Answer = require("../models/Answer");
const Question = require("../models/Question");

// Helper: Scoring logic
const getEvaluation = (score, total) => {
  const percent = (score / total) * 100;
  if (percent <= 33) return "Low likelihood of autism traits.";
  if (percent <= 66) return "Moderate signs of autism — consider further observation.";
  return "High likelihood of autism traits — please consult a specialist.";
};

// POST /submit
router.post("/submit", auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user._id;

    console.log("📥 Answers submitted:", answers);
    console.log("🔐 User submitting:", userId);

    const allQuestions = await Question.find({});
    const total = allQuestions.length;
    let score = 0;

    allQuestions.forEach((q) => {
      if (q.correctAnswer && answers[q._id] === q.correctAnswer) {
        score++;
      }
    });

    const evaluation = getEvaluation(score, total);

    const entry = await Answer.create({
      userId,
      answers,
      score,
      evaluation,
    });

    res.json({ message: "Stored", score, evaluation });
  } catch (err) {
    console.error("❌ Error in /submit:", err); // 👈 this shows the real issue
    res.status(500).json({ error: "Submission failed" });
  }
});

// GET /history
router.get("/history", auth, async (req, res) => {
  try {
    const history = await Answer.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ error: "Could not fetch history" });
  }
});

module.exports = router;
