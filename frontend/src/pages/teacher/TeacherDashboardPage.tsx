import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';

interface StudentData {
  id: number;
  username: string;
  // preferences data - adjust based on actual API response
  favoriteSubjects?: string[];
  dreams?: string;
  dreamJob?: string;
  // Add other fields like email, name if available
}

const TeacherDashboardPage: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Fetch students data when component mounts if API is ready
  useEffect(() => {
    const fetchStudentsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // const data = await apiService.getAllStudentsData(); 
        // setStudents(data);
        // Mock data for now:
        setStudents([
          { id: 1, username: 'student_jane', favoriteSubjects: ['ศิลปะ', 'ดนตรี'], dreams: 'อยากเดินทางรอบโลก', dreamJob: 'บล็อกเกอร์ท่องเที่ยว' },
          { id: 2, username: 'student_john', favoriteSubjects: ['คณิตศาสตร์', 'ฟิสิกส์'], dreams: 'อยากสร้าง AI', dreamJob: 'นักวิทยาศาสตร์ข้อมูล' },
          { id: 3, username: 'student_alex', favoriteSubjects: ['ประวัติศาสตร์'], dreams: 'อยากเขียนหนังสือ', dreamJob: 'นักเขียน' },
        ]);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลนักเรียนได้');
        console.error(err);
      }
      setIsLoading(false);
    };
    fetchStudentsData(); // Call it for now with mock data
  }, []);

  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && students.length === 0) {
    return <div className="text-center p-8">กำลังโหลดข้อมูลนักเรียน...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in-up">
      <div className="card bg-white shadow-xl p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-6 text-primary" style={{ color: 'var(--color-brand-primary)' }}>
          Dashboard - ข้อมูลนักเรียนทั้งหมด
        </h1>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">{error}</div>}

        <div className="mb-4">
          <input 
            type="text"
            className="input-field w-full md:w-1/2 lg:w-1/3"
            placeholder="ค้นหาชื่อนักเรียน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredStudents.length === 0 && !isLoading ? (
          <p className="text-gray-600">ไม่พบข้อมูลนักเรียน{searchTerm ? 'ที่ตรงกับคำค้นหา' : ''}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
              <thead style={{ backgroundColor: 'var(--color-brand-neutral-light)' }}>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อผู้ใช้ (Username)</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วิชาที่ชอบ</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ความฝัน</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">อาชีพในฝัน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.favoriteSubjects?.join(', ') || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.dreams || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.dreamJob || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboardPage; 