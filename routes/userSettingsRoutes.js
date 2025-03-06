const express = require('express');
const router = express.Router();
const userSettingsController = require('../controllers/userSettingsController');

// Route to get user settings
router.get('/:userId', userSettingsController.getUserSettings);

// Route to update user settings
router.put('/:userId', userSettingsController.updateUserSettings);

module.exports = router;
