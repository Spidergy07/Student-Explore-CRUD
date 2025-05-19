import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Define a simple type for the preference data we expect to display
interface StudentDisplayPreferences {
  favorite_subjects: string[];
  dreams: string;
  dream_job: string;
}

const StudentMainPage: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<StudentDisplayPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/students/preferences', { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`ดึงข้อมูลความชอบไม่สำเร็จ: ${response.statusText} (${response.status})`);
        }
        const apiResponse = await response.json();
        if (apiResponse.status === 'success' && apiResponse.data) {
          setPreferences(apiResponse.data);
        } else {
          setPreferences({ favorite_subjects: [], dreams: '', dream_job: '' }); 
          if (apiResponse.status !== 'success' && apiResponse.message) {
            console.warn('API ไม่สำเร็จในการดึงข้อมูลความชอบสำหรับหน้าหลัก:', apiResponse.message);
            setError('ไม่พบข้อมูลความชอบ หรือมีข้อผิดพลาดบางอย่าง');
          } else if (apiResponse.status === 'success' && !apiResponse.data) {
            // Success but no data means no preferences set yet, which is fine.
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลความชอบของคุณได้';
        setError(errorMessage);
        console.error("Fetch preferences error for main page:", err);
        setPreferences({ favorite_subjects: [], dreams: '', dream_job: '' });
      }
      setIsLoading(false);
    };

    fetchPreferences();
  }, []);

  const StatCard: React.FC<{ title: string; value: string | string[]; icon?: string; colorClass?: string }> = ({ title, value, icon, colorClass = 'bg-indigo-50 border-indigo-200 text-indigo-700' }) => (
    <div className={`p-5 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 ${colorClass}`}>
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {Array.isArray(value) ? (
        value.length > 0 ? (
          <ul className="list-disc list-inside text-sm">
            {value.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        ) : <p className="text-sm italic text-gray-500">ยังไม่ได้ระบุ</p>
      ) : (
        <p className={`text-sm whitespace-pre-line ${!value ? 'italic text-gray-500' : ''}`}>
          {value || 'ยังไม่ได้ระบุ'}
        </p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-white shadow-2xl rounded-xl p-6 md:p-10 transition-all duration-300">
        <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">
            ยินดีต้อนรับ, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">{user?.username || 'นักเรียน'}</span>!
            </h1>
            <p className="text-lg text-gray-600">
            นี่คือพื้นที่สำรวจเส้นทางอนาคตของคุณ เริ่มต้นค้นหาสิ่งที่รักและวางแผนอาชีพในฝันได้เลย!
            </p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <span className="loading loading-xl loading-ball text-primary"></span>
            <p className="mt-4 text-gray-500 text-lg">กำลังโหลดข้อมูลของคุณ...</p>
          </div>
        )}

        {error && !isLoading && (
          <div role="alert" className="alert alert-error my-6 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
                <h3 className="font-bold">เกิดข้อผิดพลาด!</h3>
                <div className="text-xs">{error} ลองรีเฟรชหน้าหรือไปแก้ไขข้อมูลความชอบของคุณ</div>
            </div>
          </div>
        )}

        {!isLoading && !error && preferences && (
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b-2 border-gray-200 pb-2">ข้อมูลความชอบของคุณ</h2>
              {(preferences.favorite_subjects.length === 0 && !preferences.dreams && !preferences.dream_job) ? (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-lg shadow">
                    <p className="text-xl text-gray-500 italic mb-4">ดูเหมือนคุณยังไม่ได้ตั้งค่าความชอบเลยนะ</p>
                    <Link to="/student/preferences" className="btn btn-lg btn-primary gap-2">
                        {/* Icon placeholder, can use react-icons */} ✨ ไปตั้งค่าความชอบของฉัน
                    </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                  <StatCard title="วิชาที่ชอบ" value={preferences.favorite_subjects} icon="📚" colorClass="bg-sky-50 border-sky-200 text-sky-700" />
                  <StatCard title="ความฝันและแรงบันดาลใจ" value={preferences.dreams} icon="💭" colorClass="bg-amber-50 border-amber-200 text-amber-700" />
                  <StatCard title="อาชีพในฝัน" value={preferences.dream_job} icon="🚀" colorClass="bg-emerald-50 border-emerald-200 text-emerald-700" />
                </div>
              )}
            </div>
            
            <div className="text-center pt-6">
              <Link to="/student/preferences" className="btn btn-secondary btn-wide gap-2">
                {/* Icon placeholder */} ✏️ แก้ไข/อัปเดตข้อมูลความชอบ
              </Link>
            </div>

          </div>
        )}

        <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 italic">
            "อนาคตที่ดี ขึ้นอยู่กับการเตรียมตัวที่ดีในปัจจุบัน"
            </p>
        </div>
      </div>
    </div>
  );
};

export default StudentMainPage; 