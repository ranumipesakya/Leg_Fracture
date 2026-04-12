import { FaUser, FaUserShield, FaArrowLeft } from 'react-icons/fa';

const PortalSelection = () => {
  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center font-['Plus_Jakarta_Sans',_sans-serif] px-4">
      
      <button 
        onClick={() => window.location.hash = '#/dashboard'}
        className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-800"
      >
        <FaArrowLeft />
        Back to Home
      </button>

      <div className="mb-12 flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Select Your <span className="text-blue-600">Portal</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">
          Choose your role to log into the correct secure environment for BoneScan AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        {/* Patient Portal Card */}
        <button
          onClick={() => window.location.hash = '#/auth'}
          className="group bg-white dark:bg-slate-900 rounded-[32px] p-8 sm:p-10 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-500/20 border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
            <FaUser className="text-4xl text-blue-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Patient Portal
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Access your personal X-ray uploads, prediction history, and physiotherapy recovery tracking.
          </p>
        </button>

        {/* Admin Portal Card */}
        <button
          onClick={() => window.location.hash = '#/admin-auth'}
          className="group bg-white dark:bg-slate-900 rounded-[32px] p-8 sm:p-10 shadow-xl shadow-indigo-900/5 hover:shadow-2xl hover:shadow-indigo-500/20 border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
            <FaUserShield className="text-4xl text-indigo-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Admin Portal
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage system configurations, user activities, and secure administrative tasks.
          </p>
        </button>

      </div>
    </div>
  );
};

export default PortalSelection;
