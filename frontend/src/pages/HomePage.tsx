import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">กำลังโหลด...</div>;
  }

  return (
    <div className="text-center p-4 md:p-8">
      <div className="card max-w-lg mx-auto animate-fade-in-up shadow-xl">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-brand-primary)' }}>
          ยินดีต้อนรับสู่ Student Exploration Platform!
        </h1>

        {isAuthenticated && user ? (
          <>
            {/* (Role: {user.role}) */}
            <p className="text-gray-700 mb-2">สวัสดีคุณ, {user.username}</p>
            <p className="text-gray-600 mb-6">
              คุณสามารถไปยังหน้าต่างๆ ของคุณได้จากเมนูด้านบน
            </p>
            {user.role === 'student' || user.role === 'user' ? (
              <Link to="/student/main" className="btn btn-primary mr-2">ไปยังหน้าหลักนักเรียน</Link>
            ) : null}
            {user.role === 'teacher' ? (
              <Link to="/teacher/dashboard" className="btn btn-primary">ไปยัง Dashboard ครู</Link>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-6">
              แพลตฟอร์มสำหรับนักเรียนในการค้นหาความชอบ และสำหรับคุณครูในการติดตามความก้าวหน้า
              กรุณาเข้าสู่ระบบหรือลงทะเบียนเพื่อเริ่มต้น
            </p>
            <div className="space-y-3 md:space-y-0 md:space-x-4">
              <Link to="/login" className="btn btn-primary">
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className="btn btn-outline">
                ลงทะเบียน
              </Link>
            </div>
          </>
        )}
        <p className="mt-8 text-sm text-gray-500">
          หากมีข้อสงสัย สามารถติดต่อผู้ดูแลระบบ
        </p>
      </div>
    </div>
  );
};

export default HomePage; 