const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// ✅ Get all users (admin)
router.get("/users", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: "Forbidden" });

  try {
    const users = await User.find({}, "name email createdAt isAdmin");
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch users" });
  }
});

// ✅ Delete a user by ID (admin)
router.delete("/users/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: "Forbidden" });

  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
