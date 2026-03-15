import { FaEdit, FaArrowLeft, FaShieldAlt, FaIdCard, FaHistory, FaUserMd } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import PatientNavbar from '../components/PatientNavbar';

const ViewProfile = () => {
  const { user } = useAuth();
  const safeUser = user ?? { firstName: 'User', lastName: '', email: '', phone: '', gender: '', dob: '', initials: 'U', avatar: '' };

  const sections = [
    {
      title: 'Identity & Access',
      icon: <FaShieldAlt className="text-cyan-500" />,
      fields: [
        { label: 'Full Name', value: `${safeUser.firstName} ${safeUser.lastName}` },
        { label: 'Email Address', value: safeUser.email },
        { label: 'Patient ID', value: `BONE-${Math.floor(100000 + Math.random() * 900000)}` },
      ]
    },
    {
      title: 'Personal Details',
      icon: <FaIdCard className="text-blue-500" />,
      fields: [
        { label: 'Gender', value: safeUser.gender || 'Not specified' },
        { label: 'Date of Birth', value: safeUser.dob || 'Not specified' },
        { label: 'Contact Number', value: safeUser.phone || 'Not provided' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-[#0f172a] transition-colors duration-300 font-['Plus_Jakarta_Sans',_sans-serif]">
      <PatientNavbar currentPage="profile" />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar / Profile Card */}
          <div className="w-full md:w-1/3 sticky top-24">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-400/10 dark:bg-cyan-400/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#3B82F6] to-cyan-400 p-1 mx-auto mb-6">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-inner overflow-hidden">
                    {safeUser.avatar ? (
                      <img
                        src={safeUser.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-extrabold bg-gradient-to-br from-[#3B82F6] to-cyan-400 bg-clip-text text-transparent">
                        {safeUser.initials || 'U'}
                      </span>
                    )}
                  </div>
                </div>
                
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {safeUser.firstName} {safeUser.lastName}
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Verified Patient</p>
                
                <div className="flex justify-center gap-3 mb-8">
                  <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Medical AI</div>
                  <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active</div>
                </div>

                <button
                  onClick={() => (window.location.hash = '/edit-profile')}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 dark:shadow-cyan-500/20"
                >
                  <FaEdit /> Edit Account
                </button>
                
                <button
                  onClick={() => (window.location.hash = '/dashboard')}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <FaArrowLeft size={12} /> Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Info Section */}
          <div className="flex-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                  <span className="w-2 h-8 bg-cyan-500 rounded-full" />
                  Health Profile
                </h2>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Confidential Information</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {sections.map((section) => (
                  <div key={section.title} className="space-y-6">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                      {section.icon}
                      {section.title}
                    </div>
                    <div className="space-y-5">
                      {section.fields.map((f) => (
                        <div key={f.label} className="group cursor-default">
                          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 group-hover:text-cyan-500 transition-colors">
                            {f.label}
                          </p>
                          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                            {f.value || '—'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional "Activity" or "History" Mockup Card for filling space/premium feel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                <FaHistory className="absolute -bottom-4 -right-4 text-white/10 size-32 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                <h3 className="text-lg font-bold mb-2">Scan History</h3>
                <p className="text-white/70 text-sm mb-6">Review your past bone fracture scans and AI analysis reports.</p>
                <button 
                  onClick={() => (window.location.hash = '/history')}
                  className="px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-sm font-bold transition-all"
                >
                  View Activity
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-500/5 relative overflow-hidden group">
                <FaUserMd className="absolute -bottom-4 -right-4 text-slate-100 dark:text-slate-800/50 size-32 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Assigned Doctor</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Consult with our AI-powered medical specialists.</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold">AI</div>
                   <div className="text-xs font-bold text-slate-400">Dr. BoneScan Assist</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ViewProfile;
