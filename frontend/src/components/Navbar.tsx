const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-[#F0F7FF] font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* Left side: Logo and Name */}
      <div className="flex items-center gap-3">
        {/* Stylized Circle Icon */}
        <div className="w-8 h-8 rounded-full border-[6px] border-[#3B82F6] flex items-center justify-center bg-white">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        <span className="text-xl font-extrabold text-[#1a2b3c] tracking-tight">
          BoneScan AI
        </span>
      </div>

      {/* Right side: Auth Buttons */}
      <div className="flex items-center gap-8">
        <a
          href="#/login"
          className="text-[#1a2b3c] font-bold text-sm hover:opacity-80 transition-opacity"
        >
          Login
        </a>
        <a
          href="#/register"
          className="px-6 py-2 bg-[#3B82F6] text-white font-bold text-sm rounded-[4px] shadow-sm hover:bg-blue-600 transition-colors uppercase tracking-wider"
        >
          REGISTER
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
