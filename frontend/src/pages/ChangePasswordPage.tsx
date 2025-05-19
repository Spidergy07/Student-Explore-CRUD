import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Assuming useAuth might be useful for user info display or logout
import { useNavigate } from 'react-router-dom'; // To redirect after success or logout

// Password Policy Check Function (Client-side)
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

const ChangePasswordPage: React.FC = () => {
  const { logout } = useAuth(); // Get user info and logout function
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Client-side Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
      setIsLoading(false);
      return;
    }

    // Check New Password Policy (Client-side)
    const policyError = checkPasswordPolicy(newPassword);
    if (policyError) {
        setError(policyError);
        setIsLoading(false);
        return;
    }

    // --- Call Backend API to change password ---
    // Replace with your actual API call function (e.g., from a services/api.ts file)
    try {
        const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
            credentials: 'include', // Send cookies
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            setSuccess(data.message || 'เปลี่ยนรหัสผ่านสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...');
            // Backend clears the cookie, so we should also log out client-side
            await logout(); // Clear auth context state
            // Redirect to login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Redirect after 2 seconds
        } else {
            setError(data.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
        }

    } catch (err) {
        console.error('Error calling change-password API:', err);
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
        setIsLoading(false);
    }
    // --- End API Call ---
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-md"> {/* Responsive container */}
      <div className="card animate-fade-in-down"> {/* Card styling */}
        <h2 className="text-2xl font-bold text-center mb-6">เปลี่ยนรหัสผ่าน</h2>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm mb-4" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm mb-4" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4"> {/* Spacing */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่านปัจจุบัน <span className="text-red-500">*</span></label>
            <input
              type="password"
              id="currentPassword"
              className="input-field mt-1"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่านใหม่ <span className="text-red-500">*</span></label>
            <input
              type="password"
              id="newPassword"
              className="input-field mt-1"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1.5">ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span></label>
            <input
              type="password"
              id="confirmNewPassword"
              className="input-field mt-1"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Add Password Policy information */}
          <div className="text-sm text-gray-500 mt-2">
              รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วย: ตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข, และสัญลักษณ์พิเศษอย่างน้อยอย่างละ 1 ตัว
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}> {/* Button styling */}
            {isLoading ? (
                 <span className="animate-spin-slow inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
            ) : null}
            {isLoading ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
