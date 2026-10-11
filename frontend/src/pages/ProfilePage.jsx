import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../components/UI.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const initials = user?.name?.split(' ').map(w => w[0]).slice(-2).join('') || '?';

  const saveProfile = async () => {
    try {
      await api.put('/auth/profile', { name, phone });
      await refreshUser();
      toast.success('Đã lưu hồ sơ ✓');
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
  };

  const changePw = async () => {
    try {
      await api.put('/auth/password', { current_password: curPw, new_password: newPw });
      toast.success('Đổi mật khẩu thành công ✓');
      setCurPw(''); setNewPw('');
    } catch (err) { toast.error(err.response?.data?.message || 'Mật khẩu không đúng'); }
  };

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 18 }}><h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>Hồ Sơ Cá Nhân</h2></div>
      <div className="card" style={{ maxWidth: 460 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>{initials}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--fm)' }}>{user?.email}</div>
          </div>
        </div>

        <div className="fg"><label className="fl">Họ và tên</label><input className="fc" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="fg"><label className="fl">Email</label><input className="fc" value={user?.email} readOnly style={{ opacity: .6 }} /></div>
        <div className="fg"><label className="fl">Số điện thoại</label><input className="fc" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập số điện thoại..." /></div>
        <button className="btn btn-p" onClick={saveProfile} style={{ marginBottom: 20 }}>Lưu thay đổi</button>

        <div style={{ paddingTop: 18, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Đổi Mật Khẩu</div>
          <div className="fg"><label className="fl">Mật khẩu hiện tại</label><input type="password" className="fc" value={curPw} onChange={e => setCurPw(e.target.value)} /></div>
          <div className="fg"><label className="fl">Mật khẩu mới</label><input type="password" className="fc" value={newPw} onChange={e => setNewPw(e.target.value)} /></div>
          <button className="btn btn-s" onClick={changePw}>Đổi mật khẩu</button>
        </div>
      </div>
    </div>
  );
}
