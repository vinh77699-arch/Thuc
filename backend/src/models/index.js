const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// ── BRANCH ────────────────────────────────────────────
const Branch = sequelize.define('Branch', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  address: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(100) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'branches', timestamps: true });

// ── USER ──────────────────────────────────────────────
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'staff', 'teacher', 'student'), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  avatar: { type: DataTypes.STRING(255) },
  branch_id: { type: DataTypes.INTEGER, references: { model: 'branches', key: 'id' } },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'users', timestamps: true });

// ── COURSE ────────────────────────────────────────────
const Course = sequelize.define('Course', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  level: { type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced', 'Kids'), allowNull: false },
  description: { type: DataTypes.TEXT },
  duration_weeks: { type: DataTypes.INTEGER, allowNull: false },
  tuition_fee: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'courses', timestamps: true });

// ── CLASS ─────────────────────────────────────────────
const Class = sequelize.define('Class', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  branch_id: { type: DataTypes.INTEGER, allowNull: false },
  teacher_id: { type: DataTypes.INTEGER },
  room: { type: DataTypes.STRING(20), allowNull: false },
  // JSON array of weekday numbers [1-6] (1=Mon, 6=Sat)
  schedule_days: { type: DataTypes.JSON, allowNull: false },
  start_time: { type: DataTypes.STRING(5), allowNull: false },
  end_time: { type: DataTypes.STRING(5), allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  max_students: { type: DataTypes.INTEGER, defaultValue: 20 },
  status: { type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'), defaultValue: 'upcoming' },
}, { tableName: 'classes', timestamps: true });

// ── ENROLLMENT ────────────────────────────────────────
const Enrollment = sequelize.define('Enrollment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  class_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'), defaultValue: 'pending' },
  payment_status: { type: DataTypes.ENUM('unpaid', 'partial', 'paid'), defaultValue: 'unpaid' },
  paid_amount: { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  total_amount: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  enrolled_at: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  note: { type: DataTypes.TEXT },
}, { tableName: 'enrollments', timestamps: true });

// ── PAYMENT ───────────────────────────────────────────
const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  enrollment_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  method: { type: DataTypes.ENUM('cash', 'transfer', 'card'), defaultValue: 'cash' },
  paid_at: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  note: { type: DataTypes.TEXT },
}, { tableName: 'payments', timestamps: true });

// ── ATTENDANCE ────────────────────────────────────────
const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('present', 'absent', 'late'), defaultValue: 'absent' },
  note: { type: DataTypes.TEXT },
}, { tableName: 'attendance', timestamps: false });

// ── REVIEW ────────────────────────────────────────────
const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.TINYINT, allowNull: false },
  comment: { type: DataTypes.TEXT },
}, { tableName: 'reviews', timestamps: true });

// ── ASSOCIATIONS ──────────────────────────────────────
User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Branch.hasMany(User, { foreignKey: 'branch_id' });

Class.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Class.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Class.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });
Course.hasMany(Class, { foreignKey: 'course_id' });
Branch.hasMany(Class, { foreignKey: 'branch_id' });

Enrollment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Enrollment.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Class.hasMany(Enrollment, { foreignKey: 'class_id' });
User.hasMany(Enrollment, { foreignKey: 'student_id' });

Payment.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });
Enrollment.hasMany(Payment, { foreignKey: 'enrollment_id', as: 'payments' });

Attendance.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Attendance.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Class.hasMany(Attendance, { foreignKey: 'class_id' });

Review.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Review.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

module.exports = { sequelize, Branch, User, Course, Class, Enrollment, Payment, Attendance, Review };
