import { useState, useEffect } from 'react';
import { FaHeartbeat, FaChevronRight, FaRegCalendarAlt, FaSnowflake, FaCompress, FaArrowUp, FaBed } from 'react-icons/fa';
import PatientNavbar from '../components/PatientNavbar';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const userEmail = localStorage.getItem('userEmail');
  let userName = 'User';
  if (userEmail) {
    const rawName = userEmail.split('@')[0];
    userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  }

  const greeting = getGreeting();

  const firstAidSteps = [
    { title: "Rest", desc: "Minimize movement to prevent further injury.", icon: <FaBed className="w-5 h-5 text-blue-600" /> },
    { title: "Ice", desc: "Apply ice for 15-20 mins to reduce swelling.", icon: <FaSnowflake className="w-5 h-5 text-blue-400" /> },
    { title: "Compress", desc: "Wrap the area firmly but not tightly.", icon: <FaCompress className="w-5 h-5 text-indigo-500" /> },
    { title: "Elevate", desc: "Keep the limb above the heart level.", icon: <FaArrowUp className="w-5 h-5 text-emerald-500" /> },
  ];

  const uploadCategories = [
    {
      title: "Upload X-Ray",
      description: "AI-powered fracture analysis and detection.",
      icon: <FaHeartbeat className="w-8 h-8 text-blue-600" />,
      colorClass: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
    },
    {
      title: "Physiotherapy",
      description: "Personalized recovery exercises and guidelines.",
      icon: null,
      colorClass: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
    }
  ];

  return (
    <div className="font-['Plus_Jakarta_Sans',_sans-serif] bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-500">
      <PatientNavbar currentPage="dashboard" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16 lg:py-20">
        
        {/* Large Modern Header */}
        <div className="relative mb-8 md:mb-12 overflow-hidden p-6 sm:p-8 md:p-12 rounded-[28px] sm:rounded-[36px] md:rounded-[48px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 md:gap-10">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                {greeting}, <span className="text-blue-600 dark:text-blue-400">{userName}</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-4 sm:mt-5 md:mt-6 text-base sm:text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                Your professional AI-powered diagnostic portal for musculoskeletal health.
              </p>
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
               <div className="w-full lg:w-auto px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-4 sm:gap-5 md:gap-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FaRegCalendarAlt className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Session</p>
                    <p className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg md:text-xl">
                      {currentTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[12px] font-bold text-blue-500 dark:text-blue-400 uppercase mt-1">
                      {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
               </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-12">
          
          <div className="lg:col-span-12 xl:col-span-7 space-y-8 md:space-y-10 lg:space-y-12">
            
            {/* Quick Actions Area */}
            <div className="space-y-6 md:space-y-8 lg:space-y-12">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 md:gap-4">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
                Quick Actions
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                {uploadCategories.map((item, index) => (
                    <div 
                    key={index} 
                    role="button"
                    tabIndex={0}
                    className={`group relative p-6 sm:p-8 md:p-10 rounded-[24px] sm:rounded-[32px] md:rounded-[40px] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl transition-shadow cursor-pointer h-full min-h-[180px] sm:min-h-[200px] md:min-h-[220px] flex flex-col justify-center`}
                    onClick={() => {
                        if (index === 0) window.location.hash = "/upload";
                        if (index === 1) window.location.hash = "/physio";
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                        if (index === 0) window.location.hash = "/upload";
                        if (index === 1) window.location.hash = "/physio";
                        }
                    }}
                    >
                    <div className="flex items-center justify-between h-full">
                        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
                        {item.icon && (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                            {item.icon}
                            </div>
                        )}
                        <div>
                            <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight">{item.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">
                            {item.description}
                            </p>
                        </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <FaChevronRight className="w-6 h-6 text-slate-300" />
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Fracture First Aid */}
            <div className="space-y-6 md:space-y-8 lg:space-y-12">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 md:gap-4">
                    <div className="w-1.5 h-10 bg-red-500 rounded-full" />
                    Fracture First-Aid (R.I.C.E Method)
                </h2>
                <div className="p-6 sm:p-8 md:p-10 rounded-[24px] sm:rounded-[36px] md:rounded-[48px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
                        {firstAidSteps.map((step, i) => (
                            <div key={i} className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                        {step.icon}
                                    </div>
                                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest">{step.title}</h4>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

          </div>

          {/* Large Visualization Section */}
          <div className="lg:col-span-12 xl:col-span-5">
            <div className="xl:sticky xl:top-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] sm:rounded-[40px] xl:rounded-[56px] p-6 sm:p-8 md:p-10 shadow-3xl h-auto xl:h-[860px] flex flex-col">
              <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
                <div className="space-y-1">
                    <span className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Diagnostic Analysis</span>
                    <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Live Skeletal Preview</h4>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">
                  Active
                </div>
              </div>
              
              <div className="flex-1 w-full min-h-[320px] sm:min-h-[420px] xl:min-h-0 rounded-[24px] sm:rounded-[36px] xl:rounded-[48px] overflow-hidden bg-slate-50 dark:bg-slate-800/20 relative border border-slate-50 dark:border-slate-800 shadow-inner">
                <model-viewer
                  src="/image.glb"
                  alt="3D Bone Model"
                  auto-rotate
                  camera-controls
                  shadow-intensity="1.5"
                  style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                >
                  <div className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-[11px] md:text-[12px] font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-2xl border border-white/10 flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Interactive Mode
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
