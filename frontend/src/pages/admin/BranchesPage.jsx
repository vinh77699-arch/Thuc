import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Spinner, Empty } from '../../components/UI';
import '../../components/UI.css';

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' });

  useEffect(() => { api.get('/branches').then(r => setBranches(r.data)); }, []);

  const save = async () => {
    try {
      if (modal === 'create') {
        const r = await api.post('/branches', form);
        setBranches(b => [...b, r.data]);
        toast.success('Đã thêm chi nhánh ✓');
      } else {
        const r = await api.put(`/branches/${modal.id}`, form);
        setBranches(b => b.map(x => x.id === modal.id ? r.data : x));
        toast.success('Đã cập nhật ✓');
      }
      setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
  };

  const openEdit = (b) => { setForm({ name: b.name, address: b.address, phone: b.phone || '', email: b.email || '' }); setModal(b); };

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 18 }}><h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>Quản Lý Chi Nhánh</h2></div>
      <div className="fb"><div className="spacer" />
        <button className="btn btn-p" onClick={() => { setForm({ name: '', address: '', phone: '', email: '' }); setModal('create'); }}>+ Thêm chi nhánh</button>
      </div>
      {branches.length === 0 ? <Empty /> :
        <div className="tw">
          <table><thead><tr><th>Chi nhánh</th><th>Địa chỉ</th><th>Điện thoại</th><th>Email</th><th></th></tr></thead>
          <tbody>{branches.map(b => (
            <tr key={b.id}>
              <td><strong>{b.name}</strong></td>
              <td>{b.address}</td>
              <td>{b.phone || '–'}</td>
              <td>{b.email || '–'}</td>
              <td><button className="btn btn-s btn-sm" onClick={() => openEdit(b)}>Sửa</button></td>
            </tr>
          ))}</tbody></table>
        </div>}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: 400, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>{modal === 'create' ? 'Thêm Chi Nhánh' : 'Sửa Chi Nhánh'}</h3>
            {[['name', 'Tên chi nhánh *'], ['address', 'Địa chỉ *'], ['phone', 'Điện thoại'], ['email', 'Email']].map(([k, l]) => (
              <div className="fg" key={k}><label className="fl">{l}</label>
                <input className="fc" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
            ))}
            <div style={{ display: 'flex', gap: 9, marginTop: 8 }}>
              <button className="btn btn-p" onClick={save}>Lưu</button>
              <button className="btn btn-s" onClick={() => setModal(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
