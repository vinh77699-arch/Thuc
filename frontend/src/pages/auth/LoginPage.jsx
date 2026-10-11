import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../components/UI.css';

const DEMO = [
  { role: 'admin',   email: 'admin@englishcenter.vn',   password: 'admin123',   icon: '⚙️', label: 'Quản Trị',  color: '#E31937' },
  { role: 'staff',   email: 'staff1@englishcenter.vn',  password: 'staff123',   icon: '🗂️', label: 'Nhân Viên', color: '#E31937' },
  { role: 'teacher', email: 'teacher1@englishcenter.vn',password: 'teacher123', icon: '📖', label: 'Giáo Viên', color: '#E31937' },
  { role: 'student', email: 'student1@englishcenter.vn',password: '123456',     icon: '🎓', label: 'Học Viên',  color: '#E31937' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async (e, pw) => {
    setLoading(true);
    try {
      await login(e, pw);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#F7F8FA',
    }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 420px', background: 'var(--primary)', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 48, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎓</div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>English Center</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>
            Hệ thống quản lý trung tâm ngoại ngữ toàn diện — từ lớp học đến điểm danh và học phí
          </div>
          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['500+', 'Học viên'], ['20+', 'Giáo viên'], ['2', 'Chi nhánh'], ['4', 'Khóa học']].map(([v, l]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,.12)', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)', marginBottom: 6 }}>Đăng nhập</h1>
            <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
              Chọn vai trò để đăng nhập nhanh, hoặc nhập tài khoản.{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                Tạo tài khoản mới
              </Link>
            </p>
          </div>

          {/* Quick role buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {DEMO.map(d => (
              <button key={d.role} onClick={() => doLogin(d.email, d.password)} disabled={loading}
                style={{
                  background: '#fff', border: '2px solid var(--border)', padding: '12px 14px',
                  textAlign: 'left', cursor: 'pointer', borderRadius: 10, transition: '.15s',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-faint)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; }}
              >
                <span style={{ fontSize: 22 }}>{d.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>{d.label}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{d.role}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>HOẶC</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div className="fg">
            <label className="fl">Email</label>
            <input className="fc" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@englishcenter.vn" />
          </div>
          <div className="fg">
            <label className="fl">Mật khẩu</label>
            <input type="password" className="fc" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin(email, password)} />
          </div>
          <button className="btn btn-p btn-full" onClick={() => doLogin(email, password)} disabled={loading}
            style={{ fontSize: 14, padding: '11px 18px', borderRadius: 10 }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
          </button>
        </div>
      </div>
    </div>
  );
}
