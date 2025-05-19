import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import './LoginPage.css'; // CSS อาจจะไม่จำเป็นแล้วถ้าใช้ global classes ทั้งหมด

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { updateUserAfterLogin, isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    // ถ้า login อยู่แล้ว และมี user data ให้ redirect ตาม role
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else if (user.role === 'student' || user.role === 'user') { // สมมติ 'user' คือ student
        navigate('/student/main', { replace: true });
      } else {
        navigate('/', { replace: true }); // หน้า default หาก role ไม่ตรง
      }
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok && data.status === 'success' && data.data.user) {
        // Call updateUserAfterLogin with the user data from response
        updateUserAfterLogin(data.data.user); 

        // Redirection is handled by the useEffect hook based on isAuthenticated and user role
      } else {
        setError(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', err);
      setError('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง');
    }
  };
  
  // ถ้ากำลังโหลดข้อมูล user หรือ login อยู่แล้ว ไม่ต้องแสดงฟอร์ม login อีก
  if (isLoading || isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">กำลังโหลด...</div>; 
  }

  return (
    <div className="login-page flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card w-full max-w-md animate-fade-in-down p-8">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-brand-primary)' }}>เข้าสู่ระบบ</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
            <input
              type="text"
              id="username"
              className="input-field mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="กรอกชื่อผู้ใช้ของคุณ"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              className="input-field mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="กรอกรหัสผ่าน"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            เข้าสู่ระบบ
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          ยังไม่มีบัญชี? <Link to="/register" className="font-medium hover:underline" style={{ color: 'var(--color-brand-primary-dark)' }}>ลงทะเบียนที่นี่</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 