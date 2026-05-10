import { useEffect, useState, useRef } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { FaUser } from 'react-icons/fa';
import { auth } from '../utils/auth';
import { useTheme } from './ThemeContext';

interface PatientNavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const PatientNavbar = ({ currentPage, onNavigate }: PatientNavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const userToken = auth.getToken();
  const userEmail = localStorage.getItem('userEmail');

  const navLinks = [
    { label: 'Home', page: 'dashboard' },
    { label: 'Upload X-Ray', page: 'upload' },
    { label: 'Dashboard', page: 'analytics' },
    { label: 'Physiotherapy', page: 'physio' },
    { label: 'Healing Monitoring', page: 'healing-monitoring' },
  ];


  const navigate = (page: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate(page);
    else window.location.hash = `/${page}`;
  };

  const handleProfileNavigation = (tab: string) => {
    localStorage.setItem('profileTab', tab);
    setProfileMenuOpen(false);
    navigate('profile');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    auth.logout();
  };

  useEffect(() => {
    const handleHashChange = () => setMobileMenuOpen(false);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-[#E3EFFF]/95 dark:bg-slate-950/95 backdrop-blur font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      {/* Left: Logo */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <button
          className="flex items-center gap-2.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-xl p-1"
          onClick={() => navigate('dashboard')}
          aria-label="BoneScan AI Dashboard Home"
        >
          <img src="/logo.png" alt="BoneScan Logo" className="h-16 md:h-20 w-auto object-contain" />
          <span className="text-base sm:text-xl font-extrabold text-[#1a2b3c] dark:text-white tracking-tight">
            BoneScan AI
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
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

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {userToken ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                title="User Menu"
              >
                <FaUser className="text-xl" />
              </button>
              
              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userEmail}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manage Account</p>
                  </div>
                  <button 
                    onClick={() => handleProfileNavigation('overview')}
                    className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => handleProfileNavigation('edit')}
                    className="w-full text-left px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                  <button 
                    onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                    className="w-full text-left px-5 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('auth')}
              className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all duration-300 shadow-sm shadow-blue-500/20"
            >
              Login
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pb-4 pt-3 space-y-2">
          {/* Mobile Theme Toggle */}
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 mb-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all"
            >
              {theme === 'light' ? <><Moon size={14} /> Dark Mode</> : <><Sun size={14} /> Light Mode</>}
            </button>
          </div>

          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => navigate(link.page)}
              className={`w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                currentPage === link.page
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'text-[#1a2b3c] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
          {userToken ? (
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="px-4 py-2 mb-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userEmail}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage Account</p>
              </div>
              <button
                onClick={() => handleProfileNavigation('overview')}
                className="w-full text-left rounded-xl px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
              >
                View Profile
              </button>
              <button
                onClick={() => handleProfileNavigation('edit')}
                className="w-full text-left rounded-xl px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-center rounded-xl px-4 py-3 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all duration-300 shadow-sm shadow-red-500/20 mt-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('auth')}
              className="w-full text-center rounded-xl px-4 py-3 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all duration-300 shadow-sm shadow-blue-500/20"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default PatientNavbar;
