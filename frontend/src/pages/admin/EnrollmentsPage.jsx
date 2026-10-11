import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Badge, Spinner, Empty } from '../../components/UI';
import '../../components/UI.css';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [payModal, setPayModal] = useState(null);
  const [payAmt, setPayAmt] = useState('');

  const load = (st = '') => {
    const q = st ? `?status=${st}&limit=50` : '?limit=50';
    api.get(`/enrollments${q}`).then(r => setEnrollments(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/enrollments/${id}/status`, { status });
    toast.success(status === 'active' ? 'Đã xác nhận ✓' : 'Đã hủy đăng ký');
    setEnrollments(e => e.map(x => x.id === id ? { ...x, status } : x));
  };

  const recordPayment = async () => {
    try {
      const r = await api.post(`/enrollments/${payModal.id}/payment`, { amount: +payAmt, method: 'cash' });
      toast.success('Đã ghi nhận thanh toán ✓');
      setEnrollments(e => e.map(x => x.id === payModal.id ? r.data : x));
      setPayModal(null); setPayAmt('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi ghi nhận');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 18 }}><h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>Quản Lý Đăng Ký Học</h2></div>
      <div className="fb">
        {['', 'pending', 'active', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-p' : 'btn-s'}`}
            onClick={() => { setFilter(s); load(s); setLoading(true); }}>
            {s === '' ? 'Tất cả' : s === 'pending' ? 'Chờ xác nhận' : s === 'active' ? 'Đang học' : s === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
          </button>
        ))}
      </div>
      {enrollments.length === 0 ? <Empty /> :
        <div className="tw">
          <table><thead><tr><th>Học viên</th><th>Lớp học</th><th>Ngày ĐK</th><th>TT đăng ký</th><th>Học phí</th><th>TT thanh toán</th><th>Hành động</th></tr></thead>
          <tbody>{enrollments.map(e => (
            <tr key={e.id}>
              <td><strong>{e.student?.name}</strong><br /><small style={{ color: 'var(--muted)', fontFamily: 'var(--fm)' }}>{e.student?.email}</small></td>
              <td><strong style={{ fontFamily: 'var(--fm)' }}>{e.class?.code}</strong><br /><small style={{ color: 'var(--muted)' }}>{e.class?.course?.name}</small></td>
              <td>{e.enrolled_at}</td>
              <td><Badge status={e.status} /></td>
              <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
                {new Intl.NumberFormat('vi-VN').format(e.paid_amount)}đ<br />
                <small style={{ color: 'var(--muted)' }}>/ {new Intl.NumberFormat('vi-VN').format(e.total_amount)}đ</small>
              </td>
              <td><Badge status={e.payment_status} /></td>
              <td>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {e.status === 'pending' && <>
                    <button className="btn btn-g btn-sm" onClick={() => updateStatus(e.id, 'active')}>✓ Xác nhận</button>
                    <button className="btn btn-d btn-sm" onClick={() => updateStatus(e.id, 'cancelled')}>✗ Hủy</button>
                  </>}
                  {e.status === 'active' && e.payment_status !== 'paid' &&
                    <button className="btn btn-p btn-sm" onClick={() => setPayModal(e)}>💰 Ghi nhận TT</button>}
                </div>
              </td>
            </tr>
          ))}</tbody></table>
        </div>}

      {payModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: 360, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>Ghi Nhận Thanh Toán</h3>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>
              {payModal.student?.name} · {payModal.class?.code}<br />
              Còn nợ: <strong style={{ color: 'var(--red)' }}>{new Intl.NumberFormat('vi-VN').format(payModal.total_amount - payModal.paid_amount)}đ</strong>
            </p>
            <div className="fg"><label className="fl">Số tiền thanh toán (đ)</label>
              <input type="number" className="fc" value={payAmt} onChange={e => setPayAmt(e.target.value)} placeholder="3000000" /></div>
            <div style={{ display: 'flex', gap: 9, marginTop: 8 }}>
              <button className="btn btn-p" onClick={recordPayment} disabled={!payAmt}>Xác nhận</button>
              <button className="btn btn-s" onClick={() => setPayModal(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
