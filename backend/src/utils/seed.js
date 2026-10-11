require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Branch, User, Course, Class, Enrollment, Payment, Attendance } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('🗄️  Database đã được tạo lại');

  // Branches
  const [q1, q3] = await Branch.bulkCreate([
    { name: 'Chi nhánh Quận 1', address: '123 Lê Lợi, Q.1, TP.HCM', phone: '028-3821-1234', email: 'q1@englishcenter.vn' },
    { name: 'Chi nhánh Quận 3', address: '45 Võ Văn Tần, Q.3, TP.HCM', phone: '028-3932-5678', email: 'q3@englishcenter.vn' },
  ]);

  // Users
  const pass = async (p) => bcrypt.hash(p, 12);
  const [admin, staff1, t1, t2, t3, s1, s2, s3, s4, s5] = await User.bulkCreate([
    { name: 'Trần Quốc Bảo', email: 'admin@englishcenter.vn', password: await pass('admin123'), role: 'admin', phone: '0901234567' },
    { name: 'Nguyễn Văn Toàn', email: 'staff1@englishcenter.vn', password: await pass('staff123'), role: 'staff', branch_id: q1.id, phone: '0902345678' },
    { name: 'Nguyễn Thị Lan', email: 'teacher1@englishcenter.vn', password: await pass('teacher123'), role: 'teacher', branch_id: q1.id, phone: '0903456789' },
    { name: 'Trần Văn Hùng', email: 'teacher2@englishcenter.vn', password: await pass('teacher123'), role: 'teacher', branch_id: q1.id, phone: '0904567890' },
    { name: 'Lê Thị Mai', email: 'teacher3@englishcenter.vn', password: await pass('teacher123'), role: 'teacher', branch_id: q3.id, phone: '0905678901' },
    { name: 'Phạm Thị Bích', email: 'student1@englishcenter.vn', password: await pass('123456'), role: 'student', phone: '0906789012' },
    { name: 'Lê Văn Cường', email: 'student2@englishcenter.vn', password: await pass('123456'), role: 'student', phone: '0907890123' },
    { name: 'Trần Thị Dung', email: 'student3@englishcenter.vn', password: await pass('123456'), role: 'student', phone: '0908901234' },
    { name: 'Nguyễn Anh Đức', email: 'student4@englishcenter.vn', password: await pass('123456'), role: 'student', phone: '0909012345' },
    { name: 'Hoàng Thị Hoa', email: 'student5@englishcenter.vn', password: await pass('123456'), role: 'student', phone: '0900123456' },
  ]);

  // Courses
  const [c1, c2, c3, c4] = await Course.bulkCreate([
    { name: 'Giao Tiếp Cơ Bản', level: 'Beginner', description: 'Tập trung giao tiếp hằng ngày, phản xạ ngôn ngữ tự nhiên.', duration_weeks: 12, tuition_fee: 3500000 },
    { name: 'IELTS Band 5–6', level: 'Intermediate', description: 'Luyện thi toàn diện 4 kỹ năng Nghe, Nói, Đọc, Viết.', duration_weeks: 20, tuition_fee: 6000000 },
    { name: 'TOEIC 450+', level: 'Intermediate', description: 'Ngữ pháp, từ vựng và kỹ thuật làm bài thi TOEIC.', duration_weeks: 16, tuition_fee: 5000000 },
    { name: 'Tiếng Anh Trẻ Em', level: 'Kids', description: 'Chương trình học tương tác, phù hợp học sinh 7–12 tuổi.', duration_weeks: 24, tuition_fee: 4000000 },
  ]);

  // Classes
  const [cl1, cl2, cl3, cl4, cl5] = await Class.bulkCreate([
    { code: 'IELTS-01', course_id: c2.id, branch_id: q1.id, teacher_id: t1.id, room: 'P.201', schedule_days: [2, 4], start_time: '09:00', end_time: '11:00', start_date: '2026-09-01', end_date: '2027-01-31', max_students: 15, status: 'ongoing' },
    { code: 'GIAO-04', course_id: c1.id, branch_id: q1.id, teacher_id: t2.id, room: 'P.101', schedule_days: [1, 3], start_time: '07:00', end_time: '09:00', start_date: '2026-09-05', end_date: '2026-12-05', max_students: 20, status: 'ongoing' },
    { code: 'TOEC-03', course_id: c3.id, branch_id: q1.id, teacher_id: t1.id, room: 'P.202', schedule_days: [5, 6], start_time: '14:00', end_time: '16:00', start_date: '2026-09-20', end_date: '2027-01-20', max_students: 18, status: 'upcoming' },
    { code: 'KIDS-02', course_id: c4.id, branch_id: q3.id, teacher_id: t3.id, room: 'P.103', schedule_days: [2, 4], start_time: '16:30', end_time: '18:00', start_date: '2026-09-02', end_date: '2027-03-02', max_students: 12, status: 'ongoing' },
    { code: 'GIAO-05', course_id: c1.id, branch_id: q1.id, teacher_id: t2.id, room: 'P.102', schedule_days: [2, 4], start_time: '18:00', end_time: '20:00', start_date: '2026-10-01', end_date: '2027-01-01', max_students: 20, status: 'upcoming' },
  ]);

  // Enrollments
  const [e1, e2, e3] = await Enrollment.bulkCreate([
    { student_id: s1.id, class_id: cl1.id, status: 'active', payment_status: 'partial', paid_amount: 3000000, total_amount: 6000000, enrolled_at: '2026-09-02' },
    { student_id: s1.id, class_id: cl2.id, status: 'completed', payment_status: 'paid', paid_amount: 3500000, total_amount: 3500000, enrolled_at: '2026-06-01' },
    { student_id: s2.id, class_id: cl1.id, status: 'active', payment_status: 'paid', paid_amount: 6000000, total_amount: 6000000, enrolled_at: '2026-09-01' },
    { student_id: s3.id, class_id: cl2.id, status: 'active', payment_status: 'unpaid', paid_amount: 0, total_amount: 3500000, enrolled_at: '2026-09-05' },
    { student_id: s4.id, class_id: cl4.id, status: 'pending', payment_status: 'unpaid', paid_amount: 0, total_amount: 4000000, enrolled_at: '2026-09-10' },
  ]);

  // Payments
  await Payment.bulkCreate([
    { enrollment_id: e1.id, amount: 3000000, method: 'cash', paid_at: '2026-09-02', note: 'Đặt cọc 50%' },
    { enrollment_id: e2.id, amount: 3500000, method: 'transfer', paid_at: '2026-06-01', note: 'Thanh toán toàn bộ' },
    { enrollment_id: e3.id, amount: 6000000, method: 'transfer', paid_at: '2026-09-01' },
  ]);

  // Attendance samples
  const dates = ['2026-09-03', '2026-09-08', '2026-09-10', '2026-09-15'];
  const students = [s1, s2, s3];
  const statuses = ['present', 'present', 'absent', 'late', 'present', 'present'];
  let i = 0;
  for (const date of dates) {
    for (const s of students) {
      await Attendance.create({ class_id: cl1.id, student_id: s.id, date, status: statuses[i % 6] });
      i++;
    }
  }

  console.log('✅ Dữ liệu mẫu đã được tạo thành công!');
  console.log('\n📋 Tài khoản đăng nhập:');
  console.log('  Admin:   admin@englishcenter.vn / admin123');
  console.log('  Staff:   staff1@englishcenter.vn / staff123');
  console.log('  Teacher: teacher1@englishcenter.vn / teacher123');
  console.log('  Student: student1@englishcenter.vn / 123456');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
