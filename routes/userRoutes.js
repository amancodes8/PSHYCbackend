const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount
} = require('../controllers/userController');

// Protected user routes
router.route('/profile')
  .get(protect, getUserProfile)       // GET /api/users/profile
  .put(protect, updateUserProfile);   // PUT /api/users/profile

router.delete('/delete', protect, deleteUserAccount); // DELETE /api/users/delete

module.exports = router;