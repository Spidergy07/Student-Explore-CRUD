import React from 'react';

const LoginForm: React.FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Login form submitted');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label 
          htmlFor="username" 
          className="block text-sm font-semibold mb-1.5"
          style={{ color: 'var(--color-brand-neutral-dark)' }}
        >
          ชื่อผู้ใช้
        </label>
        <input 
          type="text" 
          id="username" 
          name="username"
          required 
          className="input-field" 
          placeholder="กรอกชื่อผู้ใช้ของคุณ"
        />
      </div>
      <div>
        <label 
          htmlFor="password" 
          className="block text-sm font-semibold mb-1.5"
          style={{ color: 'var(--color-brand-neutral-dark)' }}
        >
          รหัสผ่าน
        </label>
        <input 
          type="password" 
          id="password" 
          name="password"
          required 
          className="input-field" 
          placeholder="กรอกรหัสผ่านของคุณ"
        />
      </div>
      <div className="pt-2">
        <button 
          type="submit" 
          className="btn btn-primary w-full flex justify-center items-center"
        >
          เข้าสู่ระบบ
        </button>
      </div>
    </form>
  );
};

export default LoginForm; 