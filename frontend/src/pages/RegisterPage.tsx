import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './RegisterPage.css'; // ยังคง import CSS สำหรับสไตล์เฉพาะที่อาจเหลืออยู่

// Password Policy Check Function (Client-side - needs to match backend)
const checkPasswordPolicy = (password: string): string | null => {
    if (password.length < 8) {
        return "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
    }
    if (!/[A-Z]/.test(password)) {
        return "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อยหนึ่งตัว";
    }
    if (!/[a-z]/.test(password)) {
        return "รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อยหนึ่งตัว";
    }
    if (!/[0-9]/.test(password)) {
        return "รหัสผ่านต้องมีตัวเลขอย่างน้อยหนึ่งตัว";
    }
    // Add special character check matching backend regex
     if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
        return "รหัสผ่านต้องมีสัญลักษณ์พิเศษอย่างน้อยหนึ่งตัว (!@#$%^&*()...)";
    }
    return null; // Password meets policy
};

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { updateUserAfterLogin, isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else if (user.role === 'student' || user.role === 'user') {
        navigate('/student/main', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    // Check Password Policy (Client-side)
    const policyError = checkPasswordPolicy(password);
    if (policyError) {
        setError(policyError);
        return;
    }
    if (password.length < 8) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }

    try {
      interface RegisterPayload {
        username: string;
        password: string;
      }

      const payload: RegisterPayload = { username, password };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok && data.status === 'success' && data.data.user) {
        setSuccess('ลงทะเบียนสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...');
        updateUserAfterLogin(data.data.user);
      } else {
        setError(data.message || 'การลงทะเบียนล้มเหลว: ชื่อผู้ใช้อาจซ้ำกับที่มีอยู่ หรือข้อมูลไม่ถูกต้อง');
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการลงทะเบียน:', err);
      setError('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้งในภายหลัง');
    }
  };

  if (isLoading || isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">กำลังโหลด...</div>;
  }

  return (
    <div className="register-page"> 
      <div className="card w-full max-w-md animate-fade-in-down">
        <h2 className="text-2xl font-bold text-center mb-6">สร้างบัญชีผู้ใช้ใหม่</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm" role="alert">
              {success}
            </div>
          )}
          <div>
            <label htmlFor="usernameReg" className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้ <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="usernameReg"
              className="input-field mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="ตั้งชื่อผู้ใช้ของคุณ"
            />
          </div>
          <div>
            <label htmlFor="passwordReg" className="block text-sm font-medium text-gray-700">รหัสผ่าน <span className="text-red-500">*</span></label>
            <input
              type="password"
              id="passwordReg"
              className="input-field mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="ตั้งรหัสผ่าน"
            />
          </div>
          <div>
            <label htmlFor="confirmPasswordReg" className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน <span className="text-red-500">*</span></label>
            <input
              type="password"
              id="confirmPasswordReg"
              className="input-field mt-1"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="ยืนยันรหัสผ่านอีกครั้ง"
            />
          </div>
          <div className="text-sm text-gray-500 mt-2">
              รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วย: ตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข, และสัญลักษณ์พิเศษอย่างน้อยอย่างละ 1 ตัว
          </div>
          <button type="submit" className="btn btn-primary w-full">
            ลงทะเบียน
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="font-medium hover:underline">เข้าสู่ระบบที่นี่</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 