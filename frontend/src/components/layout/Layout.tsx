import React, { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps {
  children?: ReactNode; // children prop is optional if only using Outlet
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {children || <Outlet />}
      </main>
      <footer
        className="w-full p-4 text-center text-sm border-t bg-white"
        style={{
          color: 'var(--color-brand-neutral)',
          borderColor: 'var(--color-brand-neutral-light)',
        }}
      >
        © {new Date().getFullYear()} Student Exploration พัฒนาโดย Oppabank
      </footer>
    </div>
  );
};

export default Layout; 