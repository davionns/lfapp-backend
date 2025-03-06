const express = require('express');
const { registerUser, loginUser, getUserProfile, getAllUsers, approveUser, deleteUser } = require('../controllers/userController');
const router = express.Router();

// Define routes for user management
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile/:userId', getUserProfile);
router.get('/', getAllUsers); // Get all users
router.put('/approve/:userId', approveUser); // Approve user
router.delete('/:userId', deleteUser); // Delete user

module.exports = router;
