import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Badge, Spinner } from '../components/UI';
import '../components/UI.css';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const navigate = useNavigate();

  useEffect(() => { api.get('/courses').then(r => setCourses(r.data)); }, []);

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) && (!level || c.level === level)
  );

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>Khóa Học & Lớp Học</h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>Chọn khóa học phù hợp và đăng ký lớp học</p>
      </div>
      <div className="fb">
        <input className="fc" style={{ width: 200 }} placeholder="🔍 Tìm khóa học..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="fc" style={{ width: 150 }} value={level} onChange={e => setLevel(e.target.value)}>
          <option value="">Tất cả trình độ</option>
          {['Beginner', 'Intermediate', 'Advanced', 'Kids'].map(l => <option key={l}>{l}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
        {filtered.map(cr => (
          <div key={cr.id} className="card" style={{ cursor: 'pointer', transition: '.15s', padding: 0, overflow: 'hidden' }}
            onClick={() => navigate(`/courses/${cr.id}`)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-light)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 9.5, fontFamily: 'var(--fm)', color: 'var(--primary)', background: 'var(--primary-faint)', padding: '2px 7px', display: 'inline-block', marginBottom: 7, borderRadius: 2 }}>{cr.level}</span>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{cr.name}</h3>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>{cr.description}</p>
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--muted)', alignItems: 'center' }}>
              <span>{cr.duration_weeks} tuần</span>
              <span style={{ fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                {new Intl.NumberFormat('vi-VN').format(cr.tuition_fee)}đ
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
