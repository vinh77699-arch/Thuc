const { Enrollment, Class, Course, User, Payment, sequelize } = require('../models');
const { Op } = require('sequelize');

const enrollInclude = [
  { model: User, as: 'student', attributes: ['id', 'name', 'email', 'phone'] },
  {
    model: Class, as: 'class',
    include: [{ model: Course, as: 'course', attributes: ['id', 'name'] }],
    attributes: ['id', 'code', 'room', 'schedule_days', 'start_time', 'end_time'],
  },
  { model: Payment, as: 'payments' },
];

exports.list = async (req, res) => {
  try {
    const { status, class_id, student_id, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (class_id) where.class_id = class_id;
    if (student_id) where.student_id = student_id;
    // Students see only their own
    if (req.user.role === 'student') where.student_id = req.user.id;

    const { rows, count } = await Enrollment.findAndCountAll({
      where, include: enrollInclude,
      order: [['createdAt', 'DESC']],
      limit: +limit, offset: (+page - 1) * +limit,
    });
    res.json({ data: rows, total: count, page: +page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { class_id } = req.body;
    const student_id = req.user.role === 'student' ? req.user.id : req.body.student_id;

    const dup = await Enrollment.findOne({ where: { student_id, class_id, status: { [Op.ne]: 'cancelled' } } });
    if (dup) return res.status(400).json({ message: 'Học viên đã đăng ký lớp này' });

    const cls = await Class.findByPk(class_id, { include: [{ model: Course, as: 'course' }] });
    if (!cls) return res.status(404).json({ message: 'Không tìm thấy lớp học' });

    const enrolled = await Enrollment.count({ where: { class_id, status: { [Op.ne]: 'cancelled' } } });
    if (enrolled >= cls.max_students) return res.status(400).json({ message: 'Lớp học đã đủ chỗ' });

    const enrollment = await Enrollment.create({
      student_id, class_id,
      total_amount: cls.course.tuition_fee,
      enrolled_at: new Date().toISOString().split('T')[0],
    }, { transaction: t });

    await t.commit();
    const result = await Enrollment.findByPk(enrollment.id, { include: enrollInclude });
    res.status(201).json(result);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Enrollment.update({ status }, { where: { id: req.params.id } });
    const e = await Enrollment.findByPk(req.params.id, { include: enrollInclude });
    res.json(e);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.recordPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount, method = 'cash', note } = req.body;
    const enrollment = await Enrollment.findByPk(req.params.id, { transaction: t });
    if (!enrollment) return res.status(404).json({ message: 'Không tìm thấy đăng ký' });

    await Payment.create({
      enrollment_id: enrollment.id, amount, method,
      paid_at: new Date().toISOString().split('T')[0], note,
    }, { transaction: t });

    const newPaid = Number(enrollment.paid_amount) + Number(amount);
    const paymentStatus = newPaid >= Number(enrollment.total_amount) ? 'paid'
      : newPaid > 0 ? 'partial' : 'unpaid';

    await enrollment.update({ paid_amount: newPaid, payment_status: paymentStatus }, { transaction: t });
    await t.commit();

    const result = await Enrollment.findByPk(enrollment.id, { include: enrollInclude });
    res.json(result);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};
