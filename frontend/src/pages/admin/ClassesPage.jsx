import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Badge, Spinner, Empty } from '../../components/UI';
import '../../components/UI.css';

const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { api.get('/classes?limit=100').then(r => setClasses(r.data.data)).finally(() => setLoading(false)); }, []);

  const filtered = classes.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || c.course?.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Spinner />;
  return (
    <div className="page-enter">
      <div style={{ marginBottom: 18 }}><h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>Quản Lý Lớp Học</h2></div>
      <div className="fb">
        <input className="fc" style={{ width: 200 }} placeholder="🔍 Tìm lớp..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="spacer" />
        <button className="btn btn-p" onClick={() => navigate('/manage/classes/new')}>+ Tạo lớp mới</button>
      </div>
      {filtered.length === 0 ? <Empty /> :
        <div className="tw">
          <table><thead><tr><th>Mã lớp</th><th>Khóa học</th><th>Chi nhánh</th><th>Giáo viên</th><th>Lịch học</th><th>Sĩ số</th><th>TT</th><th></th></tr></thead>
          <tbody>{filtered.map(c => (
            <tr key={c.id}>
              <td><strong style={{ fontFamily: 'var(--fm)' }}>{c.code}</strong></td>
              <td>{c.course?.name}<br /><small style={{ color: 'var(--muted)' }}>{c.course?.level}</small></td>
              <td>{c.branch?.name}</td>
              <td>{c.teacher?.name || '–'}</td>
              <td>{c.schedule_days?.map(d => days[d]).join(', ')}<br /><small style={{ color: 'var(--muted)' }}>{c.start_time}–{c.end_time}</small></td>
              <td style={{ fontVariantNumeric: 'tabular-nums' }}>{c.enrolled_count || 0}/{c.max_students}</td>
              <td><Badge status={c.status} /></td>
              <td style={{ display: 'flex', gap: 5 }}>
                <button className="btn btn-s btn-sm" onClick={() => navigate(`/classes/${c.id}`)}>Xem</button>
                <button className="btn btn-p btn-sm" onClick={() => navigate(`/attendance/${c.id}`)}>Điểm danh</button>
              </td>
            </tr>
          ))}</tbody></table>
        </div>}
    </div>
  );
}
