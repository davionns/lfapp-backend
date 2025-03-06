const db = require('../config/db');

// Fetch user settings
exports.getUserSettings = (req, res) => {
  const userId = req.params.userId; // Assume user ID is passed as a parameter

  const sql = 'SELECT * FROM user_settings WHERE user_id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user settings:', err);
      return res.status(500).send('Error fetching user settings');
    }

    if (results.length === 0) {
      return res.status(404).send('User settings not found');
    }

    res.status(200).json(results[0]);
  });
};

// Update user settings
exports.updateUserSettings = (req, res) => {
  const userId = req.params.userId; // Assume user ID is passed as a parameter
  const { notify_found_match, notify_claimed, publicize_lost_items } = req.body;

  const sql = 'UPDATE user_settings SET notify_found_match = ?, notify_claimed = ?, publicize_lost_items = ? WHERE user_id = ?';
  db.query(sql, [notify_found_match, notify_claimed, publicize_lost_items, userId], (err, result) => {
    if (err) {
      console.error('Error updating user settings:', err);
      return res.status(500).send('Error updating user settings');
    }

    res.status(200).send('User settings updated successfully');
  });
};
