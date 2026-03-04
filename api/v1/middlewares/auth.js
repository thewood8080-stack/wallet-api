const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authString = req.headers.authorization;
    if (!authString || typeof authString !== 'string') {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    const token = authString.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: 'Server configuration error' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
