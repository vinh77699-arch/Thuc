import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ClassDetailPage from './pages/ClassDetailPage';
import ClassesPage from './pages/admin/ClassesPage';
import CreateClassPage from './pages/admin/CreateClassPage';
import EnrollmentsPage from './pages/admin/EnrollmentsPage';
import UsersPage from './pages/admin/UsersPage';
import BranchesPage from './pages/admin/BranchesPage';
import AttendancePage from './pages/teacher/AttendancePage';
import SchedulePage from './pages/teacher/SchedulePage';
import MyEnrollmentsPage from './pages/student/MyEnrollmentsPage';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: 'var(--fd)' }}>Đang tải...</div>;
  if (!user) return <Navigate to="/home" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/home" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="classes/:id" element={<ClassDetailPage />} />
        <Route path="my-enrollments" element={<PrivateRoute roles={['student']}><MyEnrollmentsPage /></PrivateRoute>} />
        <Route path="schedule" element={<PrivateRoute roles={['teacher']}><SchedulePage /></PrivateRoute>} />
        <Route path="attendance/:classId" element={<PrivateRoute roles={['teacher', 'admin', 'staff']}><AttendancePage /></PrivateRoute>} />
        <Route path="manage/classes" element={<PrivateRoute roles={['admin', 'staff']}><ClassesPage /></PrivateRoute>} />
        <Route path="manage/classes/new" element={<PrivateRoute roles={['admin', 'staff']}><CreateClassPage /></PrivateRoute>} />
        <Route path="manage/enrollments" element={<PrivateRoute roles={['admin', 'staff']}><EnrollmentsPage /></PrivateRoute>} />
        <Route path="manage/users" element={<PrivateRoute roles={['admin']}><UsersPage /></PrivateRoute>} />
        <Route path="manage/branches" element={<PrivateRoute roles={['admin']}><BranchesPage /></PrivateRoute>} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? "/" : "/home"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
