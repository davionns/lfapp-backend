const express = require('express');
const { getAllUsers, manageLostItems } = require('../controllers/adminController');
const { authenticateToken } = require('../utils/authMiddleware');

const router = express.Router();

router.get('/users', authenticateToken, getAllUsers);
router.put('/manage-lost-items', authenticateToken, manageLostItems);

module.exports = router;
