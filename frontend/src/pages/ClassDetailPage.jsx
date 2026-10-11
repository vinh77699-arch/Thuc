import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Badge, Spinner } from '../components/UI';
import '../components/UI.css';

const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cls, setCls] = useState(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    api.get(`/classes/${id}`).then(r => setCls(r.data));
    if (user?.role === 'student') {
      api.get(`/enrollments?student_id=${user.id}&class_id=${id}`)
        .then(r => setEnrolled(r.data.data.some(e => e.status !== 'cancelled')));
    }
  }, [id]);

  const doEnroll = async () => {
    try {
      await api.post('/enrollments', { class_id: id });
      toast.success('Đăng ký thành công! Vui lòng chờ xác nhận.');
      setEnrolled(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  if (!cls) return <Spinner />;
  const spots = cls.max_students - (cls.enrolled_count || 0);

  return (
    <div className="page-enter">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)', cursor: 'pointer', marginBottom: 10 }}
        onClick={() => navigate(`/courses/${cls.course?.id}`)}>← {cls.course?.name}</div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{cls.code}</h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>{cls.course?.name} · {cls.branch?.name}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 18 }}>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 12, letterSpacing: '.05em' }}>THÔNG TIN LỚP HỌC</div>
          {[
            ['Giáo viên', cls.teacher?.name || 'Chưa phân công'],
            ['Phòng học', cls.room],
            ['Lịch học', `${cls.schedule_days?.map(d => dayNames[d]).join(', ')} · ${cls.start_time}–${cls.end_time}`],
            ['Khai giảng', cls.start_date],
            ['Kết thúc', cls.end_date],
            ['Học phí', new Intl.NumberFormat('vi-VN').format(cls.course?.tuition_fee) + 'đ'],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>{l}</span>
              <span style={{ fontWeight: 600, color: l === 'Học phí' ? 'var(--primary)' : 'var(--ink)' }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: spots > 3 ? 'var(--green)' : spots > 0 ? 'var(--amber)' : 'var(--red)' }}>{spots > 0 ? spots : 'Hết'}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>chỗ trống / {cls.max_students}</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ background: 'var(--s2)', borderRadius: 3, height: 7 }}>
              <div style={{ width: `${Math.round((cls.enrolled_count || 0) / cls.max_students * 100)}%`, height: '100%', background: spots > 3 ? 'var(--green)' : 'var(--amber)', borderRadius: 3 }} />
            </div>
          </div>
          {user?.role === 'student' && (
            enrolled
              ? <div style={{ padding: 9, background: 'var(--green-bg)', borderRadius: 'var(--r)', color: 'var(--green)', fontSize: 12.5, fontWeight: 600 }}>✓ Đã đăng ký lớp này</div>
              : spots > 0
                ? <button className="btn btn-p btn-full" onClick={doEnroll}>📝 Đăng ký học</button>
                : <button className="btn btn-s btn-full" disabled>Hết chỗ</button>
          )}
          <div style={{ marginTop: 10 }}><Badge status={cls.status} /></div>
        </div>
      </div>
    </div>
  );
}
