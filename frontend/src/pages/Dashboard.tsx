import { FaHeartbeat, FaChevronRight } from 'react-icons/fa';
import PatientNavbar from '../components/PatientNavbar';
import { useAuth } from '../auth/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const safeUser = user ?? { firstName: 'User', lastName: '' };
  const userName = `${safeUser.firstName} ${safeUser.lastName}`.trim() || 'User';

  const uploadCategories = [
    {
      title: "Upload X-Ray",
      description: "Submit new scans for AI fracture analysis.",
      icon: <FaHeartbeat className="w-6 h-6 text-[#3B82F6] dark:text-cyan-400" />,
      color: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      title: "Medical Reports",
      description: "Keep your clinical history up to date.",
      icon: <FaChevronRight className="w-5 h-5 text-slate-400" />,
      color: "bg-slate-100 dark:bg-slate-800",
    },
    {
      title: "Physiotherapy Guidelines",
      description: "Follow your recommended exercises and recovery plan.",
      icon: <FaChevronRight className="w-5 h-5 text-slate-400" />,
      color: "bg-slate-100 dark:bg-slate-800",
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-[#0f172a] font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      <PatientNavbar currentPage="dashboard" />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hello, <span className="text-[#3B82F6] dark:text-cyan-400">{userName}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Welcome back to your diagnostic overview.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Upload Bento Cards */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-xl font-extrabold px-1 text-slate-800 dark:text-slate-200">Quick Uploads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {uploadCategories.map((item, index) => (
                <div 
                  key={index} 
                  className={`group p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 hover:scale-[1.02] transition-all cursor-pointer ${index === 0 ? 'md:col-span-2' : ''}`}
                  onClick={() => {
                    if (index === 0) window.location.hash = "/upload";
                    if (index === 2) window.location.hash = "/physio";
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-5">
                      <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">{item.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-full group-hover:bg-[#3B82F6] dark:group-hover:bg-cyan-500 group-hover:text-white dark:group-hover:text-slate-900 transition-colors">
                      <FaChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Analysis Status Placeholder */}
            <div className="p-8 rounded-[32px] bg-slate-900 dark:bg-slate-800 text-white shadow-2xl overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">System Analytics</h3>
                <p className="text-slate-400 text-sm font-medium">BoneScan AI engine is synchronized and ready for analysis.</p>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
            </div>
          </div>

          {/* Right Column: 3D Model Viewer */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-6 shadow-2xl shadow-blue-500/5 h-[650px] flex flex-col">
              <div className="flex items-center justify-between px-2 mb-4">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">3D Skeletal Visualization</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
              
              <div className="flex-1 w-full rounded-[30px] overflow-hidden bg-slate-50 dark:bg-slate-800/50 relative border border-slate-50 dark:border-slate-800">
                <model-viewer
                  src="/image.glb"
                  alt="3D Bone Model"
                  auto-rotate
                  camera-controls
                  shadow-intensity="1"
                  style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                >
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-2.5 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest shadow-xl border border-white/20 dark:border-slate-800 cursor-default">
                    Interactive Preview Mode
                  </div>
                </model-viewer>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
