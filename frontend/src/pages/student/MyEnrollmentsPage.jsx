import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Badge, Spinner, Empty } from '../../components/UI';
import '../../components/UI.css';

const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/enrollments').then(r => setEnrollments(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 18 }}><h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>Đăng Ký Của Tôi</h2></div>
      {enrollments.length === 0 ? <Empty icon="📋" text="Chưa có đăng ký nào" /> :
        enrollments.map(e => {
          const pct = e.total_amount ? Math.round(e.paid_amount / e.total_amount * 100) : 0;
          return (
            <div key={e.id} className="card" style={{ marginBottom: 10, display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', marginBottom: 3 }}>
                  {e.class?.code} — {e.class?.course?.name}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                  {e.class?.schedule_days?.map(d => days[d]).join(', ')} · {e.class?.start_time}–{e.class?.end_time} · Ngày ĐK: {e.enrolled_at}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                  {new Intl.NumberFormat('vi-VN').format(e.paid_amount)}đ / {new Intl.NumberFormat('vi-VN').format(e.total_amount)}đ ({pct}%)
                </div>
                <div style={{ maxWidth: 240, marginTop: 5 }}>
                  <div style={{ background: 'var(--s2)', borderRadius: 3, height: 7 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
                <Badge status={e.status} /><Badge status={e.payment_status} />
                <button className="btn btn-s btn-sm" onClick={() => navigate(`/classes/${e.class_id}`)}>Chi tiết</button>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}
