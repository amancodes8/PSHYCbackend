const Question = require('../models/Question');
const { validationResult } = require('express-validator');

// @desc    Add a new question
// @route   POST /api/questions
// @access  Private
exports.addQuestion = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { question, options, correctAnswer } = req.body;

    // Verify correct answer exists in options
    if (!options.includes(correctAnswer)) {
      return res.status(400).json({ 
        success: false,
        error: "Correct answer must be one of the provided options" 
      });
    }

    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      createdBy: req.user._id
    });

    await newQuestion.save();

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: {
        id: newQuestion._id,
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
        createdBy: newQuestion.createdBy,
        createdAt: newQuestion.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while creating question",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res) => {
  try {
    // Add pagination (example: ?page=1&limit=10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    const totalQuestions = await Question.countDocuments();

    res.status(200).json({
      success: true,
      count: questions.length,
      total: totalQuestions,
      pages: Math.ceil(totalQuestions / limit),
      currentPage: page,
      data: questions
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching questions",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: "Question not found"
      });
    }

    // Verify ownership or admin status
    if (question.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this question"
      });
    }

    await question.remove();

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      data: {
        id: question._id,
        question: question.question
      }
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while deleting question",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};