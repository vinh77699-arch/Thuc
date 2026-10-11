import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

const NAV = {
  student: [
    { to: '/', icon: '🏠', label: 'Trang chủ' },
    { to: '/courses', icon: '📚', label: 'Khóa học' },
    { to: '/my-enrollments', icon: '📋', label: 'Lớp của tôi' },
    { to: '/profile', icon: '👤', label: 'Hồ sơ' },
  ],
  teacher: [
    { to: '/', icon: '🏠', label: 'Trang chủ' },
    { to: '/schedule', icon: '📅', label: 'Lịch dạy' },
    { to: '/profile', icon: '👤', label: 'Hồ sơ' },
  ],
  staff: [
    { to: '/', icon: '🏠', label: 'Trang chủ' },
    { to: '/courses', icon: '📚', label: 'Khóa học' },
    { to: '/manage/classes', icon: '🏫', label: 'Lớp học' },
    { to: '/manage/enrollments', icon: '📝', label: 'Đăng ký' },
    { to: '/profile', icon: '👤', label: 'Hồ sơ' },
  ],
  admin: [
    { to: '/', icon: '🏠', label: 'Trang chủ' },
    { to: '/manage/branches', icon: '🏢', label: 'Chi nhánh' },
    { to: '/courses', icon: '📚', label: 'Khóa học' },
    { to: '/manage/classes', icon: '🏫', label: 'Lớp học' },
    { to: '/manage/enrollments', icon: '📝', label: 'Đăng ký' },
    { to: '/manage/users', icon: '👥', label: 'Tài khoản' },
    { to: '/profile', icon: '👤', label: 'Hồ sơ' },
  ],
};

const PAGE_TITLES = {
  '/': 'Trang chủ', '/courses': 'Khóa Học',
  '/my-enrollments': 'Lớp Của Tôi', '/schedule': 'Lịch Dạy',
  '/profile': 'Hồ Sơ', '/manage/classes': 'Quản Lý Lớp Học',
  '/manage/classes/new': 'Tạo Lớp Mới', '/manage/enrollments': 'Quản Lý Đăng Ký',
  '/manage/users': 'Tài Khoản', '/manage/branches': 'Chi Nhánh',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV[user?.role] || [];
  const initials = user?.name?.split(' ').map(w => w[0]).slice(-2).join('') || '?';
  const pagePath = window.location.pathname;
  const pageTitle = Object.entries(PAGE_TITLES).find(([k]) => pagePath === k || pagePath.startsWith(k + '/'))?.[1] || 'English Center';
  const scopeLabel = user?.branch ? user.branch.name : user?.role === 'admin' ? 'Toàn hệ thống' : '';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><span>🎓</span></div>
          <div>
            <div className={styles.brand}>English Center</div>
            <div className={styles.tag}>Hệ Thống Quản Lý</div>
          </div>
        </div>

        <div className={styles.user}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userRole}>{user?.role}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {items.map(it => (
            <NavLink key={it.to} to={it.to} end={it.to === '/'}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <span className={styles.icon}>{it.icon}</span>
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>⏻</span> Đăng xuất
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles.tbTitle}>{pageTitle}</div>
          {scopeLabel && <span className={styles.tbChip}>{scopeLabel}</span>}
        </div>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
