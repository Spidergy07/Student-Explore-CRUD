import React from 'react';

// This is the structure expected by this component, transformed in TeacherDashboardPage
export interface StudentDataForTable {
  id: string; // user_id as string
  username: string;
  favoriteSubjects: string[];
  dreams: string;
  dreamJob: string;
  lastUpdated: string; // Formatted date string or 'Never'
}

interface TeacherStudentTableProps {
  students: StudentDataForTable[];
}

const TeacherStudentTable: React.FC<TeacherStudentTableProps> = ({ students }) => {
  if (!students || students.length === 0) {
    // This case should ideally be handled by the parent (TeacherDashboardPage)
    // but as a fallback:
    return <p className="text-center text-gray-500 py-8">No student data to display.</p>;
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg bg-white">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-6 py-3">Username</th>
            <th scope="col" className="px-6 py-3">Favorite Subjects</th>
            <th scope="col" className="px-6 py-3">Dreams</th>
            <th scope="col" className="px-6 py-3">Dream Job</th>
            <th scope="col" className="px-6 py-3">Preferences Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr 
              key={student.id} 
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b hover:bg-green-50 transition-colors duration-150`}
            >
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {student.username}
              </td>
              <td className="px-6 py-4">
                {student.favoriteSubjects.length > 0 
                  ? student.favoriteSubjects.join(', ') 
                  : <span className="text-gray-400 italic">No subjects listed</span>}
              </td>
              <td className="px-6 py-4 whitespace-pre-wrap break-words min-w-[200px] max-w-xs">
                {student.dreams || <span className="text-gray-400 italic">No dreams listed</span>}
              </td>
              <td className="px-6 py-4">
                {student.dreamJob || <span className="text-gray-400 italic">No dream job listed</span>}
              </td>
              <td className="px-6 py-4">{student.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherStudentTable; 