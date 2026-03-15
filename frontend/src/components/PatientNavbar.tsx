import { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaEdit, FaSignOutAlt, FaChevronDown, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from './ThemeContext';

interface PatientNavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const PatientNavbar = ({ currentPage, onNavigate }: PatientNavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const safeUser = user ?? { firstName: 'User', lastName: '', initials: 'U', email: '', avatar: '' };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { label: 'Upload X-Ray', page: 'upload' },
    { label: 'Reports', page: 'history' },
    { label: 'Physiotherapy', page: 'physio' },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.hash = '/';
  };

  const navigate = (page: string) => {
    if (onNavigate) onNavigate(page);
    else window.location.hash = `/${page}`;
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 flex justify-between items-center px-8 py-4 bg-[#F0F7FF] dark:bg-[#0f172a] font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('dashboard')}>
        <div className="w-8 h-8 rounded-full border-[6px] border-[#3B82F6] flex items-center justify-center bg-white dark:bg-slate-900">
          <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-900" />
        </div>
        <span className="text-xl font-extrabold text-[#1a2b3c] dark:text-white tracking-tight">BoneScan AI</span>
      </div>

      {/* Center: Nav Links */}
      <div className="flex items-center gap-8">
        {[{ label: 'Dashboard', page: 'dashboard' }, ...navLinks].map((link) => (
          <button
            key={link.page}
            onClick={() => navigate(link.page)}
            className={`text-sm font-semibold transition-all relative pb-0.5 ${
              currentPage === link.page
                ? 'text-[#3B82F6] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#3B82F6] after:rounded-full'
                : 'text-[#1a2b3c] dark:text-slate-300 hover:text-[#3B82F6] dark:hover:text-cyan-400'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Right: Theme Toggle + User Avatar + Dropdown */}
      <div className="flex items-center gap-6">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-[#3B82F6] dark:text-cyan-400 hover:shadow-md transition-all"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group"
          >
            {/* Avatar Circle */}
            <div className="w-9 h-9 rounded-full bg-[#3B82F6] dark:bg-cyan-600 flex items-center justify-center shadow-md overflow-hidden">
              {safeUser.avatar ? (
                <img src={safeUser.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm leading-none">{safeUser.initials || 'U'}</span>
              )}
            </div>
            <span className="text-sm font-semibold text-[#1a2b3c] dark:text-white">
              {safeUser.firstName} {safeUser.lastName}
            </span>
            <FaChevronDown
              size={11}
              className={`text-[#64748b] dark:text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-blue-50 dark:border-slate-800 overflow-hidden z-50 animate-fade-in">
              {/* User Info Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-b border-blue-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#3B82F6] dark:bg-cyan-600 flex items-center justify-center shadow overflow-hidden">
                    {safeUser.avatar ? (
                      <img src={safeUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">{safeUser.initials || 'U'}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1a2b3c] dark:text-white truncate">{safeUser.firstName} {safeUser.lastName}</p>
                    <p className="text-xs text-[#64748b] dark:text-slate-400 truncate">{safeUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => navigate('profile')}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[#1a2b3c] dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  <FaUserCircle size={16} className="text-[#3B82F6] dark:text-cyan-400" />
                  View Profile
                </button>
                <button
                  onClick={() => navigate('edit-profile')}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[#1a2b3c] dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  <FaEdit size={15} className="text-[#3B82F6] dark:text-cyan-400" />
                  Edit Profile
                </button>

                <div className="my-2 border-t border-gray-100 dark:border-slate-800" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium"
                >
                  <FaSignOutAlt size={15} className="text-red-400" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PatientNavbar;
