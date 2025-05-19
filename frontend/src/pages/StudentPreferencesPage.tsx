import React, { useState, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WithContext as ReactTags } from 'react-tag-input';
import type { Tag as ReactTagType } from 'react-tag-input';
import '../index.css'; // อิมพอร์ต index.css เพื่อใช้สไตล์

// Define custom props interface for ReactTags
interface ReactTagsProps {
  tags: ReactTagType[];
  handleDelete: (i: number) => void;
  handleAddition: (tag: ReactTagType) => void;
  handleDrag: (tag: ReactTagType, currPos: number, newPos: number) => void;
  placeholder?: string;
  inputFieldPosition?: 'top' | 'bottom' | 'inline' | 'none';
  allowDragDrop?: boolean;
  classNames?: Record<string, string>;
}

// Cast ReactTags to use the custom props interface
const ReactTagsTyped = ReactTags as React.ComponentType<ReactTagsProps>;

interface PreferenceDataFromAPI {
  favorite_subjects: string[];
  dreams: string;
  dream_job: string;
}

interface PreferenceFormData {
  dreams: string;
  dream_job: string;
}

interface PreferenceSubmissionData {
  favoriteSubjects: string[];
  dreams: string;
  dream_job: string;
}

const StudentPreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PreferenceFormData>({ dreams: '', dream_job: '' });
  const [tags, setTags] = useState<ReactTagType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>(''); // เก็บค่าช่องกรอก
  const [tagError, setTagError] = useState<string | null>(null); // เก็บข้อผิดพลาดเกี่ยวกับแท็ก

  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/students/preferences', { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`Failed to fetch preferences: ${response.statusText} (${response.status})`);
        }
        const apiResponse = await response.json();
        if (apiResponse.status === 'success' && apiResponse.data) {
          const prefs: PreferenceDataFromAPI = apiResponse.data;
          setFormData({ dreams: prefs.dreams || '', dream_job: prefs.dream_job || '' });
          setTags(prefs.favorite_subjects 
            ? prefs.favorite_subjects.map((subject: string): ReactTagType => ({ 
                id: subject, 
                text: subject,
                className: ''
              })) 
            : []);
        } else {
          setFormData({ dreams: '', dream_job: '' });
          setTags([]);
          if (apiResponse.status !== 'success') {
            console.warn('API indicated not successful for fetching preferences:', apiResponse.message);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Could not load your preferences.';
        setError(errorMessage);
        console.error("Fetch preferences error:", err);
      }
      setIsLoading(false);
    };

    fetchPreferences();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteTag = (i: number) => {
    setTimeout(() => {
      setTags(tags.filter((_tag, index) => index !== i));
    }, 0);
  };

  const handleAddTag = (tag: ReactTagType) => {
    console.log('handleAddTag called with tag:', tag);
    const newTagWithName: ReactTagType = { ...tag, className: tag.className || '' };
    if (!tags.find(t => t.text.toLowerCase() === newTagWithName.text.toLowerCase())) {
      setTags([...tags, newTagWithName]);
      setInputValue(''); // ล้างช่องกรอกหลังเพิ่มแท็ก
      setTagError(null); // ล้างข้อผิดพลาด
    } else {
      setTagError(`แท็ก "${newTagWithName.text}" มีอยู่แล้ว`);
    }
  };

  const handleDragTag = (tag: ReactTagType, currPos: number, newPos: number) => {
    const newTags = tags.slice();
    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);
    setTags(newTags);
  };

  const handleInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value); // อัปเดต inputValue เมื่อมีการพิมพ์
    setTagError(null); // ล้างข้อผิดพลาดเมื่อเริ่มพิมพ์ใหม่
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // ป้องกันการส่งฟอร์ม
      if (inputValue.trim()) {
        const newTag: ReactTagType = { id: inputValue.trim(), text: inputValue.trim(), className: '' };
        handleAddTag(newTag);
      }
    }
  };

  const handleAddTagFromButton = () => {
    if (inputValue.trim()) {
      const newTag: ReactTagType = { id: inputValue.trim(), text: inputValue.trim(), className: '' };
      handleAddTag(newTag);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const submissionData: PreferenceSubmissionData = {
      dreams: formData.dreams,
      dream_job: formData.dream_job,
      favoriteSubjects: tags.map(tag => tag.text),
    };

    try {
      const response = await fetch('/api/students/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submissionData),
      });
      const apiResponse = await response.json();
      if (response.ok && apiResponse.status === 'success') {
        setSuccess('บันทึกข้อมูลความชอบเรียบร้อยแล้ว!');
        if (apiResponse.data) {
          const prefs: PreferenceDataFromAPI = apiResponse.data;
          setFormData({ dreams: prefs.dreams || '', dream_job: prefs.dream_job || '' });
          setTags(prefs.favorite_subjects 
            ? prefs.favorite_subjects.map((subject: string): ReactTagType => ({ 
                id: subject, 
                text: subject,
                className: ''
              })) 
            : []);
        }
      } else {
        setError(apiResponse.message || 'ไม่สามารถบันทึกข้อมูลความชอบได้');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด';
      setError(errorMessage);
      console.error("Submit preferences error:", err);
    }
    setIsLoading(false);
  };

  if (isLoading && tags.length === 0 && !formData.dreams && !formData.dream_job) {
    return <div className="flex justify-center items-center min-h-screen">กำลังโหลดข้อมูลความชอบ...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <div className="card">
        <h1 className="text-3xl font-bold mb-2 text-center animate-fade-in">ความชอบของฉัน</h1>
        <p className="text-center text-brand-neutral mb-8 animate-fade-in-up">
          สวัสดี, <span className="font-bold text-brand-primary">{user?.username || 'นักเรียน'}</span>! บอกเราเกี่ยวกับสิ่งที่คุณสนใจและใฝ่ฝัน
        </p>

        {error && <div className="alert alert-error mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}
        {success && <div className="alert alert-success mb-4 p-4 bg-green-100 text-green-700 border border-green-300 rounded-md">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="favorite_subjects" className="block text-sm font-medium text-brand-neutral-dark mb-1.5">วิชาที่ชอบ</label>
            {/* ช่องกรอกและปุ่มเพิ่ม */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="input-field flex-grow"
                placeholder="พิมพ์ชื่อวิชาและกดเพิ่ม"
                value={inputValue}
                onChange={handleInputValueChange}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddTagFromButton}
                disabled={!inputValue.trim()}
              >
                เพิ่ม
              </button>
            </div>
            {/* แสดงรายการแท็ก */}
            <ReactTagsTyped
              tags={tags}
              handleDelete={handleDeleteTag}
              handleAddition={() => { /* no-op */ }}
              handleDrag={handleDragTag}
              placeholder=""
              inputFieldPosition="none"
              allowDragDrop={true}
              classNames={{
                tags: 'react-tags__selected custom-tags-container',
                tag: 'custom-tag animate-fade-in-up',
                remove: 'custom-remove-btn',
              }}
            />
            {tagError && <p className="text-xs text-red-500 mt-1.5">{tagError}</p>}
            <p className="text-xs text-brand-neutral mt-1.5">คุณสามารถลากเพื่อจัดลำดับวิชา หรือกด Enter หรือคลิกปุ่ม "เพิ่ม" เพื่อเพิ่มวิชา</p>
          </div>

          <div>
            <label htmlFor="dreams" className="block text-sm font-medium text-brand-neutral-dark mb-1.5">ความฝันและแรงบันดาลใจ</label>
            <textarea
              id="dreams"
              name="dreams"
              className="input-field mt-1 h-32 resize-y"
              value={formData.dreams}
              onChange={handleInputChange}
              placeholder="ความฝันของคุณในอนาคตคืออะไร? คุณหวังว่าจะประสบความสำเร็จในเรื่องใดบ้าง?"
            />
          </div>

          <div>
            <label htmlFor="dream_job" className="block text-sm font-medium text-brand-neutral-dark mb-1.5">อาชีพในฝัน</label>
            <input
              type="text"
              id="dream_job"
              name="dream_job"
              className="input-field mt-1"
              value={formData.dream_job}
              onChange={handleInputChange}
              placeholder="อาชีพในอุดมคติของคุณคืออะไร?"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading && (tags.length > 0 || !!formData.dreams || !!formData.dream_job)}>
            {isLoading && (tags.length > 0 || !!formData.dreams || !!formData.dream_job) ? (
              <span className="animate-spin-slow inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
            ) : null}
            {isLoading && (tags.length > 0 || !!formData.dreams || !!formData.dream_job) ? 'กำลังบันทึก...' : 'บันทึกข้อมูลความชอบ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentPreferencesPage;