import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { publicApi } from '../../api/axios';
import toast from 'react-hot-toast';
import '../../components/UI.css';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Vui lòng nhập họ tên');
    if (!form.email.trim()) return toast.error('Vui lòng nhập email');
    if (form.password.length < 6) return toast.error('Mật khẩu phải có ít nhất 6 ký tự');
    if (form.password !== form.confirm) return toast.error('Mật khẩu xác nhận không khớp');

    setLoading(true);
    try {
      const { data } = await publicApi.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      localStorage.setItem('token', data.token);
      toast.success('Đăng ký thành công! Chào mừng bạn 🎉');
      await login(form.email.trim(), form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F7F8FA' }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 420px', background: 'var(--primary)', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 48, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎓</div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>English Center</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>
            Tạo tài khoản học viên miễn phí và khám phá hàng chục khóa học chất lượng cao
          </div>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['✅', 'Tra cứu và đăng ký khóa học trực tuyến'],
              ['📅', 'Xem lịch học và điểm danh mọi lúc'],
              ['💳', 'Theo dõi học phí và thanh toán dễ dàng']].map(([ic, txt]) => (
              <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <span style={{ fontSize: 18 }}>{ic}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.85)' }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)', marginBottom: 6 }}>Tạo tài khoản</h1>
            <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
              Đã có tài khoản?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                Đăng nhập
              </Link>
            </p>
          </div>

          <form onSubmit={submit}>
            <div className="fg">
              <label className="fl">Họ và tên <span style={{ color: 'var(--primary)' }}>*</span></label>
              <input className="fc" value={form.name} onChange={set('name')}
                placeholder="Nguyễn Văn A" autoFocus />
            </div>
            <div className="fg">
              <label className="fl">Email <span style={{ color: 'var(--primary)' }}>*</span></label>
              <input className="fc" type="email" value={form.email} onChange={set('email')}
                placeholder="email@example.com" />
            </div>
            <div className="fg">
              <label className="fl">Số điện thoại</label>
              <input className="fc" type="tel" value={form.phone} onChange={set('phone')}
                placeholder="0901 234 567" />
            </div>
            <div className="fg">
              <label className="fl">Mật khẩu <span style={{ color: 'var(--primary)' }}>*</span></label>
              <input className="fc" type="password" value={form.password} onChange={set('password')}
                placeholder="Ít nhất 6 ký tự" />
            </div>
            <div className="fg">
              <label className="fl">Xác nhận mật khẩu <span style={{ color: 'var(--primary)' }}>*</span></label>
              <input className="fc" type="password" value={form.confirm} onChange={set('confirm')}
                placeholder="Nhập lại mật khẩu" />
            </div>

            {/* Password match indicator */}
            {form.confirm && (
              <div style={{ marginTop: -8, marginBottom: 16, fontSize: 12, color: form.password === form.confirm ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                {form.password === form.confirm ? '✓ Mật khẩu khớp' : '✗ Mật khẩu chưa khớp'}
              </div>
            )}

            <button type="submit" className="btn btn-p btn-full" disabled={loading}
              style={{ fontSize: 14, padding: '11px 18px', borderRadius: 10 }}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký →'}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.7 }}>
            Bằng cách đăng ký, bạn đồng ý với điều khoản sử dụng dịch vụ của English Center.
          </p>
        </div>
      </div>
    </div>
  );
}
