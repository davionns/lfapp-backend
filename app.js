const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const lostItemsRoutes = require('./routes/lostItemsRoutes');
const foundItemsRoutes = require('./routes/foundItemsRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/userSettingsRoutes'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/lost-items', lostItemsRoutes);
app.use('/api/found-items', foundItemsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user-settings', settingsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
