const bcrypt = require('bcryptjs');
const { User, Branch } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const { role, branch_id, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (branch_id) where.branch_id = branch_id;
    else if (req.branchId) where.branch_id = req.branchId;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit: +limit,
      offset: (+page - 1) * +limit,
    });
    res.json({ data: rows, total: count, page: +page, limit: +limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, password, role, phone, branch_id } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email đã được sử dụng' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, role, phone, branch_id });
    const { password: _, ...data } = user.toJSON();
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, phone, branch_id, is_active, password } = req.body;
    const update = { name, phone, branch_id, is_active };
    if (password) update.password = await bcrypt.hash(password, 12);
    await User.update(update, { where: { id: req.params.id } });
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await User.update({ is_active: false }, { where: { id: req.params.id } });
    res.json({ message: 'Đã khóa tài khoản' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
