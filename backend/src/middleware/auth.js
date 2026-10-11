const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ message: 'Không có token xác thực' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user || !user.is_active)
      return res.status(401).json({ message: 'Tài khoản không hợp lệ' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Không có quyền thực hiện hành động này' });
  next();
};

// Staff scoped to their branch_id; admin sees all
const branchScope = (req, res, next) => {
  if (req.user.role === 'staff') req.branchId = req.user.branch_id;
  next();
};

module.exports = { authenticate, authorize, branchScope };
