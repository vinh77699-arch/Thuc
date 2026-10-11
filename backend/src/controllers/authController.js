const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Branch } = require('../models');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });

    const user = await User.findOne({
      where: { email },
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }],
    });

    if (!user || !user.is_active)
      return res.status(401).json({ message: 'Email không tồn tại hoặc tài khoản bị khóa' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Mật khẩu không đúng' });

    const token = signToken(user.id);
    const { password: _, ...data } = user.toJSON();
    res.json({ token, user: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }],
  });
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const update = { name, phone };
    if (req.file) update.avatar = `/uploads/avatars/${req.file.filename}`;
    await User.update(update, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);
    const ok = await bcrypt.compare(current_password, user.password);
    if (!ok) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    user.password = await bcrypt.hash(new_password, 12);
    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
