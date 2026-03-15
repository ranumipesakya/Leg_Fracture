import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from './ThemeContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-[#F0F7FF] dark:bg-[#0f172a] font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      {/* Left side: Logo and Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border-[6px] border-[#3B82F6] flex items-center justify-center bg-white dark:bg-slate-900">
          <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-900" />
        </div>
        <span className="text-xl font-extrabold text-[#1a2b3c] dark:text-white tracking-tight">
          BoneScan AI
        </span>
      </div>

      {/* Right side: Auth Buttons & Theme Toggle */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-[#3B82F6] dark:text-cyan-400 hover:shadow-md transition-all"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
        </button>

        <div className="flex items-center gap-8">
          <a
            href="#/login"
            className="text-[#1a2b3c] dark:text-slate-300 font-bold text-sm hover:opacity-80 transition-opacity"
          >
            Login
          </a>
          <a
            href="#/register"
            className="px-6 py-2 bg-[#3B82F6] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all hover:scale-105"
          >
            REGISTER
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
