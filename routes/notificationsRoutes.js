const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

router.get('/:userId', notificationsController.getNotifications);
router.put('/read/:notificationId', notificationsController.markNotificationAsRead);

module.exports = router;
