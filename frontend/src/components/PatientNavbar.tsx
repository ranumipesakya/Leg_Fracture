import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from './ThemeContext';

interface PatientNavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const PatientNavbar = ({ currentPage, onNavigate }: PatientNavbarProps) => {
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { label: 'Upload X-Ray', page: 'upload' },
    { label: 'Physiotherapy', page: 'physio' },
  ];

  const navigate = (page: string) => {
    if (onNavigate) onNavigate(page);
    else window.location.hash = `/${page}`;
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

      {/* Right: Theme Toggle */}
      <div className="flex items-center gap-6">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-[#3B82F6] dark:text-cyan-400 hover:shadow-md transition-all"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
        </button>
      </div>
    </nav>
  );
};

export default PatientNavbar;
