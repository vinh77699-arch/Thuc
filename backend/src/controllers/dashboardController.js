const { Branch, User, Course, Class, Enrollment, Payment, Attendance, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.stats = async (req, res) => {
  try {
    const branchFilter = req.user.role === 'staff' ? { branch_id: req.user.branch_id } : {};

    const [totalBranches, totalCourses, totalClasses, totalStudents,
      activeEnrollments, pendingEnrollments] = await Promise.all([
      Branch.count({ where: { is_active: true } }),
      Course.count({ where: { is_active: true } }),
      Class.count({ where: { status: 'ongoing', ...branchFilter } }),
      User.count({ where: { role: 'student', is_active: true } }),
      Enrollment.count({ where: { status: 'active' } }),
      Enrollment.count({ where: { status: 'pending' } }),
    ]);

    // Revenue by month (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0');
      const sum = await Payment.sum('amount', {
        where: { paid_at: { [Op.between]: [`${y}-${m}-01`, `${y}-${m}-31`] } },
      });
      months.push({ label: `T${d.getMonth() + 1}`, revenue: sum || 0 });
    }

    res.json({
      totalBranches, totalCourses, totalClasses, totalStudents,
      activeEnrollments, pendingEnrollments, revenueByMonth: months,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
