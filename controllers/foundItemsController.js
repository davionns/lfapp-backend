const db = require('../config/db');
const multer = require('multer');
const { createNotification } = require('./notificationsController'); // Import the notification function

// Configure multer for image upload
const storage = multer.memoryStorage(); // Store the image in memory as buffer
const upload = multer({ storage: storage });

// Report a found item with an image
exports.reportFoundItem = (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Error uploading image:', err);
            return res.status(500).send('Error uploading image');
        }

        const { category, description, location, finder_contact } = req.body;
        const image = req.file ? req.file.buffer : null; // Get image buffer from multer

        // Check if the user exists in the users table
        const checkUserSql = 'SELECT id FROM users WHERE contact = ?';  // Assuming 'contact' is the column for phone number
        db.query(checkUserSql, [finder_contact], (err, result) => {
            if (err) {
                console.error('Error checking user existence:', err);
                return res.status(500).send('Error checking user existence');
            }

            if (result.length === 0) {
                // Handle the case where the user does not exist
                console.error('User does not exist');
                return res.status(404).send('User not found');
            }

            const userId = result[0].id;  // Get the valid user_id from the users table

            // Proceed to insert the found item
            const sql = 'INSERT INTO found_items (category, description, image, location, finder_contact, status) VALUES (?, ?, ?, ?, ?, "pending")';
            db.query(sql, [category, description, image, location, finder_contact], (err, result) => {
                if (err) {
                    console.error('Error reporting found item:', err);
                    return res.status(500).send('Error reporting found item');
                }

                // Create a notification for the user who reported the found item
                createNotification(userId, 'A new found item has been reported.');

                res.status(201).send('Found item reported successfully');
            });
        });
    });
};

// Search for found items
exports.getCategories = (req, res) => {
    const sql = 'SELECT DISTINCT category FROM found_items';
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).send('Error fetching categories');
      }
  
      const categories = results.map((row) => row.category);
      res.status(200).json(categories);
    });
  };
  
  // Claim a found item
  exports.claimFoundItem = (req, res) => {
    const itemId = req.params.itemId;
    const userId = req.body.userId;
  
    const sql = 'UPDATE found_items SET status = "claimed", claimed_by = ? WHERE id = ?';
  
    db.query(sql, [userId, itemId], (err, result) => {
      if (err) {
        console.error('Error claiming found item:', err);
        return res.status(500).send('Error claiming found item');
      }
  
      // Notify about the claim (assuming we have a notification function)
      createNotification(userId, 'You have successfully claimed an item.');
  
      res.status(200).send('Item claimed successfully');
    });
  };
  
  // Existing search function for found items
  // Update the search function to handle claimed items
exports.searchFoundItems = (req, res) => {
  const { keyword, category, date, userId } = req.query;

  let sql = 'SELECT id, category, description, location, finder_contact, created_at, image, claimed_by FROM found_items WHERE 1=1';
  const params = [];

  if (keyword) {
    sql += ' AND (description LIKE ? OR category LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (date) {
    sql += ' AND DATE(created_at) = ?';
    params.push(date);
  }

  // Exclude claimed items, unless the logged-in user is the one who claimed it
  if (userId) {
    sql += ' AND (status != "claimed" OR claimed_by = ?)';
    params.push(userId);
  } else {
    sql += ' AND status != "claimed"'; // Default to hide claimed items if no userId is provided
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error searching for found items:', err);
      return res.status(500).send('Error searching for found items');
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

// Claim a found item
// Show all claimed items by the logged-in user
// Show Claimed Items
exports.showClaimedItems = (req, res) => {
  const userId = req.headers['user-id']; // Get the userId from the headers (logged-in user's ID)

  if (!userId) {
    return res.status(400).send('User ID is required');
  }

  // Query to fetch items claimed by the user
  const sql = 'SELECT id, category, description, location, finder_contact, status, created_at FROM found_items WHERE claimed_by = ?';

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching claimed items:', err);
      return res.status(500).send('Error fetching claimed items');
    }

    res.status(200).json(results);
  });
};

// Unclaim a found item
exports.unclaimFoundItem = (req, res) => {
  const itemId = req.params.itemId;
  const userId = req.body.userId; // Assuming userId is passed in the body

  if (!userId) {
    return res.status(400).send('User ID is required');
  }

  // Check if the item is claimed by the user
  const checkClaimedSql = 'SELECT * FROM found_items WHERE id = ? AND claimed_by = ?';
  db.query(checkClaimedSql, [itemId, userId], (err, result) => {
    if (err) {
      console.error('Error checking claim status:', err);
      return res.status(500).send('Error checking claim status');
    }

    if (result.length === 0) {
      return res.status(400).send('You have not claimed this item or it does not exist');
    }

    // Unclaim the item: Set 'claimed_by' to NULL and 'status' to 'pending'
    const unclaimSql = 'UPDATE found_items SET status = "pending", claimed_by = NULL WHERE id = ?';
    db.query(unclaimSql, [itemId], (err) => {
      if (err) {
        console.error('Error unclaiming found item:', err);
        return res.status(500).send('Error unclaiming found item');
      }

      // Optionally, notify the user about unclaiming the item
      // createNotification(userId, 'You have successfully unclaimed an item.');

      res.status(200).send('Item unclaimed successfully');
    });
  });
};