import Navbar from '../components/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-[#0f172a] font-['Plus_Jakarta_Sans',_sans-serif] flex flex-col transition-colors duration-300">
      {/* Navbar with distinct bottom line */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center py-16 px-8 md:px-16">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Content */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest">Advanced Orthopedic AI</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05]">
                We help <br />
                patients <br />
                <span className="text-blue-600 dark:text-cyan-400">live a healthy,</span> <br />
                <span className="text-slate-700 dark:text-slate-300">longer life.</span>
              </h1>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-lg leading-relaxed font-medium">
              Revolutionizing fracture detection with sub-millimeter AI precision. 
              Get forensic-grade analysis and interactive skeletal insights in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.location.hash = '#/dashboard'}
                className="px-10 py-4 bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-900 font-bold rounded-2xl tracking-wide shadow-2xl hover:scale-105 transition-all uppercase text-sm"
              >
                 Dashboard
              </button>
              <button 
                onClick={() => document.getElementById('steps-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all uppercase text-sm"
              >
                Learn More
              </button>
            </div>

            {/* Stats Row */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-8">
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">97%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">2.4s</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">24/7</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Support</p>
              </div>
            </div>
          </div>

          {/* Right Side: Image with No Borders */}
          <div className="flex justify-end items-center -mt-8">
            <img
              src={`${import.meta.env.BASE_URL}doctor.png`}
              alt="Medical AI Professional"
              className="w-full max-w-[600px] h-auto object-contain transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>

        </div>
      </main>

      {/* Steps Section */}
      <section id="steps-section" className="py-24 px-8 md:px-16 bg-white dark:bg-[#0f172a] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                Simple Steps to <br />
                <span className="text-blue-600 dark:text-cyan-400">Better Insights</span>
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Our clinical-grade workflow ensures accurate results and clear paths to recovery in minutes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-10 rounded-[40px] bg-[#F8FAFF] dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 group">
              <span className="text-[11px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-[0.25em] mb-6 block">Step 1</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Upload X-ray</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Securely upload high-resolution X-ray images of the affected area to our platform.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-10 rounded-[40px] bg-[#F8FAFF] dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 group">
              <span className="text-[11px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-[0.25em] mb-6 block">Step 2</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">AI Prediction</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                AI detects fractures within seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-10 rounded-[40px] bg-[#F8FAFF] dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 group">
              <span className="text-[11px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-[0.25em] mb-6 block">Step 3</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">History & Recovery</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Save your results securely and follow  physiotherapy plans.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Background Decorative Blur */}
      <div className="fixed top-0 right-0 w-[40%] h-[40%] bg-blue-400/10 dark:bg-cyan-400/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[40%] h-[40%] bg-indigo-400/10 dark:bg-indigo-400/5 rounded-full blur-[120px] pointer-events-none -z-10" />
    </div>
  );
};

export default LandingPage;
