import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface AdminNavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const AdminNavbar = ({ currentPage, onNavigate }: AdminNavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Upload Exercises', page: 'admin' },
  ];

  const navigate = (page: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate(page);
    else window.location.hash = `/${page}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.hash = '#/dashboard';
  };

  useEffect(() => {
    const handleHashChange = () => setMobileMenuOpen(false);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-[#F0F7FF]/95 dark:bg-slate-950/95 backdrop-blur font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      {/* Left: Logo */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <button
          className="flex items-center gap-2.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-xl p-1"
          onClick={() => navigate('dashboard')}
          aria-label="BoneScan AI Dashboard Home"
        >
          <img src="/logo.png" alt="BoneScan Logo" className="h-16 md:h-20 w-auto object-contain" />
          <span className="text-base sm:text-xl font-extrabold text-[#1a2b3c] dark:text-white tracking-tight">
            BoneScan Admin
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => navigate(link.page)}
              className={`text-sm font-semibold transition-all relative pb-0.5 ${
                currentPage === link.page
                  ? 'text-indigo-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-indigo-600 after:rounded-full'
                  : 'text-[#1a2b3c] dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
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
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => navigate(link.page)}
              className={`w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                currentPage === link.page
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : 'text-[#1a2b3c] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
