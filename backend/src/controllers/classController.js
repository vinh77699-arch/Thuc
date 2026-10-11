const { Class, Course, Branch, User, Enrollment, sequelize } = require('../models');
const { Op } = require('sequelize');

const classInclude = [
  { model: Course, as: 'course', attributes: ['id', 'name', 'level', 'tuition_fee'] },
  { model: Branch, as: 'branch', attributes: ['id', 'name'] },
  { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
];

exports.list = async (req, res) => {
  try {
    const { branch_id, course_id, status, teacher_id, page = 1, limit = 20 } = req.query;
    const where = {};
    if (branch_id) where.branch_id = branch_id;
    else if (req.branchId) where.branch_id = req.branchId;
    if (course_id) where.course_id = course_id;
    if (status) where.status = status;
    if (teacher_id) where.teacher_id = teacher_id;

    const { rows, count } = await Class.findAndCountAll({
      where, include: classInclude,
      order: [['createdAt', 'DESC']],
      limit: +limit, offset: (+page - 1) * +limit,
    });
    res.json({ data: rows, total: count, page: +page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const c = await Class.findByPk(req.params.id, { include: classInclude });
    if (!c) return res.status(404).json({ message: 'Không tìm thấy lớp học' });
    const enrolled = await Enrollment.count({ where: { class_id: c.id, status: { [Op.ne]: 'cancelled' } } });
    res.json({ ...c.toJSON(), enrolled_count: enrolled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Schedule conflict detection
const hasConflict = async (teacherId, days, startTime, endTime, excludeId = null) => {
  const where = { teacher_id: teacherId, status: { [Op.ne]: 'cancelled' } };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const existing = await Class.findAll({ where });
  return existing.find(cls => {
    const shared = cls.schedule_days.filter(d => days.includes(d));
    if (!shared.length) return false;
    return startTime < cls.end_time && cls.start_time < endTime;
  }) || null;
};

exports.checkConflict = async (req, res) => {
  try {
    const { teacher_id, schedule_days, start_time, end_time, exclude_id } = req.body;
    const conflict = await hasConflict(teacher_id, schedule_days, start_time, end_time, exclude_id);
    if (conflict) {
      const c = await Class.findByPk(conflict.id, { include: [{ model: Course, as: 'course' }] });
      return res.json({ conflict: true, class: c });
    }
    res.json({ conflict: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { code, course_id, branch_id, teacher_id, room, schedule_days, start_time, end_time, start_date, end_date, max_students } = req.body;

    if (teacher_id) {
      const conflict = await hasConflict(teacher_id, schedule_days, start_time, end_time);
      if (conflict) return res.status(400).json({ message: 'Giáo viên bị trùng lịch dạy', conflict_class_id: conflict.id });
    }

    const cls = await Class.create({ code, course_id, branch_id, teacher_id, room, schedule_days, start_time, end_time, start_date, end_date, max_students });
    const result = await Class.findByPk(cls.id, { include: classInclude });
    res.status(201).json(result);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'Mã lớp đã tồn tại' });
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { teacher_id, schedule_days, start_time, end_time } = req.body;
    if (teacher_id && schedule_days && start_time && end_time) {
      const conflict = await hasConflict(teacher_id, schedule_days, start_time, end_time, req.params.id);
      if (conflict) return res.status(400).json({ message: 'Giáo viên bị trùng lịch dạy' });
    }
    await Class.update(req.body, { where: { id: req.params.id } });
    const result = await Class.findByPk(req.params.id, { include: classInclude });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.students = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { class_id: req.params.id, status: { [Op.ne]: 'cancelled' } },
      include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }],
    });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
