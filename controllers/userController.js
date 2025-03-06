const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get all approved users
exports.getAllUsers = (req, res) => {
  const sql = 'SELECT * FROM users ';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Error fetching users');
    }

    res.status(200).json(results); // Send the fetched users as a JSON response
  });
};

// Register a new user
exports.registerUser = (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Get the current year
  const currentYear = new Date().getFullYear();

  // Find the highest student_id for the current year and increment
  const getMaxIdSql = 'SELECT MAX(student_id) AS maxId FROM users WHERE student_id LIKE ?';
  db.query(getMaxIdSql, [`${currentYear}%`], (err, result) => {
    if (err) {
      console.error('Error generating student ID:', err);
      return res.status(500).send('Error generating student ID');
    }

    // Increment the numeric part of the student ID
    const maxId = result[0].maxId;
    const nextId = maxId ? parseInt(maxId.slice(4)) + 1 : 1;
    const studentId = `${currentYear}${nextId.toString().padStart(4, '0')}`; // Format: YYYY0001

    // Insert the new user with the generated student ID
    const sql = 'INSERT INTO users (name, student_id, email, password, role, approved) VALUES (?, ?, ?, ?, ?, FALSE)';
    db.query(sql, [name, studentId, email, hashedPassword, role], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).send('Error registering user');
      }

      // Insert default user settings after user creation
      const userId = result.insertId;
      const settingsSql = 'INSERT INTO user_settings (user_id, notify_found_match, notify_claimed, publicize_lost_items) VALUES (?, TRUE, TRUE, TRUE)';
      db.query(settingsSql, [userId], (err) => {
        if (err) {
          console.error('Error inserting user settings:', err);
          return res.status(500).send('Error inserting user settings');
        }

        res.status(201).send('User registered successfully');
      });
    });
  });
};

// Approve a user
exports.approveUser = (req, res) => {
  const userId = req.params.userId;

  const sql = 'UPDATE users SET approved = TRUE WHERE id = ?';
  db.query(sql, [userId], (err) => {
    if (err) {
      console.error('Error approving user:', err);
      return res.status(500).send('Error approving user');
    }

    res.status(200).send('User approved successfully');
  });
};

// Delete a user
exports.deleteUser = (req, res) => {
  const userId = req.params.userId;

  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [userId], (err) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).send('Error deleting user');
    }

    res.status(200).send('User deleted successfully');
  });
};

// User login
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ? AND approved = TRUE'; // Check if the user is approved
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error logging in:', err);
      return res.status(500).send('Error logging in');
    }

    if (results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
      return res.status(401).send('Invalid email or password');
    }

    const userId = results[0].id;
    const role = results[0].role;
    const token = jwt.sign({ userId, role }, 'your_secret_key', { expiresIn: '1h' });

    // Send token, role, and userId in the response
    res.status(200).json({ token, role, userId });
  });
};

// Get user profile
exports.getUserProfile = (req, res) => {
  const userId = req.params.userId; // Get user ID from request parameters

  // Query to fetch user information
  const userSql = 'SELECT name, student_id FROM users WHERE id = ?';

  // Query to fetch user's reported lost items
  const itemsSql = 'SELECT id, category, description, location, status, created_at FROM lost_items WHERE user_id = ? AND status = "approved"';

  // Fetch user details
  db.query(userSql, [userId], (err, userResult) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).send('Error fetching user details');
    }

    if (userResult.length === 0) {
      return res.status(404).send('User not found');
    }

    // Fetch user's reported items
    db.query(itemsSql, [userId], (err, itemsResult) => {
      if (err) {
        console.error('Error fetching user reported items:', err);
        return res.status(500).send('Error fetching user reported items');
      }

      res.status(200).json({
        user: userResult[0],
        reportedItems: itemsResult,
      });
    });
  });
};
