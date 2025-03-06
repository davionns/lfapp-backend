const express = require('express');
const {
  reportLostItem,
  searchLostItems,
  getAllLostItems,
  getAllLostItemsForAdmin, // New admin method
  approveLostItem,
  deleteLostItem,
  markLostItemAsFound,
  getStatistics
} = require('../controllers/lostItemsController');

const router = express.Router();

// Define routes for lost item management
router.post('/report', reportLostItem); // Report a lost item
router.get('/search', searchLostItems); // Search for lost items (approved only)
router.get('/', getAllLostItems); // Get all approved lost items
router.get('/admin', getAllLostItemsForAdmin); // Get all lost items for admin
router.put('/approve/:itemId', approveLostItem); // Approve lost item
router.delete('/:itemId', deleteLostItem); // Delete lost item
router.put('/mark-as-found/:itemId', markLostItemAsFound); // New route to mark item as found
router.get('/statistics', getStatistics);

module.exports = router;
