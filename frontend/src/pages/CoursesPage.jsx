import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Badge, Spinner } from '../components/UI';
import toast from 'react-hot-toast';
import '../components/UI.css';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Kids'];

const EMPTY = { name: '', level: 'Beginner', description: '', duration_weeks: '', tuition_fee: '' };

function CourseModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const isEdit = !!initial?.id;

  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên khóa học');
    if (!form.duration_weeks || +form.duration_weeks < 1) return toast.error('Số tuần phải lớn hơn 0');
    if (!form.tuition_fee || +form.tuition_fee < 0) return toast.error('Học phí không hợp lệ');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        level: form.level,
        description: form.description.trim(),
        duration_weeks: +form.duration_weeks,
        tuition_fee: +form.tuition_fee,
      };
      if (isEdit) await api.put(`/courses/${initial.id}`, payload);
      else await api.post('/courses', payload);
      toast.success(isEdit ? 'Đã cập nhật khóa học' : 'Đã thêm khóa học mới');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, width: '100%', maxWidth: 480, padding: 28, boxShadow: '0 8px 32px rgba(0,0,0,.18)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 20 }}>
          {isEdit ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
        </h3>
        <form onSubmit={submit}>
          <div className="fg">
            <label className="fl">Tên khóa học <span style={{ color: 'var(--primary)' }}>*</span></label>
            <input className="fc" value={form.name} onChange={set('name')} placeholder="VD: IELTS Band 6+" autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label className="fl">Trình độ</label>
              <select className="fc" value={form.level} onChange={set('level')}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Số tuần <span style={{ color: 'var(--primary)' }}>*</span></label>
              <input className="fc" type="number" min="1" value={form.duration_weeks} onChange={set('duration_weeks')} placeholder="12" />
            </div>
          </div>
          <div className="fg">
            <label className="fl">Học phí (VNĐ) <span style={{ color: 'var(--primary)' }}>*</span></label>
            <input className="fc" type="number" min="0" value={form.tuition_fee} onChange={set('tuition_fee')} placeholder="3500000" />
          </div>
          <div className="fg">
            <label className="fl">Mô tả</label>
            <textarea className="fc" rows={3} value={form.description} onChange={set('description')} placeholder="Mô tả ngắn về khóa học..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn" onClick={onClose} style={{ background: 'var(--muted-bg)', color: 'var(--ink)' }}>Hủy</button>
            <button type="submit" className="btn btn-p" disabled={saving}>
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | courseObj
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const isManager = user?.role === 'admin' || user?.role === 'staff';

  const load = () => api.get('/courses').then(r => setCourses(r.data));
  useEffect(() => { load(); }, []);

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) && (!level || c.level === level)
  );

  const handleDelete = async (e, cr) => {
    e.stopPropagation();
    if (!window.confirm(`Xóa khóa học "${cr.name}"? Hành động này không thể hoàn tác.`)) return;
    setDeleting(cr.id);
    try {
      await api.delete(`/courses/${cr.id}`);
      toast.success('Đã xóa khóa học');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa khóa học này');
    } finally { setDeleting(null); }
  };

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>Khóa Học & Lớp Học</h2>
          <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>Chọn khóa học phù hợp và đăng ký lớp học</p>
        </div>
        {isManager && (
          <button className="btn btn-p" onClick={() => setModal('add')} style={{ fontSize: 13, padding: '8px 16px' }}>
            + Thêm khóa học
          </button>
        )}
      </div>

      <div className="fb" style={{ marginBottom: 18 }}>
        <input className="fc" style={{ width: 200 }} placeholder="🔍 Tìm khóa học..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="fc" style={{ width: 150 }} value={level} onChange={e => setLevel(e.target.value)}>
          <option value="">Tất cả trình độ</option>
          {LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
        {filtered.map(cr => (
          <div key={cr.id} className="card" style={{ cursor: 'pointer', transition: '.15s', padding: 0, overflow: 'hidden', position: 'relative' }}
            onClick={() => navigate(`/courses/${cr.id}`)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-light)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>

            {/* Admin action buttons */}
            {isManager && (
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 5, zIndex: 1 }}
                onClick={e => e.stopPropagation()}>
                <button
                  onClick={e => { e.stopPropagation(); setModal(cr); }}
                  style={{ background: 'rgba(255,255,255,.92)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: 'var(--ink)' }}
                  title="Chỉnh sửa">
                  ✏️ Sửa
                </button>
                <button
                  onClick={e => handleDelete(e, cr)}
                  disabled={deleting === cr.id}
                  style={{ background: 'rgba(255,255,255,.92)', border: '1px solid #fca5a5', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}
                  title="Xóa">
                  {deleting === cr.id ? '...' : '🗑️ Xóa'}
                </button>
              </div>
            )}

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

      {modal && (
        <CourseModal
          initial={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
