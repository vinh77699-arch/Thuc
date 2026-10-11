import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Badge, Spinner, Empty } from '../components/UI';
import '../components/UI.css';

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentDash />;
  if (user?.role === 'teacher') return <TeacherDash />;
  return <StaffDash />;
}

/* ── STUDENT ── */
function StudentDash() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => {
    api.get('/enrollments?status=active').then(r => setEnrollments(r.data.data)).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spinner />;
  const debt = enrollments.reduce((s, e) => s + (Number(e.total_amount) - Number(e.paid_amount)), 0);
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div className="page-enter">
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #C0152E 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 22, color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 6px 24px rgba(227,25,55,.3)',
      }}>
        <div>
          <div style={{ fontSize: 13, opacity: .8, marginBottom: 4 }}>Xin chào 👋</div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{user?.name}</div>
          <div style={{ fontSize: 12.5, opacity: .75 }}>Học viên · English Center</div>
        </div>
        <div style={{ fontSize: 56 }}>🎓</div>
      </div>

      <div className="kgrid">
        <div className="kc"><div className="kv">{enrollments.length}</div><div className="kl">Lớp đang học</div></div>
        <div className="kc grn"><div className="kv">94%</div><div className="kl">Tỉ lệ điểm danh</div></div>
        <div className="kc org"><div className="kv" style={{ fontSize: 20 }}>{new Intl.NumberFormat('vi-VN').format(debt)}đ</div><div className="kl">Học phí còn nợ</div></div>
      </div>

      <div className="section-header">
        <h3>Lớp đang học</h3>
        <button className="btn btn-p btn-sm" onClick={() => navigate('/courses')}>+ Đăng ký thêm</button>
      </div>

      {enrollments.length === 0
        ? <Empty icon="📚" text="Chưa có lớp nào. Hãy đăng ký khóa học!" />
        : enrollments.map(e => {
          const pct = e.total_amount ? Math.round(e.paid_amount / e.total_amount * 100) : 0;
          return (
            <div key={e.id} className="card" style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>
                  <span style={{ color: 'var(--primary)', fontFamily: 'var(--fm)' }}>{e.class?.code}</span> — {e.class?.course?.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                  📅 {e.class?.schedule_days?.map(d => days[d]).join(', ')} · {e.class?.start_time}–{e.class?.end_time}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                  💰 {new Intl.NumberFormat('vi-VN').format(e.paid_amount)}đ / {new Intl.NumberFormat('vi-VN').format(e.total_amount)}đ
                </div>
                <div style={{ maxWidth: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--muted)', marginBottom: 3 }}>
                    <span>Đã thanh toán</span><span style={{ fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ background: 'var(--s2)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct < 100 ? 'var(--primary)' : 'var(--green)', borderRadius: 4, transition: 'width .4s' }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                <Badge status={e.status} /><Badge status={e.payment_status} />
                <button className="btn btn-s btn-sm" onClick={() => navigate(`/classes/${e.class_id}`)}>Chi tiết</button>
              </div>
            </div>
          );
        })}
    </div>
  );
}

/* ── TEACHER ── */
function TeacherDash() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  useEffect(() => { api.get('/classes').then(r => setClasses(r.data.data)); }, []);
  return (
    <div className="page-enter">
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #C0152E 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 22, color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 6px 24px rgba(227,25,55,.3)',
      }}>
        <div>
          <div style={{ fontSize: 13, opacity: .8, marginBottom: 4 }}>Xin chào 👋</div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{user?.name}</div>
          <div style={{ fontSize: 12.5, opacity: .75 }}>Giáo viên · English Center</div>
        </div>
        <div style={{ fontSize: 56 }}>📖</div>
      </div>
      <div className="kgrid">
        <div className="kc"><div className="kv">{classes.length}</div><div className="kl">Lớp phụ trách</div></div>
        <div className="kc grn"><div className="kv">{classes.reduce((s, c) => s + (c.enrolled_count || 0), 0)}</div><div className="kl">Tổng học viên</div></div>
      </div>
      <div className="section-header"><h3>Lớp phụ trách</h3></div>
      <div className="tw">
        <table><thead><tr><th>Lớp</th><th>Khóa học</th><th>Lịch học</th><th>Phòng</th><th></th></tr></thead>
        <tbody>{classes.map(c => (
          <tr key={c.id}>
            <td><strong style={{ color: 'var(--primary)', fontFamily: 'var(--fm)' }}>{c.code}</strong></td>
            <td>{c.course?.name}</td>
            <td>{c.schedule_days?.map(d => days[d]).join(', ')} · {c.start_time}–{c.end_time}</td>
            <td>{c.room}</td>
            <td><button className="btn btn-p btn-sm" onClick={() => navigate(`/attendance/${c.id}`)}>✓ Điểm danh</button></td>
          </tr>
        ))}</tbody></table>
      </div>
    </div>
  );
}

/* ── STAFF / ADMIN ── */
function StaffDash() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(r => setStats(r.data));
    api.get('/enrollments?status=pending&limit=5').then(r => setPending(r.data.data));
  }, []);

  useEffect(() => {
    if (!stats || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const W = canvas.offsetWidth || 560, H = 100, dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const vals = stats.revenueByMonth.map(m => m.revenue / 1e6);
    const max = Math.max(...vals, 1);
    const labels = stats.revenueByMonth.map(m => m.label);
    const n = vals.length, bw = Math.min(55, (W - 80) / n - 12), gap = (W - 80) / n;
    ctx.font = `700 11px 'Nunito',sans-serif`; ctx.textAlign = 'center';
    vals.forEach((v, i) => {
      const x = 40 + i * gap + gap / 2, bh = (v / max) * (H - 32), y = H - 22 - bh;
      const isLast = i === vals.length - 1;
      // Bar
      ctx.fillStyle = isLast ? '#E31937' : '#FECDD3';
      ctx.beginPath();
      ctx.roundRect(x - bw / 2, y, bw, bh, [4, 4, 0, 0]);
      ctx.fill();
      // Label bottom
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText(labels[i], x, H - 4);
      // Value top
      if (v > 0) { ctx.fillStyle = isLast ? '#E31937' : '#6B7280'; ctx.fillText(v.toFixed(0) + 'M', x, y - 5); }
    });
  }, [stats]);

  if (!stats) return <Spinner />;
  return (
    <div className="page-enter">
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #8B0020 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 22, color: '#fff',
        boxShadow: '0 6px 24px rgba(227,25,55,.3)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 13, opacity: .8 }}>Dashboard tổng quan</div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 700, marginTop: 4 }}>English Center</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, opacity: .8 }}>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{stats.totalClasses}</div>
          <div>lớp đang mở</div>
        </div>
      </div>

      <div className="kgrid">
        <div className="kc"><div className="kv">{stats.totalClasses}</div><div className="kl">Lớp đang mở</div></div>
        <div className="kc grn"><div className="kv">{stats.totalStudents}</div><div className="kl">Học viên</div></div>
        <div className="kc blu"><div className="kv">{stats.activeEnrollments}</div><div className="kl">Đăng ký active</div></div>
        <div className="kc org"><div className="kv">{stats.pendingEnrollments}</div><div className="kl">Chờ xác nhận</div></div>
      </div>

      {/* Revenue chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>📊 Doanh Thu Theo Tháng</div>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>6 tháng gần nhất</span>
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', height: 100, display: 'block' }} />
      </div>

      <div className="section-header">
        <h3>⏳ Đăng ký chờ xử lý</h3>
        <button className="btn btn-s btn-sm" onClick={() => navigate('/manage/enrollments')}>Xem tất cả →</button>
      </div>

      {pending.length === 0
        ? <Empty icon="✅" text="Không có đăng ký nào đang chờ" />
        : <div className="tw"><table><thead><tr><th>Học viên</th><th>Lớp học</th><th>Ngày ĐK</th><th>TT</th><th>Hành động</th></tr></thead>
          <tbody>{pending.map(e => (
            <tr key={e.id}>
              <td><strong>{e.student?.name}</strong></td>
              <td><span style={{ fontFamily: 'var(--fm)', color: 'var(--primary)' }}>{e.class?.code}</span> · {e.class?.course?.name}</td>
              <td style={{ color: 'var(--muted)' }}>{e.enrolled_at}</td>
              <td><Badge status={e.status} /></td>
              <td><div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-g btn-sm" onClick={() => api.put(`/enrollments/${e.id}/status`, { status: 'active' }).then(() => setPending(p => p.filter(x => x.id !== e.id)))}>✓ Xác nhận</button>
                <button className="btn btn-d btn-sm" onClick={() => api.put(`/enrollments/${e.id}/status`, { status: 'cancelled' }).then(() => setPending(p => p.filter(x => x.id !== e.id)))}>✗</button>
              </div></td>
            </tr>
          ))}</tbody></table></div>}
    </div>
  );
}
