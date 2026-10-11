// Shared UI primitives

export function Badge({ status }) {
  const map = {
    active: ['ba', 'Active'], ongoing: ['ba', 'Đang học'], paid: ['ba', 'Đã TT'],
    present: ['ba', 'Có mặt'], completed: ['bpl', 'Hoàn thành'],
    cancelled: ['bc', 'Đã hủy'], pending: ['bp', 'Chờ xác nhận'],
    partial: ['bp', 'Đã cọc'], unpaid: ['bc', 'Chưa TT'],
    upcoming: ['bi', 'Sắp KG'], absent: ['bc', 'Vắng'], late: ['bp', 'Trễ'],
    admin: ['bc', 'Admin'], teacher: ['bi', 'Giáo viên'],
    staff: ['bp', 'Nhân viên'], student: ['ba', 'Học viên'],
    Beginner: ['bi', 'Beginner'], Intermediate: ['bp', 'Intermediate'],
    Advanced: ['bc', 'Advanced'], Kids: ['ba', 'Kids'],
  };
  const [cls, label] = map[status] || ['bpl', status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function Spinner() {
  return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Đang tải...</div>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 18, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function KpiCard({ value, label, accent }) {
  return (
    <div className="kc" style={accent ? { '--kv-color': 'var(--primary)' } : {}}>
      <div className="kv" style={{ color: accent ? 'var(--primary)' : 'var(--ink)' }}>{value}</div>
      <div className="kl">{label}</div>
    </div>
  );
}

export function Empty({ icon = '📭', text = 'Không có dữ liệu' }) {
  return (
    <div style={{ textAlign: 'center', padding: '44px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: 32, marginBottom: 10, opacity: .35 }}>{icon}</div>
      <p>{text}</p>
    </div>
  );
}

export function ProgressBar({ paid, total }) {
  const pct = total ? Math.round(paid / total * 100) : 0;
  return (
    <div>
      <div style={{ background: 'var(--s2)', borderRadius: 3, height: 7, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 3, transition: 'width .4s' }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{pct}%</div>
    </div>
  );
}
