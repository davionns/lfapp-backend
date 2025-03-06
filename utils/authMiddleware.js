const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'fed3d16f142bb7098c0ac049b761e242418051caed51fda29978990b93a1c7e8dd36f46645a8fdcaaa04a05e100c0ece79ead675e1da97febadcb8f0d8e8075d', (err, user) => {
    if (err) return res.sendStatus(403);
    req.userId = user.userId;
    req.userRole = user.role;
    next();
  });
};
