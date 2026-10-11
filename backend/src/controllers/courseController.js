const { Course, Class } = require('../models');

exports.list = async (req, res) => {
  try {
    const { level } = req.query;
    const where = { is_active: true };
    if (level) where.level = level;
    const courses = await Course.findAll({ where, order: [['name', 'ASC']] });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const c = await Course.findByPk(req.params.id, {
      include: [{ model: Class, as: undefined }],
    });
    if (!c) return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const c = await Course.create(req.body);
    res.status(201).json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Course.update(req.body, { where: { id: req.params.id } });
    const c = await Course.findByPk(req.params.id);
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Course.update({ is_active: false }, { where: { id: req.params.id } });
    res.json({ message: 'Đã xóa khóa học' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
