import Navbar from '../components/Navbar';

const LandingPage = () => {
  return (
    <div className="h-screen overflow-hidden bg-[#F0F7FF] font-['Plus_Jakarta_Sans',_sans-serif] flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 min-h-0 flex items-center px-12">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Content */}
          <div className="space-y-8">
            <h1 className="text-[72px] leading-[1.1] font-extrabold text-[#1E293B] tracking-tight">
              We help <br />
              patients <br />
              <span className="text-[#334155]">live a healthy,</span> <br />
              <span className="text-[#334155]">longer life.</span>
            </h1>
            
            <p className="text-[#64748B] text-xl max-w-lg leading-relaxed font-medium">
              Advanced fracture detection powered by AI. Get 
              faster results and better insights for your medical 
              imaging needs.
            </p>

            <button className="px-10 py-4 bg-[#3B82F6] text-white font-bold rounded-md tracking-wider shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:bg-[#2563EB] transition-all uppercase">
              Go to Dashboard
            </button>
          </div>

          {/* Right Side: Image */}
          <div className="relative flex justify-end">
            <div className="relative w-full max-w-[650px] overflow-hidden">
              {/* Blurred base image to create soft edges without visible blur bands */}
              <img
                src={`${import.meta.env.BASE_URL}doctor.png`}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-contain blur-md scale-105 opacity-60"
              />

              <img
                src={`${import.meta.env.BASE_URL}doctor.png`}
                alt="Medical Professional"
                className="relative block w-full h-auto object-contain"
              />

              {/* Soft fade effects to blend with background (left + right) */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#F0F7FF] to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#F0F7FF] to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default LandingPage;
