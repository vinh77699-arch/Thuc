import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Spinner } from '../../components/UI';
import '../../components/UI.css';

const STATUS_OPTS = [['present', 'Có mặt', 'p'], ['absent', 'Vắng', 'a'], ['late', 'Trễ', 'l']];
const STATUS_STYLE = {
  p: { border: 'var(--green)', bg: 'var(--green-bg)', color: 'var(--green)' },
  a: { border: 'var(--red)', bg: 'var(--red-bg)', color: 'var(--red)' },
  l: { border: 'var(--amber)', bg: 'var(--amber-bg)', color: 'var(--amber)' },
};

export default function AttendancePage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);

  useEffect(() => { api.get(`/classes/${classId}`).then(r => setCls(r.data)); }, [classId]);

  useEffect(() => {
    if (!classId || !date) return;
    api.get(`/attendance/${classId}/${date}`).then(r => {
      setRecords(r.data.map(s => ({ student_id: s.student_id, student_name: s.student_name, status: s.attendance?.status || 'absent' })));
    });
  }, [classId, date]);

  const setStatus = (sid, status) => setRecords(r => r.map(s => s.student_id === sid ? { ...s, status } : s));

  const save = async () => {
    try {
      await api.post('/attendance', { class_id: +classId, date, records });
      toast.success(`Đã lưu điểm danh lớp ${cls?.code} ✓`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu điểm danh');
    }
  };

  if (!cls) return <Spinner />;

  return (
    <div className="page-enter">
      <div style={{ display: 'inline-flex', gap: 4, fontSize: 12, color: 'var(--muted)', cursor: 'pointer', marginBottom: 10 }}
        onClick={() => navigate(-1)}>← Quay lại</div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>Điểm Danh — {cls.code}</h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>{cls.course?.name}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
        <label className="fl" style={{ margin: 0, whiteSpace: 'nowrap' }}>Buổi học:</label>
        <input type="date" className="fc" style={{ width: 160 }} value={date} onChange={e => setDate(e.target.value)} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{records.length} học viên</span>
      </div>

      {records.length === 0
        ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Không có học viên nào</div>
        : records.map(s => (
          <div key={s.student_id} style={{
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center',
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
            padding: '10px 13px', marginBottom: 7,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{s.student_name}</div>
              <small style={{ color: 'var(--muted)' }}>HV-{String(s.student_id).padStart(4, '0')}</small>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUS_OPTS.map(([val, lb, k]) => {
                const active = s.status === val;
                const st = STATUS_STYLE[k];
                return (
                  <button key={val} onClick={() => setStatus(s.student_id, val)} style={{
                    padding: '4px 9px', border: `1.5px solid ${active ? `var(${st.border.slice(4, -1)})` : 'var(--border)'}`,
                    borderRadius: 'var(--r)', background: active ? `var(${st.bg.slice(4, -1)})` : 'transparent',
                    color: active ? `var(${st.color.slice(4, -1)})` : 'var(--muted)',
                    fontWeight: active ? 600 : 400, fontSize: 11.5, cursor: 'pointer', fontFamily: 'var(--fu)',
                    transition: '.1s',
                  }}>{lb}</button>
                );
              })}
            </div>
          </div>
        ))}

      {records.length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', gap: 9 }}>
          <button className="btn btn-p" onClick={save}>💾 Lưu điểm danh</button>
          <button className="btn btn-s" onClick={() => navigate(-1)}>Hủy</button>
        </div>
      )}
    </div>
  );
}
