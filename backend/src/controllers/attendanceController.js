const { Attendance, User, Class, Enrollment, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getByClassDate = async (req, res) => {
  try {
    const { class_id, date } = req.params;
    const enrollments = await Enrollment.findAll({
      where: { class_id, status: { [Op.ne]: 'cancelled' } },
      include: [{ model: User, as: 'student', attributes: ['id', 'name'] }],
    });

    const records = await Attendance.findAll({ where: { class_id, date } });
    const attMap = {};
    records.forEach(r => { attMap[r.student_id] = r; });

    const result = enrollments.map(e => ({
      student_id: e.student_id,
      student_name: e.student.name,
      attendance: attMap[e.student_id] || { status: 'absent', note: '' },
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.save = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { class_id, date, records } = req.body;
    // Upsert each record
    for (const r of records) {
      const existing = await Attendance.findOne({ where: { class_id, student_id: r.student_id, date } });
      if (existing) {
        await existing.update({ status: r.status, note: r.note || '' }, { transaction: t });
      } else {
        await Attendance.create({ class_id, student_id: r.student_id, date, status: r.status, note: r.note || '' }, { transaction: t });
      }
    }
    await t.commit();
    res.json({ message: 'Lưu điểm danh thành công' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.studentHistory = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { class_id } = req.query;
    const where = { student_id };
    if (class_id) where.class_id = class_id;
    const records = await Attendance.findAll({
      where, order: [['date', 'DESC']],
      include: [{ model: Class, as: 'class', attributes: ['id', 'code'] }],
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.summary = async (req, res) => {
  try {
    const { class_id, student_id } = req.params;
    const records = await Attendance.findAll({ where: { class_id, student_id } });
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    res.json({ total, present, late, absent, rate: total ? Math.round((present + late) / total * 100) : 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
