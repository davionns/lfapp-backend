const db = require('../config/db');
const multer = require('multer');
const { createNotification } = require('./notificationsController'); // Import the notification function


// Configure multer for image upload
const storage = multer.memoryStorage(); // Store the image in memory as buffer
const upload = multer({ storage: storage });

// Report a lost item with an image
exports.reportLostItem = (req, res) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Error uploading image:', err);
        return res.status(500).send('Error uploading image');
      }
  
      const { user_id, category, description, location, reward_value, sentimental_value } = req.body;
      const image = req.file ? req.file.buffer : null; // Get image buffer from multer
  
      const sql = 'INSERT INTO lost_items (user_id, category, description, image, location, reward_value, sentimental_value, status) VALUES (?, ?, ?, ?, ?, ?, ?, "pending")';
      db.query(sql, [user_id, category, description, image, location, reward_value, sentimental_value], (err, result) => {
        if (err) {
          console.error('Error reporting lost item:', err);
          return res.status(500).send('Error reporting lost item');
        }
  
        // Create a notification for the user
        createNotification(user_id, 'Your lost item report has been submitted and is pending approval.');
  
        res.status(201).send('Lost item reported successfully');
      });
    });
  };
// Search for lost items (approved only)
exports.searchLostItems = (req, res) => {
  const { keyword, category } = req.query;

  let sql = 'SELECT id, user_id, category, description, location, reward_value, sentimental_value, status, created_at, image FROM lost_items WHERE status = "approved"';
  const params = [];

  if (keyword) {
    sql += ' AND (description LIKE ? OR category LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error searching for lost items:', err);
      return res.status(500).send('Error searching for lost items');
    }

    // Convert image buffers to base64 for frontend display
    results.forEach((item) => {
      if (item.image) {
        item.image = item.image.toString('base64');
      }
    });

    res.status(200).json(results);
  });
};

// Admin: Get all lost items (regardless of status)
exports.getAllLostItemsForAdmin = (req, res) => {
  const sql = 'SELECT * FROM lost_items'; // Fetch all lost items regardless of their status

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching all lost items for admin:', err);
      return res.status(500).send('Error fetching all lost items for admin');
    }

    // Convert image buffers to base64 for frontend display
    results.forEach((item) => {
      if (item.image) {
        item.image = item.image.toString('base64');
      }
    });

    res.status(200).json(results);
  });
};

// Approve a lost item
exports.approveLostItem = (req, res) => {
  const itemId = req.params.itemId;

  const sql = 'UPDATE lost_items SET status = "approved" WHERE id = ?';
  db.query(sql, [itemId], (err) => {
    if (err) {
      console.error('Error approving lost item:', err);
      return res.status(500).send('Error approving lost item');
    }

    res.status(200).send('Lost item approved successfully');
  });
};

// Delete a reported lost item
exports.deleteLostItem = (req, res) => {
  const itemId = req.params.itemId;

  const sql = 'DELETE FROM lost_items WHERE id = ?';
  db.query(sql, [itemId], (err) => {
    if (err) {
      console.error('Error deleting lost item:', err);
      return res.status(500).send('Error deleting lost item');
    }

    res.status(200).send('Lost item deleted successfully');
  });
};

// Get all approved lost items
exports.getAllLostItems = (req, res) => {
  const sql = 'SELECT * FROM lost_items WHERE status = "approved"'; // Fetch only approved lost items

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching lost items:', err);
      return res.status(500).send('Error fetching lost items');
    }
    res.status(200).json(results);
  });
};
// Mark a lost item as found
exports.markLostItemAsFound = (req, res) => {
  const itemId = req.params.itemId;

  const sql = 'UPDATE lost_items SET status = "found" WHERE id = ?';
  db.query(sql, [itemId], (err) => {
    if (err) {
      console.error('Error marking lost item as found:', err);
      return res.status(500).send('Error marking lost item as found');
    }

    res.status(200).send('Lost item marked as found successfully');
  });
};
// Get statistics for lost and found items
exports.getStatistics = (req, res) => {
  const sqlLostItems = 'SELECT COUNT(*) AS lostItemsCount FROM lost_items';
  const sqlFoundItems = 'SELECT COUNT(*) AS foundItemsCount FROM found_items WHERE status = "found"';
  
  db.query(sqlLostItems, (err, lostResults) => {
    if (err) {
      console.error('Error fetching lost items count:', err);
      return res.status(500).send('Error fetching lost items count');
    }

    db.query(sqlFoundItems, (err, foundResults) => {
      if (err) {
        console.error('Error fetching found items count:', err);
        return res.status(500).send('Error fetching found items count');
      }

      const statistics = {
        lostItemsCount: lostResults[0].lostItemsCount,
        foundItemsCount: foundResults[0].foundItemsCount
      };

      res.status(200).json(statistics);
    });
  });
};
