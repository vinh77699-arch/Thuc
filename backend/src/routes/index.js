const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize, branchScope } = require('../middleware/auth');

const authC = require('../controllers/authController');
const userC = require('../controllers/userController');
const branchC = require('../controllers/branchController');
const courseC = require('../controllers/courseController');
const classC = require('../controllers/classController');
const enrollC = require('../controllers/enrollmentController');
const attC = require('../controllers/attendanceController');
const dashC = require('../controllers/dashboardController');

// Multer for avatar uploads
const storage = multer.diskStorage({
  destination: 'uploads/avatars',
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// ── AUTH ──────────────────────────────────────────────
router.post('/auth/login', authC.login);
router.get('/auth/me', authenticate, authC.me);
router.put('/auth/profile', authenticate, upload.single('avatar'), authC.updateProfile);
router.put('/auth/password', authenticate, authC.changePassword);

// ── DASHBOARD ─────────────────────────────────────────
router.get('/dashboard', authenticate, authorize('admin', 'staff'), branchScope, dashC.stats);

// ── BRANCHES ─────────────────────────────────────────
router.get('/branches', authenticate, branchC.list);
router.get('/branches/:id', authenticate, branchC.getOne);
router.post('/branches', authenticate, authorize('admin'), branchC.create);
router.put('/branches/:id', authenticate, authorize('admin'), branchC.update);
router.delete('/branches/:id', authenticate, authorize('admin'), branchC.remove);

// ── COURSES ─────────────────────────────────────────── (public read)
router.get('/courses', courseC.list);
router.get('/courses/:id', courseC.getOne);
router.post('/courses', authenticate, authorize('admin', 'staff'), courseC.create);
router.put('/courses/:id', authenticate, authorize('admin', 'staff'), courseC.update);
router.delete('/courses/:id', authenticate, authorize('admin'), courseC.remove);

// ── CLASSES ───────────────────────────────────────────
router.get('/classes', authenticate, branchScope, classC.list);
router.get('/classes/:id', authenticate, classC.getOne);
router.get('/classes/:id/students', authenticate, classC.students);
router.post('/classes/check-conflict', authenticate, authorize('admin', 'staff'), classC.checkConflict);
router.post('/classes', authenticate, authorize('admin', 'staff'), classC.create);
router.put('/classes/:id', authenticate, authorize('admin', 'staff'), classC.update);

// ── ENROLLMENTS ───────────────────────────────────────
router.get('/enrollments', authenticate, branchScope, enrollC.list);
router.post('/enrollments', authenticate, enrollC.create);
router.put('/enrollments/:id/status', authenticate, authorize('admin', 'staff'), enrollC.updateStatus);
router.post('/enrollments/:id/payment', authenticate, authorize('admin', 'staff'), enrollC.recordPayment);

// ── ATTENDANCE ────────────────────────────────────────
router.get('/attendance/:class_id/:date', authenticate, attC.getByClassDate);
router.post('/attendance', authenticate, authorize('admin', 'staff', 'teacher'), attC.save);
router.get('/attendance/student/:student_id', authenticate, attC.studentHistory);
router.get('/attendance/summary/:class_id/:student_id', authenticate, attC.summary);

// ── USERS ─────────────────────────────────────────────
router.get('/users', authenticate, authorize('admin', 'staff'), branchScope, userC.list);
router.post('/users', authenticate, authorize('admin'), userC.create);
router.put('/users/:id', authenticate, authorize('admin'), userC.update);
router.delete('/users/:id', authenticate, authorize('admin'), userC.remove);

module.exports = router;
