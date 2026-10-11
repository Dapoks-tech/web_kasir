const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

const managerOnly = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Akses ditolak. Manager only.' });
  }
  next();
};

module.exports = { auth, managerOnly };
