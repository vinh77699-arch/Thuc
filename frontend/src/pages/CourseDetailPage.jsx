import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Badge, Spinner } from '../components/UI';
import '../components/UI.css';

const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.get(`/courses/${id}`).then(r => setCourse(r.data));
    api.get(`/classes?course_id=${id}`).then(r => setClasses(r.data.data));
  }, [id]);

  if (!course) return <Spinner />;

  return (
    <div className="page-enter">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)', cursor: 'pointer', marginBottom: 10 }}
        onClick={() => navigate('/courses')}>← Danh sách khóa học</div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{course.name}</h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>{course.description} · {course.duration_weeks} tuần · {new Intl.NumberFormat('vi-VN').format(course.tuition_fee)}đ</p>
      </div>
      <div className="section-header"><h3>Lớp học đang mở</h3></div>
      <div className="tw">
        <table><thead><tr><th>Mã lớp</th><th>Chi nhánh</th><th>Giáo viên</th><th>Lịch học</th><th>Chỗ trống</th><th>TT</th><th></th></tr></thead>
        <tbody>{classes.map(c => {
          const spots = c.max_students - (c.enrolled_count || 0);
          return (
            <tr key={c.id}>
              <td><strong style={{ fontFamily: 'var(--fm)' }}>{c.code}</strong></td>
              <td>{c.branch?.name}</td>
              <td>{c.teacher?.name || '–'}</td>
              <td>{c.schedule_days?.map(d => dayNames[d]).join(', ')}<br /><small style={{ color: 'var(--muted)' }}>{c.start_time}–{c.end_time}</small></td>
              <td><span style={{ fontWeight: 700, color: spots > 3 ? 'var(--green)' : spots > 0 ? 'var(--amber)' : 'var(--red)' }}>{spots > 0 ? spots : 'Hết'}</span>/{c.max_students}</td>
              <td><Badge status={c.status} /></td>
              <td><button className="btn btn-p btn-sm" onClick={() => navigate(`/classes/${c.id}`)}>Chi tiết →</button></td>
            </tr>
          );
        })}</tbody></table>
      </div>
    </div>
  );
}
