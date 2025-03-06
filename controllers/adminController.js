const db = require('../config/db');

// Get all users (admin only)
exports.getAllUsers = (req, res) => {
  const sql = 'SELECT id, name, student_id, email, role FROM users';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Error fetching users');
    }
    res.status(200).json(results);
  });
};

// Approve or reject lost item reports
exports.manageLostItems = (req, res) => {
  const { itemId, action } = req.body;

  const status = action === 'approve' ? 'found' : 'rejected';
  const sql = 'UPDATE lost_items SET status = ? WHERE id = ?';

  db.query(sql, [status, itemId], (err, result) => {
    if (err) {
      console.error('Error managing lost item:', err);
      return res.status(500).send('Error managing lost item');
    }
    res.status(200).send(`Lost item ${status} successfully`);
  });
};
