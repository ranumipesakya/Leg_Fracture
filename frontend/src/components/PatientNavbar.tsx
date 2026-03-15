import { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaEdit, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';

interface PatientNavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const PatientNavbar = ({ currentPage, onNavigate }: PatientNavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const safeUser = user ?? { firstName: 'User', lastName: '', initials: 'U', email: '' };

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
    { label: 'History', page: 'history' },
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
    <nav className="sticky top-0 z-40 flex justify-between items-center px-8 py-4 bg-[#F0F7FF] font-['Plus_Jakarta_Sans',_sans-serif] border-b border-blue-50 shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('dashboard')}>
        <div className="w-8 h-8 rounded-full border-[6px] border-[#3B82F6] flex items-center justify-center bg-white">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        <span className="text-xl font-extrabold text-[#1a2b3c] tracking-tight">BoneScan AI</span>
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
                : 'text-[#1a2b3c] hover:text-[#3B82F6]'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Right: User Avatar + Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group"
        >
          {/* Avatar Circle */}
          <div className="w-9 h-9 rounded-full bg-[#8B9EC0] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm leading-none">{safeUser.initials || 'U'}</span>
          </div>
          <span className="text-sm font-semibold text-[#1a2b3c]">
            {safeUser.firstName} {safeUser.lastName}
          </span>
          <FaChevronDown
            size={11}
            className={`text-[#64748b] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-xl border border-blue-50 overflow-hidden z-50 animate-fade-in">
            {/* User Info Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8B9EC0] flex items-center justify-center shadow">
                  <span className="text-white font-bold text-sm">{safeUser.initials || 'U'}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a2b3c]">{safeUser.firstName} {safeUser.lastName}</p>
                  <p className="text-xs text-[#64748b] truncate max-w-[130px]">{safeUser.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1.5">
              <button
                onClick={() => navigate('profile')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a2b3c] hover:bg-blue-50 transition-colors font-medium"
              >
                <FaUserCircle size={16} className="text-[#3B82F6]" />
                View Profile
              </button>
              <button
                onClick={() => navigate('edit-profile')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a2b3c] hover:bg-blue-50 transition-colors font-medium"
              >
                <FaEdit size={15} className="text-[#3B82F6]" />
                Edit Profile
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
              >
                <FaSignOutAlt size={15} className="text-red-400" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PatientNavbar;
