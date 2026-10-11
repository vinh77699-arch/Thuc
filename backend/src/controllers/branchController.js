const { Branch, User, Class } = require('../models');

exports.list = async (req, res) => {
  try {
    const branches = await Branch.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const b = await Branch.findByPk(req.params.id);
    if (!b) return res.status(404).json({ message: 'Không tìm thấy chi nhánh' });
    res.json(b);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const b = await Branch.create(req.body);
    res.status(201).json(b);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Branch.update(req.body, { where: { id: req.params.id } });
    const b = await Branch.findByPk(req.params.id);
    res.json(b);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Branch.update({ is_active: false }, { where: { id: req.params.id } });
    res.json({ message: 'Đã xóa chi nhánh' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
