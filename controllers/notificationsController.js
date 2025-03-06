const db = require('../config/db');

// Create a notification
exports.createNotification = (userId, message) => {
  const sql = 'INSERT INTO notifications (user_id, message, status, created_at) VALUES (?, ?, "unread", NOW())';
  db.query(sql, [userId, message], (err) => {
    if (err) {
      console.error('Error creating notification:', err);
    }
  });
};

// Fetch notifications for a user
exports.getNotifications = (req, res) => {
  const userId = req.params.userId; // Get user ID from request parameters

  const sql = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).send('Error fetching notifications');
    }

    res.status(200).json(results);
  });
};

// Mark a notification as read
exports.markNotificationAsRead = (req, res) => {
  const notificationId = req.params.notificationId;

  const sql = 'UPDATE notifications SET status = "read" WHERE id = ?';
  db.query(sql, [notificationId], (err) => {
    if (err) {
      console.error('Error marking notification as read:', err);
      return res.status(500).send('Error marking notification as read');
    }

    res.status(200).send('Notification marked as read');
  });
};
