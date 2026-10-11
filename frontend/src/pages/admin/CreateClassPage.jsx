import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import '../../components/UI.css';

const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function CreateClassPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '', course_id: '', branch_id: '', teacher_id: '',
    room: '', start_time: '09:00', end_time: '11:00',
    start_date: '', end_date: '', max_students: 20,
    schedule_days: [2, 4],
  });
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [conflict, setConflict] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data));
    api.get('/branches').then(r => setBranches(r.data));
    api.get('/users?role=teacher&limit=100').then(r => setTeachers(r.data.data));
  }, []);

  const checkConflict = async (f = form) => {
    if (!f.teacher_id || !f.schedule_days.length || !f.start_time || !f.end_time) return;
    setChecking(true);
    try {
      const r = await api.post('/classes/check-conflict', {
        teacher_id: +f.teacher_id, schedule_days: f.schedule_days,
        start_time: f.start_time, end_time: f.end_time,
      });
      setConflict(r.data.conflict ? r.data.class : null);
    } finally { setChecking(false); }
  };

  const update = (key, val) => {
    const next = { ...form, [key]: val };
    setForm(next);
    if (['teacher_id', 'start_time', 'end_time'].includes(key)) checkConflict(next);
  };

  const toggleDay = (d) => {
    const next = form.schedule_days.includes(d)
      ? form.schedule_days.filter(x => x !== d)
      : [...form.schedule_days, d];
    const nextForm = { ...form, schedule_days: next };
    setForm(nextForm);
    checkConflict(nextForm);
  };

  const submit = async () => {
    if (conflict) { toast.error('Không thể tạo lớp: phát hiện trùng lịch dạy!'); return; }
    setSubmitting(true);
    try {
      await api.post('/classes', { ...form, course_id: +form.course_id, branch_id: +form.branch_id, teacher_id: +form.teacher_id || null, max_students: +form.max_students });
      toast.success(`Đã tạo lớp ${form.code} thành công ✓`);
      navigate('/manage/classes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tạo lớp thất bại');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="page-enter">
      <div style={{ display: 'inline-flex', gap: 4, fontSize: 12, color: 'var(--muted)', cursor: 'pointer', marginBottom: 10 }}
        onClick={() => navigate('/manage/classes')}>← Danh sách lớp học</div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>Tạo Lớp Học Mới</h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>Hệ thống kiểm tra trùng lịch tự động khi bạn chọn giáo viên và lịch học</p>
      </div>
      <div className="card" style={{ maxWidth: 700 }}>
        <div className="fgrid2">
          <div className="fg"><label className="fl">Khóa học *</label>
            <select className="fc" value={form.course_id} onChange={e => update('course_id', e.target.value)}>
              <option value="">-- Chọn --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div className="fg"><label className="fl">Chi nhánh *</label>
            <select className="fc" value={form.branch_id} onChange={e => update('branch_id', e.target.value)}>
              <option value="">-- Chọn --</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select></div>
          <div className="fg"><label className="fl">Giáo viên *</label>
            <select className="fc" value={form.teacher_id} onChange={e => update('teacher_id', e.target.value)}>
              <option value="">-- Chọn --</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select></div>
          <div className="fg"><label className="fl">Phòng học *</label>
            <input className="fc" value={form.room} onChange={e => update('room', e.target.value)} placeholder="P.301" /></div>
          <div className="fg"><label className="fl">Giờ bắt đầu *</label>
            <input type="time" className="fc" value={form.start_time} onChange={e => update('start_time', e.target.value)} /></div>
          <div className="fg"><label className="fl">Giờ kết thúc *</label>
            <input type="time" className="fc" value={form.end_time} onChange={e => update('end_time', e.target.value)} /></div>
          <div className="fg"><label className="fl">Ngày khai giảng *</label>
            <input type="date" className="fc" value={form.start_date} onChange={e => update('start_date', e.target.value)} /></div>
          <div className="fg"><label className="fl">Ngày kết thúc *</label>
            <input type="date" className="fc" value={form.end_date} onChange={e => update('end_date', e.target.value)} /></div>
          <div className="fg"><label className="fl">Sĩ số tối đa *</label>
            <input type="number" className="fc" value={form.max_students} onChange={e => update('max_students', e.target.value)} min={1} max={50} /></div>
          <div className="fg"><label className="fl">Mã lớp *</label>
            <input className="fc" value={form.code} onChange={e => update('code', e.target.value)} placeholder="IELTS-06" /></div>
        </div>

        <div className="fg" style={{ marginTop: 4 }}>
          <label className="fl">Ngày học trong tuần *</label>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {dayNames.map((d, i) => (
              <button key={i} type="button" onClick={() => toggleDay(i)} style={{
                width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${form.schedule_days.includes(i) ? 'var(--primary)' : 'var(--border)'}`,
                background: form.schedule_days.includes(i) ? 'var(--primary)' : 'var(--s2)',
                color: form.schedule_days.includes(i) ? '#fff' : 'var(--muted)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{d}</button>
            ))}
          </div>
        </div>

        {checking && <div style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 8 }}>Đang kiểm tra lịch...</div>}
        {conflict && !checking && (
          <div className="alert-err" style={{ marginTop: 8 }}>
            ⚠️ <strong>Phát hiện trùng lịch!</strong> Giáo viên đang dạy lớp <strong>{conflict.code}</strong> ({conflict.course?.name})
            vào {conflict.start_time}–{conflict.end_time}. Hãy chọn giáo viên khác hoặc điều chỉnh lịch.
          </div>
        )}
        {!conflict && !checking && form.teacher_id && form.schedule_days.length > 0 && form.start_time && form.end_time && (
          <div className="alert-ok" style={{ marginTop: 8 }}>✓ Lịch học hợp lệ — không phát hiện xung đột.</div>
        )}

        <div style={{ marginTop: 18, display: 'flex', gap: 9 }}>
          <button className="btn btn-p" onClick={submit} disabled={submitting || !!conflict}>{submitting ? 'Đang tạo...' : 'Tạo lớp học'}</button>
          <button className="btn btn-s" onClick={() => navigate('/manage/classes')}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
