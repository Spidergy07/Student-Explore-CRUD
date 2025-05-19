import React, { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Assuming useAuth provides the token or handles auth headers

const StudentPreferencesForm: React.FC = () => {
  const [favoriteSubjects, setFavoriteSubjects] = useState<string[]>([]);
  const [currentSubject, setCurrentSubject] = useState('');
  const [dreams, setDreams] = useState('');
  const [dreamJob, setDreamJob] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { token } = useAuth(); // Or however you manage API calls with auth

  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/students/preferences', {
          headers: {
            'Content-Type': 'application/json',
            // Authorization header will be set by proxy or cookie if using httpOnly cookies
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Could not fetch preferences');
        }
        const result = await response.json();
        if (result.status === 'success' && result.data) {
          setFavoriteSubjects(result.data.favorite_subjects || []);
          setDreams(result.data.dreams || '');
          setDreamJob(result.data.dream_job || '');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('An unexpected error occurred.');
        }
      }
      setIsLoading(false);
    };

    fetchPreferences();
  }, [token]);

  const handleAddSubject = () => {
    if (currentSubject.trim() && !favoriteSubjects.includes(currentSubject.trim())) {
      setFavoriteSubjects([...favoriteSubjects, currentSubject.trim()]);
      setCurrentSubject('');
      setSuccessMessage(null);
      setError(null);
    }
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    setFavoriteSubjects(favoriteSubjects.filter(subject => subject !== subjectToRemove));
    setSuccessMessage(null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const preferencesToSave = {
      favoriteSubjects,
      dreams,
      dreamJob,
    };

    try {
      const response = await fetch('/api/students/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header will be set by proxy or cookie
        },
        body: JSON.stringify(preferencesToSave),
      });

      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Failed to save preferences.');
      }
      
      setSuccessMessage('บันทึกข้อมูลความชอบสำเร็จ!');
      if (result.data) { // Update state with data returned from backend (e.g., if backend cleans/formats data)
        setFavoriteSubjects(result.data.favorite_subjects || []);
        setDreams(result.data.dreams || '');
        setDreamJob(result.data.dream_job || '');
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('An unexpected error occurred while saving.');
      }
    }
    setIsLoading(false);
  };

  // Conditional rendering for loading state more granularly
  const initialLoading = isLoading && !favoriteSubjects.length && !dreams && !dreamJob && !error;

  if (initialLoading) {
    return <div className="flex justify-center items-center py-10"><p className='text-lg text-gray-500'>กำลังโหลดข้อมูลความชอบของคุณ...</p></div>;
  }

  return (
    <div className="card max-w-2xl mx-auto my-8 p-6 md:p-8 animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gradient-green">แก้ไขข้อมูลความชอบของคุณ</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm animate-fade-in">
          {error}
        </div>
      )}
      {successMessage && !isLoading && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm animate-fade-in">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="currentSubject" className="block text-sm font-semibold text-gray-700 mb-1">เพิ่มวิชาที่ชอบ</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="currentSubject"
              className="input-field flex-grow"
              value={currentSubject}
              onChange={(e) => setCurrentSubject(e.target.value)}
              placeholder="เช่น คณิตศาสตร์, ศิลปะ"
              disabled={isLoading} // Disable when submitting overall form
            />
            <button 
              type="button"
              onClick={handleAddSubject}
              className="btn btn-secondary whitespace-nowrap"
              disabled={!currentSubject.trim() || isLoading} // Also disable if form is submitting
            >
              เพิ่มวิชา
            </button>
          </div>
          {favoriteSubjects.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className='text-xs text-gray-500'>คลิกที่ชื่อวิชาเพื่อลบ:</p>
              <ul className="flex flex-wrap gap-2">
                {favoriteSubjects.map((subject, index) => (
                  <li 
                    key={index} 
                    onClick={() => !isLoading && handleRemoveSubject(subject)} // Prevent action if form submitting
                    className={`bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm shadow-sm ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors duration-150'}`}
                  >
                    {subject}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="dreams" className="block text-sm font-semibold text-gray-700 mb-1">ความฝันของคุณ</label>
          <textarea
            id="dreams"
            className="input-field min-h-[100px]"
            value={dreams}
            onChange={(e) => setDreams(e.target.value)}
            placeholder="เล่าถึงความฝัน หรือสิ่งที่อยากทำให้สำเร็จในอนาคต"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="dreamJob" className="block text-sm font-semibold text-gray-700 mb-1">อาชีพในฝัน</label>
          <input
            type="text"
            id="dreamJob"
            className="input-field"
            value={dreamJob}
            onChange={(e) => setDreamJob(e.target.value)}
            placeholder="เช่น นักพัฒนาซอฟต์แวร์, ศิลปิน, นักวิทยาศาสตร์"
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-full py-3 text-base relative transition-opacity duration-150 ${isLoading ? 'opacity-70' : 'opacity-100'}"
          disabled={isLoading}
        >
          {isLoading && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          )}
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลความชอบ'}
        </button>
      </form>
    </div>
  );
};

export default StudentPreferencesForm; 