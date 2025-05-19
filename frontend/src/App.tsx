import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage'; // Import HomePage
import ProtectedRoute from './components/auth/ProtectedRoute'; // Import ProtectedRoute
import Layout from './components/layout/Layout'; // จะสร้าง Layout ต่อไป
import { AuthProvider } from './contexts/AuthContext';

// Import actual page components
import StudentMainPage from './pages/student/StudentMainPage';
import StudentPreferencesPage from './pages/StudentPreferencesPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import ChangePasswordPage from './pages/ChangePasswordPage'; // Import ChangePasswordPage

import './index.css';

const NotFoundPage = () => <div className="card p-4 text-center"><h2>404 - ไม่พบหน้า</h2><p>ขออภัย ไม่พบหน้าที่คุณกำลังค้นหา</p></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes> {/* <Routes> Block เดียว ครอบคลุมทุก Route */}

          {/* Routes ที่ไม่มี Layout (เช่น Login, Register) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes ที่ใช้ Layout */}
          {/* ใช้ Route เดียวที่มี element เป็น Layout และกำหนด Path="/" เป็น Index */}
          <Route element={<Layout />}> 
              <Route path="/" element={<HomePage />} />

              {/* Protected Routes (nested inside Layout Route) */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}> {/* Roles allowed for student pages */}
                <Route path="/student/main" element={<StudentMainPage />} />
                <Route path="/student/preferences" element={<StudentPreferencesPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['teacher']} />}> {/* Roles allowed for teacher pages */}
                {/* <Route path="/teacher/main" element={<TeacherMainPage />} /> */}
                <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
              </Route>

              {/* Add Change Password Route - Accessible by all protected roles (nested inside Layout Route) */}
              <Route element={<ProtectedRoute allowedRoles={['student', 'teacher']} />}> {/* Adjust allowedRoles if needed */}
                  <Route path="/change-password" element={<ChangePasswordPage />} /> {/* New Route */}
              </Route>
          </Route> {/* สิ้นสุด Route ที่ใช้ Layout */}
          
          {/* Fallback for unmatched routes - ควรอยู่สุดท้ายใน <Routes> Block */}
          {/* หมายเหตุ: ถ้า URL ไม่ตรงกับ Route ข้างบนเลย จะมาที่นี่ */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
