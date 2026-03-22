const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-[#F0F7FF] dark:bg-slate-950 font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      {/* Left side: Logo and Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border-[6px] border-[#3B82F6] flex items-center justify-center bg-white dark:bg-slate-900">
          <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-900" />
        </div>
        <span className="text-xl font-extrabold text-[#1a2b3c] dark:text-white tracking-tight">
          BoneScan AI
        </span>
      </div>

      <div />
    </nav>
  );
};

export default Navbar;
