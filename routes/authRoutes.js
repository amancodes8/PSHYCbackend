const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware"); // You'll need to create this

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.avatar = req.body.avatar || user.avatar;
    user.bio = req.body.bio || user.bio;
    user.gender = req.body.gender || user.gender;
    user.location = req.body.location || user.location;

    // Handle social links update
    if (req.body.socialLinks) {
      user.socialLinks = {
        twitter: req.body.socialLinks.twitter || user.socialLinks.twitter,
        facebook: req.body.socialLinks.facebook || user.socialLinks.facebook,
        linkedin: req.body.socialLinks.linkedin || user.socialLinks.linkedin
      };
    }

    // Handle preferences update
    if (req.body.preferences) {
      user.preferences = {
        theme: req.body.preferences.theme || user.preferences.theme,
        notifications: req.body.preferences.notifications !== undefined 
          ? req.body.preferences.notifications 
          : user.preferences.notifications
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      gender: updatedUser.gender,
      location: updatedUser.location,
      socialLinks: updatedUser.socialLinks,
      preferences: updatedUser.preferences
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;