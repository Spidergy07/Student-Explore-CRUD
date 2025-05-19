import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface StudentWithPreferences {
  user_id: number;
  username: string;
  favorite_subjects: string[];
  dreams: string;
  dream_job: string;
  preferences_created_at?: string; // Optional, depending on API response
  preferences_updated_at?: string; // Optional, depending on API response
}

const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth(); // For display or other auth-related info
  const [students, setStudents] = useState<StudentWithPreferences[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/teachers/dashboard', { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`Failed to fetch student data: ${response.statusText} (${response.status})`);
        }
        const apiResponse = await response.json();
        if (apiResponse.status === 'success' && apiResponse.data && Array.isArray(apiResponse.data.students)) {
          setStudents(apiResponse.data.students);
        } else {
          setError('Could not parse student data from API.');
          setStudents([]);
          console.warn('API did not return expected student data structure:', apiResponse);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while fetching student data.';
        setError(errorMessage);
        console.error("Fetch student data error for teacher dashboard:", err);
        setStudents([]);
      }
      setIsLoading(false);
    };

    fetchStudentsData();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="card bg-base-100 shadow-xl p-6 md:p-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Teacher Dashboard
        </h1>
        <p className="mb-6 text-gray-600">ยินดีต้อนรับ, <span className="font-semibold text-teal-600">{user?.username || 'Teacher'}</span>! ดูข้อมูลการสำรวจของนักเรียนด้านล่าง</p>

        {isLoading && (
          <div className="text-center py-10">
            <span className="loading loading-lg loading-spinner text-primary"></span>
            <p className="mt-2 text-gray-500">Loading student data...</p>
          </div>
        )}

        {error && !isLoading && (
          <div role="alert" className="alert alert-error mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Error: {error}</span>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {students.length === 0 ? (
              <p className="text-center text-gray-500 py-10 italic">No student data available at the moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Favorite Subjects</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dreams</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dream Job</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.user_id} className="hover:bg-gray-50">
                        <td className="p-3 whitespace-nowrap text-sm text-gray-900">{student.user_id}</td>
                        <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-900">{student.username}</td>
                        <td className="p-3 text-sm text-gray-500">
                          {student.favorite_subjects && student.favorite_subjects.length > 0 
                            ? student.favorite_subjects.join(', ') 
                            : <span className="italic">None</span>}
                        </td>
                        <td className="p-3 text-sm text-gray-500 whitespace-pre-wrap min-w-[200px]">{student.dreams || <span className="italic">None</span>}</td>
                        <td className="p-3 text-sm text-gray-500 min-w-[150px]">{student.dream_job || <span className="italic">None</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboardPage; 