const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-[#F0F7FF] dark:bg-slate-950 font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      {/* Left side: Logo and Name */}
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="BoneScan Logo" className="h-16 md:h-20 w-auto object-contain" />
        <span className="text-xl font-extrabold text-[#1a2b3c] dark:text-white tracking-tight">
          BoneScan AI
        </span>
      </div>

      <div />
    </nav>
  );
};

export default Navbar;
