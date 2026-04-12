import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface PatientNavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const PatientNavbar = ({ currentPage, onNavigate }: PatientNavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', page: 'dashboard' },
    { label: 'Physiotherapy', page: 'physio' },
    { label: 'Upload X-Ray', page: 'upload' },
  ];

  const navigate = (page: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate(page);
    else window.location.hash = `/${page}`;
  };

  const userToken = localStorage.getItem('userToken');
  const userEmail = localStorage.getItem('userEmail');

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    window.location.reload();
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
          {userToken ? (
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-full bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all duration-300 shadow-sm shadow-red-500/20"
              title={`Logged in as ${userEmail}`}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate('portal')}
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
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-center rounded-xl px-4 py-3 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all duration-300 shadow-sm shadow-red-500/20"
              title={`Logged in as ${userEmail}`}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate('portal')}
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
