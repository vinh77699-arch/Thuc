import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../api/axios';

/* ── SVG Icons ── */
const Icon = ({ d, size = 20, stroke = 'currentColor', fill = 'none', sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  cap:      'M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3.333 1.667 8.667 1.667 12 0v-5',
  book:     ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  pin:      ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', 'M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'],
  phone:    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.1 3.41 2 2 0 0 1 3.09 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.55a16 16 0 0 0 6.37 6.37l1.41-1.41a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  mail:     ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'M22 6l-10 7L2 6'],
  clock:    ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 6v6l4 2'],
  target:   ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  users:    ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  calendar: ['M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z', 'M16 1v4M8 1v4M3 9h18'],
  award:    ['M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M8.21 13.89L7 23l5-3 5 3-1.21-9.12'],
  star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  check:    'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  spark:    ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
  globe:    ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
};

const STATS = [
  { value: '500+', label: 'Học viên tin tưởng', icon: 'users' },
  { value: '20+',  label: 'Giáo viên chuyên nghiệp', icon: 'award' },
  { value: '2',    label: 'Chi nhánh', icon: 'pin' },
  { value: '98%',  label: 'Học viên hài lòng', icon: 'star' },
];

const FEATURES = [
  { icon: 'target',   title: 'Lộ trình cá nhân hoá',      desc: 'Chương trình học được thiết kế riêng cho từng trình độ — Beginner, Intermediate, IELTS, TOEIC.' },
  { icon: 'users',    title: 'Giáo viên giàu kinh nghiệm', desc: 'Đội ngũ giảng viên được đào tạo bài bản, nhiều năm kinh nghiệm giảng dạy tiếng Anh.' },
  { icon: 'calendar', title: 'Lịch học linh hoạt',         desc: 'Ca học sáng, chiều, tối — phù hợp học sinh, sinh viên và người đi làm.' },
  { icon: 'check',    title: 'Cam kết đầu ra',             desc: 'Cam kết đầu ra rõ ràng: hoàn thành khóa học, học viên đạt mục tiêu hoặc được học lại miễn phí.' },
];

const REVIEWS = [
  { name: 'Nguyễn Thị Hoa', role: 'Học viên IELTS',     score: 'IELTS 7.0', text: 'Sau 6 tháng học tại đây, mình đã đạt IELTS 7.0. Giáo viên nhiệt tình, phương pháp dạy rất hiệu quả!', avatar: 'TH' },
  { name: 'Trần Minh Tuấn', role: 'Học viên TOEIC',     score: 'TOEIC 850',  text: 'Mình cải thiện từ 450 lên 850 điểm TOEIC chỉ sau 4 tháng. Cảm ơn thầy cô English Center!',           avatar: 'MT' },
  { name: 'Lê Phương Anh',  role: 'Học viên Giao tiếp', score: '5 sao',      text: 'Lớp học nhỏ, giáo viên chú ý từng học viên. Con mình tiến bộ rõ rệt sau 3 tháng.',                    avatar: 'PA' },
];

const LEVEL_COLOR = { Beginner: '#0E7C4A', Intermediate: '#1A56DB', Advanced: '#E31937', Kids: '#DD6B20' };

/* ── Logo mark ── */
function LogoMark({ size = 36, bg = '#E31937' }) {
  return (
    <div style={{ width: size, height: size, background: bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3.333 1.667 8.667 1.667 12 0v-5" />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    publicApi.get('/courses').then(r => setCourses(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: "'Nunito', -apple-system, sans-serif", color: '#1A202C', background: '#fff' }}>
      {/* ── NAVBAR ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #E4E7EC', boxShadow: '0 1px 6px rgba(0,0,0,.06)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark size={38} />
            <div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>English Center</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: '.04em' }}>Trung tâm Ngoại ngữ</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {[['Trang chủ', '#hero'], ['Khóa học', '#courses'], ['Về chúng tôi', '#features'], ['Đánh giá', '#reviews']].map(([l, h]) => (
              <a key={l} href={h} style={{ padding: '7px 13px', fontSize: 13.5, fontWeight: 600, color: '#4B5563', borderRadius: 6, textDecoration: 'none', transition: '.12s' }}
                onMouseEnter={e => { e.target.style.color = '#E31937'; e.target.style.background = '#FFF0F2'; }}
                onMouseLeave={e => { e.target.style.color = '#4B5563'; e.target.style.background = 'transparent'; }}>{l}</a>
            ))}
            <button onClick={() => navigate('/login')} style={{
              marginLeft: 10, padding: '8px 22px', background: '#E31937', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(227,25,55,.3)', transition: '.15s',
            }}
              onMouseEnter={e => { e.target.style.background = '#C0152E'; e.target.style.boxShadow = '0 4px 16px rgba(227,25,55,.4)'; }}
              onMouseLeave={e => { e.target.style.background = '#E31937'; e.target.style.boxShadow = '0 2px 10px rgba(227,25,55,.3)'; }}>
              Đăng nhập
            </button>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section id="hero" style={{ position: 'relative', overflow: 'hidden', minHeight: 500, display: 'flex', alignItems: 'center',
        backgroundImage: 'url(/hero-bg.webp)', backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundRepeat: 'no-repeat' }}>
        {/* Dark + red overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(140,5,25,.88) 0%, rgba(180,10,35,.82) 45%, rgba(100,0,15,.72) 100%)' }} />
        {/* Subtle pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.18)' }} />

        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '64px 24px', position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'center' }}>
          <div>
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.14)', color: 'rgba(255,255,255,.9)', fontSize: 11.5, fontWeight: 700, padding: '5px 14px', borderRadius: 20, marginBottom: 22, letterSpacing: '.07em', border: '1px solid rgba(255,255,255,.2)' }}>
              <Icon d={ICONS.globe} size={13} stroke="rgba(255,255,255,.9)" sw={2} />
              TRUNG TÂM NGOẠI NGỮ UY TÍN
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.12, marginBottom: 20 }}>
              Học Tiếng Anh<br />
              <span style={{ color: '#FFD700' }}>Chinh Phục</span><br />
              Tương Lai
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.82)', lineHeight: 1.8, marginBottom: 36, maxWidth: 460 }}>
              Đồng hành cùng <strong style={{ color: '#FFD700' }}>500+ học viên</strong> mỗi năm — từ giao tiếp cơ bản đến luyện thi IELTS/TOEIC đạt điểm cao với đội ngũ giáo viên giàu kinh nghiệm.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', background: '#FFD700', color: '#8B0020',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(0,0,0,.22)', transition: '.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.28)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,.22)'; }}>
                <Icon d={ICONS.book} size={17} stroke="#8B0020" sw={2.2} />
                Xem khóa học
              </button>
              <button onClick={() => navigate('/login')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', background: 'transparent', color: '#fff',
                border: '1.5px solid rgba(255,255,255,.45)', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: '.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.45)'; }}>
                Đăng nhập
              </button>
            </div>
          </div>

          {/* Stats card */}
          <div style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '28px 32px', border: '1px solid rgba(255,255,255,.18)', minWidth: 300 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 800, marginBottom: 22, textTransform: 'uppercase', letterSpacing: '.1em' }}>Con số ấn tượng</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {STATS.map(s => (
                <div key={s.label}>
                  <div style={{ color: 'rgba(255,255,255,.5)', marginBottom: 5 }}>
                    <Icon d={ICONS[s.icon]} size={16} stroke="rgba(255,255,255,.5)" sw={1.6} fill={s.icon === 'star' ? 'rgba(255,255,255,.5)' : 'none'} />
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color: '#FFD700', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.7)', marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.15)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon d={ICONS.pin} size={15} stroke="rgba(255,255,255,.5)" sw={1.6} />
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.8)', lineHeight: 1.6 }}>2 cơ sở tại TP. Hồ Chí Minh<br /><strong style={{ color: '#fff' }}>Q.1 &amp; Q.Bình Thạnh</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANNOUNCEMENT BAR ── */}
      <div style={{ background: '#111827', color: '#fff', textAlign: 'center', padding: '12px 20px', fontSize: 13.5, fontWeight: 600 }}>
        Khai giảng tháng 11/2026 &mdash; <span style={{ color: '#FFD700' }}>Đăng ký sớm giảm 15%</span> học phí
        &ensp;·&ensp;
        <a href="#courses" style={{ color: '#E31937', textDecoration: 'none', fontWeight: 800 }}>Xem lịch khai giảng</a>
      </div>

      {/* ── COURSES ── */}
      <section id="courses" style={{ padding: '72px 24px', background: '#F7F8FA' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#FFF0F2', color: '#E31937', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, marginBottom: 12, letterSpacing: '.09em' }}>CHƯƠNG TRÌNH HỌC</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 900, color: '#111827', marginBottom: 12 }}>Khóa Học Nổi Bật</h2>
            <p style={{ fontSize: 15, color: '#718096', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>Chương trình được thiết kế theo từng trình độ, đảm bảo học viên tiến bộ rõ rệt sau mỗi khóa học</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 20 }}>
            {(courses.length > 0 ? courses : [
              { id: 1, name: 'Giao Tiếp Cơ Bản',  level: 'Beginner',     duration_weeks: 12, tuition_fee: 3500000, description: 'Tập trung giao tiếp hằng ngày, phản xạ ngôn ngữ tự nhiên.' },
              { id: 2, name: 'IELTS Band 5–6',      level: 'Intermediate', duration_weeks: 20, tuition_fee: 6000000, description: 'Luyện thi toàn diện 4 kỹ năng Nghe, Nói, Đọc, Viết.' },
              { id: 3, name: 'TOEIC 450+',           level: 'Intermediate', duration_weeks: 16, tuition_fee: 5000000, description: 'Ngữ pháp, từ vựng và kỹ thuật làm bài thi TOEIC.' },
              { id: 4, name: 'Tiếng Anh Trẻ Em',    level: 'Kids',         duration_weeks: 24, tuition_fee: 4000000, description: 'Chương trình học tương tác, phù hợp học sinh 7–12 tuổi.' },
            ]).map(c => (
              <div key={c.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,.06)', border: '1px solid #E4E7EC', transition: '.2s', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(227,25,55,.12)'; e.currentTarget.style.borderColor = '#FECDD3'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,.06)'; e.currentTarget.style.borderColor = '#E4E7EC'; }}>
                <div style={{ height: 5, background: LEVEL_COLOR[c.level] || '#E31937' }} />
                <div style={{ padding: '22px 22px 16px', flex: 1 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: LEVEL_COLOR[c.level] || '#E31937', background: '#F7F8FA', padding: '3px 9px', borderRadius: 4, letterSpacing: '.06em', display: 'inline-block', marginBottom: 12 }}>{c.level?.toUpperCase()}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 8, lineHeight: 1.3 }}>{c.name}</h3>
                  <p style={{ fontSize: 12.5, color: '#718096', lineHeight: 1.65, marginBottom: 18 }}>{c.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #F0F2F5' }}>
                    <div>
                      <div style={{ fontSize: 10.5, color: '#9CA3AF', marginBottom: 2 }}>Thời lượng</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{c.duration_weeks} tuần</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10.5, color: '#9CA3AF', marginBottom: 2 }}>Học phí</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#E31937' }}>{new Intl.NumberFormat('vi-VN').format(c.tuition_fee)}đ</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0 16px 18px' }}>
                  <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '10px', background: '#E31937', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: '.12s', letterSpacing: '.02em' }}
                    onMouseEnter={e => e.target.style.background = '#C0152E'}
                    onMouseLeave={e => e.target.style.background = '#E31937'}>
                    Đăng ký học
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '72px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#FFF0F2', color: '#E31937', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, marginBottom: 12, letterSpacing: '.09em' }}>VÌ SAO CHỌN CHÚNG TÔI</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 900, color: '#111827', marginBottom: 12 }}>Cam Kết Chất Lượng</h2>
            <p style={{ fontSize: 15, color: '#718096', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>Những giá trị cốt lõi giúp English Center trở thành lựa chọn tin tưởng của hàng trăm học viên</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ padding: '30px 26px', background: '#F7F8FA', borderRadius: 16, border: '1px solid #E4E7EC', transition: '.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F2'; e.currentTarget.style.borderColor = '#FECDD3'; e.currentTarget.querySelector('.fi').style.background = '#E31937'; e.currentTarget.querySelector('.fi').style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F7F8FA'; e.currentTarget.style.borderColor = '#E4E7EC'; e.currentTarget.querySelector('.fi').style.background = '#FFF0F2'; e.currentTarget.querySelector('.fi').style.color = '#E31937'; }}>
                <div className="fi" style={{ width: 48, height: 48, borderRadius: 12, background: '#FFF0F2', color: '#E31937', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, transition: '.2s' }}>
                  <Icon d={ICONS[f.icon]} size={22} stroke="currentColor" sw={1.7} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: '#718096', lineHeight: 1.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#E31937', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', boxShadow: '0 4px 16px rgba(227,25,55,.4)' }}>
            <Icon d={ICONS.spark} size={26} stroke="#fff" sw={1.8} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 14, lineHeight: 1.25 }}>Sẵn Sàng Bắt Đầu Hành Trình?</h2>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.72)', marginBottom: 34, lineHeight: 1.75 }}>
            Đăng ký ngay hôm nay và nhận tư vấn lộ trình học <span style={{ color: '#FFD700', fontWeight: 700 }}>MIỄN PHÍ</span> từ chuyên gia của chúng tôi
          </p>
          <button onClick={() => navigate('/login')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 38px', background: '#E31937', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(227,25,55,.45)', transition: '.15s', letterSpacing: '.02em',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(227,25,55,.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(227,25,55,.45)'; }}>
            <Icon d={ICONS.cap} size={20} stroke="#fff" sw={1.8} />
            Đăng ký học ngay
          </button>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" style={{ padding: '72px 24px', background: '#F7F8FA' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#FFF0F2', color: '#E31937', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, marginBottom: 12, letterSpacing: '.09em' }}>ĐÁNH GIÁ HỌC VIÊN</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 900, color: '#111827' }}>Học Viên Nói Gì?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {REVIEWS.map(r => (
              <div key={r.name} style={{ background: '#fff', borderRadius: 16, padding: '26px', boxShadow: '0 1px 8px rgba(0,0,0,.06)', border: '1px solid #E4E7EC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#E31937', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800, flexShrink: 0, letterSpacing: '.04em' }}>{r.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: '#111827' }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{r.role}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', background: '#FFF0F2', color: '#E31937', padding: '4px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap', border: '1px solid #FECDD3' }}>{r.score}</div>
                </div>
                {/* Quote mark */}
                <div style={{ marginBottom: 10 }}>
                  <svg width="22" height="16" viewBox="0 0 22 16" fill="#E31937" opacity=".25">
                    <path d="M0 16V9.6C0 4.267 2.88.96 8.64 0l1.44 2.4C7.04 3.147 5.44 4.8 5.44 7.2H9.6V16H0zm12.4 0V9.6C12.4 4.267 15.28.96 21.04 0l1.44 2.4c-3.04.747-4.64 2.4-4.64 4.8H22V16h-9.6z" />
                  </svg>
                </div>
                <p style={{ fontSize: 13.5, color: '#4A5568', lineHeight: 1.75, fontStyle: 'italic' }}>{r.text}</p>
                <div style={{ marginTop: 14, display: 'flex', gap: 3 }}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F6AD55"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0D1117', color: 'rgba(255,255,255,.6)', padding: '52px 24px 28px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <LogoMark size={36} />
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#fff' }}>English Center</span>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.85, maxWidth: 290, color: 'rgba(255,255,255,.55)' }}>Trung tâm Ngoại ngữ uy tín với hơn 10 năm kinh nghiệm đào tạo, đồng hành cùng hàng nghìn học viên chinh phục tiếng Anh.</p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '.1em' }}>Liên hệ</div>
              {[
                { icon: 'pin',   text: '123 Nguyễn Huệ, Q.1, TP.HCM' },
                { icon: 'phone', text: '(028) 1234 5678' },
                { icon: 'mail',  text: 'info@englishcenter.vn' },
                { icon: 'clock', text: 'T2–T7: 7:00 – 21:00' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, marginBottom: 12, color: 'rgba(255,255,255,.58)' }}>
                  <Icon d={ICONS[icon]} size={14} stroke="rgba(255,255,255,.4)" sw={1.6} />
                  {text}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '.1em' }}>Khóa học</div>
              {['Giao Tiếp Cơ Bản', 'IELTS Band 5–6', 'TOEIC 450+', 'Tiếng Anh Trẻ Em'].map(t => (
                <div key={t} style={{ fontSize: 13.5, marginBottom: 12, cursor: 'pointer', color: 'rgba(255,255,255,.58)', transition: '.12s' }}
                  onMouseEnter={e => e.target.style.color = '#E31937'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.58)'}>{t}</div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', fontSize: 12.5, alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ color: 'rgba(255,255,255,.4)' }}>© 2026 English Center. All rights reserved.</span>
            <button onClick={() => navigate('/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#E31937', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: '.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#C0152E'}
              onMouseLeave={e => e.currentTarget.style.background = '#E31937'}>
              <Icon d={ICONS.cap} size={14} stroke="#fff" sw={2} />
              Đăng nhập hệ thống
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
