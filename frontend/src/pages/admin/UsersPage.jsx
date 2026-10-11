import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Badge, Spinner, Empty } from '../../components/UI';
import '../../components/UI.css';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [modal, setModal] = useState(null); // null | 'create'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'teacher', branch_id: '' });
  const [branches, setBranches] = useState([]);

  const load = (r = '') => {
    api.get(`/users?role=${r}&limit=100`).then(x => setUsers(x.data.data)).finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    api.get('/branches').then(r => setBranches(r.data));
  }, []);

  const create = async () => {
    try {
      const r = await api.post('/users', form);
      toast.success('Tạo tài khoản thành công ✓');
      setUsers(u => [r.data, ...u]);
      setModal(null); setForm({ name: '', email: '', password: '', role: 'teacher', branch_id: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Tạo tài khoản thất bại'); }
  };

  const deactivate = async (id) => {
    await api.delete(`/users/${id}`);
    toast.success('Đã khóa tài khoản');
    setUsers(u => u.filter(x => x.id !== id));
  };

  const initials = name => name?.split(' ').map(w => w[0]).slice(-2).join('') || '?';

  if (loading) return <Spinner />;
  return (
    <div className="page-enter">
      <div style={{ marginBottom: 18 }}><h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>Quản Lý Tài Khoản</h2></div>
      <div className="fb">
        {['', 'admin', 'staff', 'teacher', 'student'].map(r => (
          <button key={r} className={`btn btn-sm ${role === r ? 'btn-p' : 'btn-s'}`}
            onClick={() => { setRole(r); load(r); setLoading(true); }}>
            {r === '' ? 'Tất cả' : r}
          </button>
        ))}
        <div className="spacer" />
        <button className="btn btn-p" onClick={() => setModal('create')}>+ Tạo tài khoản</button>
      </div>
      {users.length === 0 ? <Empty /> :
        <div className="tw">
          <table><thead><tr><th>Tên</th><th>Email</th><th>Vai trò</th><th>Phạm vi</th><th>TT</th><th></th></tr></thead>
          <tbody>{users.map(u => (
            <tr key={u.id}>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials(u.name)}</div>
                <strong>{u.name}</strong>
              </div></td>
              <td style={{ fontFamily: 'var(--fm)', fontSize: 11.5 }}>{u.email}</td>
              <td><Badge status={u.role} /></td>
              <td style={{ fontSize: 12, color: 'var(--muted)' }}>{u.branch?.name || (u.role === 'admin' ? 'Toàn hệ thống' : '–')}</td>
              <td><Badge status={u.is_active ? 'active' : 'cancelled'} /></td>
              <td>{u.role !== 'admin' && u.is_active &&
                <button className="btn btn-d btn-sm" onClick={() => deactivate(u.id)}>Khóa</button>}
              </td>
            </tr>
          ))}</tbody></table>
        </div>}

      {modal === 'create' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: 420, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>Tạo Tài Khoản Mới</h3>
            {[['name', 'Họ và tên *', 'text'], ['email', 'Email *', 'email'], ['password', 'Mật khẩu *', 'password']].map(([k, l, t]) => (
              <div className="fg" key={k}><label className="fl">{l}</label>
                <input type={t} className="fc" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
            ))}
            <div className="fg"><label className="fl">Vai trò *</label>
              <select className="fc" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {['admin', 'staff', 'teacher', 'student'].map(r => <option key={r} value={r}>{r}</option>)}
              </select></div>
            {(form.role === 'staff' || form.role === 'teacher') &&
              <div className="fg"><label className="fl">Chi nhánh</label>
                <select className="fc" value={form.branch_id} onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))}>
                  <option value="">-- Chọn --</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select></div>}
            <div style={{ display: 'flex', gap: 9, marginTop: 8 }}>
              <button className="btn btn-p" onClick={create}>Tạo</button>
              <button className="btn btn-s" onClick={() => setModal(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
