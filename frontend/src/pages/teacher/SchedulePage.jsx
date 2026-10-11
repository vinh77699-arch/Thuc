import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from '../../components/UI';
import '../../components/UI.css';

const dayLabels = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export default function SchedulePage() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { api.get('/classes').then(r => setClasses(r.data.data)); }, []);

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 18 }}><h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>Lịch Dạy Của Tôi</h2></div>
      <div className="card">
        {[1, 2, 3, 4, 5, 6, 0].map(day => {
          const dc = classes.filter(c => c.schedule_days?.includes(day));
          if (!dc.length) return null;
          return (
            <div key={day} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ width: 72, fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', flexShrink: 0 }}>{dayLabels[day]}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {dc.map(c => (
                  <div key={c.id} style={{ background: 'var(--primary-faint)', border: '1px solid var(--primary-faint2)', padding: '6px 12px', borderRadius: 'var(--r)', cursor: 'pointer' }}
                    onClick={() => navigate(`/attendance/${c.id}`)}>
                    <div style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--ink)' }}>{c.code}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.start_time}–{c.end_time} · {c.room}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
