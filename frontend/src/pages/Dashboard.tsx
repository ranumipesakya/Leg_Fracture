import {  FaHeartbeat, FaChevronRight } from 'react-icons/fa';
import PatientNavbar from '../components/PatientNavbar';

const Dashboard = () => {
  // Using the logged-in user context
  const userName = "Ranumi Pesakya";

  const uploadCategories = [
    {
      title: "Upload X-Ray",
      description: "Submit new scans for AI fracture analysis.",
      icon: <FaHeartbeat className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      title: "Medical Reports",
      description: "Keep your clinical history up to date.",
 
    },
    {
      title: "Physiotherapy Guidelines",
      description: "Follow your recommended exercises and recovery plan.",
      
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] font-['Plus_Jakarta_Sans',_sans-serif] text-[#1A1C1E]">
      <PatientNavbar currentPage="dashboard" />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Hello, <span className="text-blue-600">{userName}</span>
          </h1>
          <p className="text-slate-500 mt-2">Welcome back to your diagnostic overview.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload Bento Cards */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-semibold px-1">Quick Uploads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadCategories.map((item, index) => (
                <div 
                  key={index} 
                  className={`group p-6 rounded-3xl border border-white/50 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all cursor-pointer ${index === 0 ? 'md:col-span-2' : ''}`}
                  onClick={() => {
                    if (index === 0) window.location.hash = "/upload";
                    if (index === 2) window.location.hash = "/physio";
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <div className="bg-slate-100 p-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FaChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Analysis Status Placeholder */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-2">System Status</h3>
                <p className="text-slate-400 text-sm">BoneScan AI is active and ready for analysis.</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full -mr-10 -mt-10" />
            </div>
          </div>

          {/* Right Column: 3D Model Viewer */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white/40 border border-white rounded-[2.5rem] p-4 shadow-sm h-[600px] flex flex-col">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">3D Skeletal Preview</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                </div>
              </div>
              
              <div className="flex-1 w-full rounded-[2rem] overflow-hidden bg-slate-50 mt-2 relative">
                {/* Since the file is in /public, we reference it directly as /image.glb.
                  Ensure you have the <model-viewer> script in your index.html.
                */}
                <model-viewer
                  src="/image.glb"
                  alt="3D Bone Model"
                  auto-rotate
                  camera-controls
                  shadow-intensity="1"
                  style={{ width: '100%', height: '100%', backgroundColor: '#f8fafc' }}
                >
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-100">
                    Interact to rotate model
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
