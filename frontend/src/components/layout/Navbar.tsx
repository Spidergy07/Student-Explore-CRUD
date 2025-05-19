import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out flex items-center space-x-2
     text-gray-100 ${isActive
       ? 'bg-green-600 text-white shadow-sm'
       : 'hover:text-white hover:bg-brand-accent-light hover:bg-opacity-20'
     }
     `;
  
  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-3 rounded-md text-base font-medium transition-all duration-200 ease-in-out w-full text-left
     text-gray-100 ${isActive
       ? 'bg-green-600 text-white'
       : 'hover:text-white hover:bg-brand-accent-light hover:bg-opacity-20'
     }
     `;

  return (
    <>
      <nav 
        className={`${scrolled ? 'bg-opacity-95 shadow-md py-1' : 'bg-opacity-100 py-2'} 
          bg-primary fixed w-full z-30 top-0 transition-all duration-300`} 
        style={{ backgroundColor: 'var(--color-brand-primary)' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="text-white font-bold text-xl md:text-2xl hover:opacity-90 transition-all duration-200 flex items-center"
                onClick={closeMenu}
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                Student Explore
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-grow justify-center">
              <div className="flex items-baseline space-x-1 lg:space-x-3">
                <NavLink to="/" className={getNavLinkClass} end>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>หน้าหลัก</span>
                </NavLink>

                {isAuthenticated && user && (user.role === 'student' || user.role === 'user') && (
                  <>
                    <NavLink to="/student/main" className={getNavLinkClass}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>หน้าของฉัน</span>
                    </NavLink>
                    <NavLink to="/student/preferences" className={getNavLinkClass}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <span>ความชอบของฉัน</span>
                    </NavLink>
                  </>
                )}

                {isAuthenticated && user && user.role === 'teacher' && (
                  <NavLink to="/teacher/dashboard" className={getNavLinkClass}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Dashboard ครู</span>
                  </NavLink>
                )}
              </div>
            </div>
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center flex-shrink-0">
              {!isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link 
                    to="/login" 
                    className="text-gray-100 hover:bg-white hover:bg-opacity-10 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>เข้าสู่ระบบ</span>
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white bg-opacity-90 text-sm font-medium hover:bg-opacity-100 px-3 py-2 rounded-md transition-all shadow-sm hover:shadow flex items-center space-x-1.5"
                    style={{ color: 'var(--color-brand-primary-dark)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>ลงทะเบียน</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {user?.username && (
                    <div className="text-gray-100 text-sm mr-1">
                      <span className="opacity-90">สวัสดี, </span>
                      <span className="font-semibold">{user.username}</span>
                    </div>
                  )}
                  <NavLink to="/change-password" className={getNavLinkClass}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2v5a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6zm0 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 0H9m1 4v2m0-2h-1m1 2h1"/>
                    </svg>
                    <span>เปลี่ยนรหัสผ่าน</span>
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button 
                onClick={toggleMenu}
                className="text-gray-100 hover:text-white hover:bg-white hover:bg-opacity-10 inline-flex items-center justify-center p-2 rounded-md focus:outline-none transition-colors duration-200"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">{isMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div 
          className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden transition-all duration-300 ease-in-out`}
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white border-opacity-10">
            <NavLink 
              to="/" 
              className={getMobileNavLinkClass} 
              end
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                หน้าหลัก
              </div>
            </NavLink>

            {isAuthenticated && user && (user.role === 'student' || user.role === 'user') && (
              <>
                <NavLink 
                  to="/student/main" 
                  className={getMobileNavLinkClass}
                  onClick={closeMenu}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    หน้าของฉัน
                  </div>
                </NavLink>
                <NavLink 
                  to="/student/preferences" 
                  className={getMobileNavLinkClass}
                  onClick={closeMenu}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    ความชอบของฉัน
                  </div>
                </NavLink>
              </>
            )}

            {isAuthenticated && user && user.role === 'teacher' && (
              <NavLink 
                to="/teacher/dashboard" 
                className={getMobileNavLinkClass}
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard ครู
                </div>
              </NavLink>
            )}

            {/* Mobile Auth Buttons */}
            <div className="pt-2 border-t border-white border-opacity-10">
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 px-1 py-2">
                  <Link 
                    to="/login" 
                    className="w-full text-gray-100 hover:bg-white hover:bg-opacity-10 hover:text-white px-3 py-3 rounded-md text-base font-medium transition-all duration-200 flex items-center"
                    onClick={closeMenu}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    เข้าสู่ระบบ
                  </Link>
                  <Link 
                    to="/register" 
                    className="w-full bg-white text-center bg-opacity-90 text-base font-medium hover:bg-opacity-100 px-3 py-3 rounded-md transition-all shadow-sm hover:shadow flex items-center justify-center"
                    style={{ color: 'var(--color-brand-primary-dark)' }}
                    onClick={closeMenu}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    ลงทะเบียน
                  </Link>
                </div>
              ) : (
                <div className="px-1 py-2">
                  {user?.username && (
                    <div className="text-gray-100 text-base px-3 py-2">
                      <span className="opacity-90">สวัสดี, </span>
                      <span className="font-semibold">{user.username}</span>
                    </div>
                  )}
                  <NavLink
                    to="/change-password"
                    className={getMobileNavLinkClass}
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2v5a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6zm0 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 0H9m1 4v2m0-2h-1m1 2h1"/>
                      </svg>
                      เปลี่ยนรหัสผ่าน
                    </div>
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-3 rounded-md text-base font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center mt-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Add padding to main content */}
      <div className="h-16 md:h-20"></div>
    </>
  );
};

export default Navbar;