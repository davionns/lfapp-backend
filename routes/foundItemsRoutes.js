const express = require('express');
const { reportFoundItem, searchFoundItems, claimFoundItem, getCategories, showClaimedItems, unclaimFoundItem } = require('../controllers/foundItemsController');

const router = express.Router();

// Route to report a found item
router.post('/report', reportFoundItem);

// Route to search found items
router.get('/search', searchFoundItems);

// Route to get categories for filtering
router.get('/categories', getCategories);

// Route to claim a found item
router.post('/claim/:itemId', claimFoundItem);

// Route to show claimed items
router.get('/claimed-items', showClaimedItems);

// Route to unclaim a found item
router.post('/unclaim/:itemId', unclaimFoundItem);

module.exports = router;
