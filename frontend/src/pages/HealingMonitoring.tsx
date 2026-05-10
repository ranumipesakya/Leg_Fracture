import React, { useEffect, useState } from 'react';
import PatientNavbar from '../components/PatientNavbar';
import { 
  Info, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Activity, 
  Search, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  HeartPulse,
  Microscope,
  Stethoscope,
  X,
  ExternalLink
} from 'lucide-react';

interface CaseStudy {
  image: string;
  title: string;
  shortDescription: string;
  modalDetails: string;
}

const HealingMonitoring: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [counts, setCounts] = useState({ sensitivity: 0, earlier: 0, radiation: 0 });
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  // Simple count-up effect for statistics
  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCounts({
        sensitivity: Math.min(100, Math.floor((currentStep / steps) * 100)),
        earlier: Math.min(4, Math.floor((currentStep / steps) * 4)),
        radiation: Math.min(85, Math.floor((currentStep / steps) * 85))
      });
      if (currentStep >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  const timelineStages = [
    {
      title: "Inflammation Phase",
      subtitle: "Stage 1",
      description: "Swelling and blood clot formation occur immediately after fracture to stabilize the area.",
      icon: <Activity className="w-6 h-6" />,
      color: "blue"
    },
    {
      title: "Soft Callus Formation",
      subtitle: "Stage 2",
      description: "New soft tissue begins connecting the broken bone, forming a biological bridge.",
      icon: <Zap className="w-6 h-6" />,
      color: "indigo"
    },
    {
      title: "Hard Callus Formation",
      subtitle: "Stage 3",
      description: "The callus gradually becomes stronger bone tissue as minerals are deposited.",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "purple"
    },
    {
      title: "Bone Remodeling",
      subtitle: "Stage 4",
      description: "The bone slowly regains its original structure and strength over several months.",
      icon: <HeartPulse className="w-6 h-6" />,
      color: "cyan"
    }
  ];

  const infoCards = [
    {
      title: "X-ray Monitoring",
      description: "Doctors commonly use follow-up X-rays to observe how the fractured bone heals over several weeks or months.",
      icon: <Search className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Ultrasound & Doppler Imaging",
      description: "Medical research suggests that ultrasound and Doppler imaging can sometimes identify healing progress earlier than traditional radiographs.",
      icon: <Microscope className="w-8 h-8 text-indigo-500" />
    },
    {
      title: "Callus Formation & Blood Flow",
      description: "Callus formation and healthy blood circulation are important indicators of successful bone recovery.",
      icon: <Activity className="w-8 h-8 text-cyan-500" />
    }
  ];

  const caseStudies: CaseStudy[] = [
    {
      image: "/detection1.jpg", // Using .jpg as found in filesystem, but user said .png. Adjusting to what works.
      title: "Ultrasound Callus Appearance",
      shortDescription: "This image shows different ultrasound appearances of healing callus.",
      modalDetails: "This figure explains how fracture callus may appear on ultrasound. Callus is new healing tissue formed around a broken bone. In the research paper, doctors observed callus brightness and appearance to understand whether healing was progressing. Brighter callus appearance was considered a positive sign of healing, while weak or absent callus could suggest delayed healing. This website only displays this as educational information and does not analyse ultrasound images."
    },
    {
      image: "/detection2.jpg", // Using .jpg as found in filesystem
      title: "Fracture Healing Monitoring",
      shortDescription: "This example shows ultrasound and Doppler monitoring after fracture treatment.",
      modalDetails: "This image demonstrates how doctors may use ultrasound and Doppler imaging after fracture surgery to observe callus formation and blood flow near the fracture site. The research paper explains that blood flow is important because healing bone needs vascular support. Doppler imaging can help doctors observe circulation around the healing area. This website does not perform Doppler analysis or healing diagnosis."
    },
    {
      image: "/detection3.png",
      title: "Research Accuracy Comparison",
      shortDescription: "This table summarizes research findings comparing ultrasound and X-ray monitoring.",
      modalDetails: "This table presents research results from a study of 40 patients with tibia or femur fractures treated using intramedullary nails. The study found that ultrasound predicted 87.5% union and 12.5% delayed or non-union as early as 6 weeks after surgery, while radiographs detected only 22.5% union at 3 months. The study also reported 100% sensitivity and 97.2% specificity for ultrasound in assessing fracture healing. These findings are used here only to educate users about medical monitoring methods."
    }
  ];

  const statuses = [
    {
      title: "Good Healing",
      description: "Bone recovery appears to be progressing normally with healthy healing signs.",
      icon: <CheckCircle className="w-10 h-10 text-emerald-500" />,
      color: "emerald",
      badge: "🟢"
    },
    {
      title: "Needs Follow-up",
      description: "Healing progress should continue to be monitored carefully through follow-up examinations.",
      icon: <Clock className="w-10 h-10 text-amber-500" />,
      color: "amber",
      badge: "🟡"
    },
    {
      title: "Delayed Healing",
      description: "Delayed recovery or poor healing signs may require additional medical evaluation.",
      icon: <AlertCircle className="w-10 h-10 text-rose-500" />,
      color: "rose",
      badge: "🔴"
    }
  ];

  return (
    <div className="min-h-screen bg-[#E3EFFF] dark:bg-slate-950 font-['Plus_Jakarta_Sans',_sans-serif] selection:bg-blue-100 selection:text-blue-900">
      <PatientNavbar currentPage="healing-monitoring" />

      {/* Hero Section */}
      <header className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05]" 
            style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 animate-bounce">
            <Stethoscope size={18} />
            Healthcare Support Section
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight leading-tight">
            Healing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Monitoring</span> Information
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12">
            Learn how doctors monitor fracture healing after treatment using medical imaging techniques and recovery assessments.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => document.getElementById('educational-guide')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 flex items-center gap-2"
            >
              Learn About Recovery Monitoring
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-32">
        
        {/* Educational Guide Section */}
        <section id="educational-guide" className="space-y-16 scroll-mt-24">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Understanding Recovery Monitoring</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Fracture healing is a biological recovery process where the body rebuilds damaged bone tissue over time. Doctors monitor this healing process to ensure the bone is recovering correctly and safely.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {infoCards.map((card, idx) => (
              <div key={idx} className="group p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-blue-100/50 dark:border-slate-800 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all duration-500">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{card.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Fracture Healing Timeline */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Fracture Healing Timeline</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">The typical progression of bone recovery through four distinct phases.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
            
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {timelineStages.map((stage, idx) => (
                <div 
                  key={idx} 
                  className={`relative p-8 rounded-3xl transition-all duration-500 cursor-pointer ${
                    activeStage === idx 
                      ? 'bg-white dark:bg-slate-900 shadow-xl ring-2 ring-blue-500/20' 
                      : 'hover:bg-white/50 dark:hover:bg-slate-900/50'
                  }`}
                  onMouseEnter={() => setActiveStage(idx)}
                >
                  <div className={`w-12 h-12 rounded-full mx-auto md:mx-0 flex items-center justify-center mb-6 transition-all duration-500 ${
                    activeStage === idx 
                      ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/40' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {stage.icon}
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm tracking-wider uppercase">{stage.subtitle}</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{stage.title}</h3>
                    <p className={`text-sm leading-relaxed transition-all duration-500 ${
                      activeStage === idx ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'
                    }`}>
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Monitoring Matters */}
        <section className="bg-slate-900 dark:bg-slate-900 rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/10 to-transparent"></div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Why Monitoring Matters</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Proper monitoring helps doctors ensure the healing process is on track and identify any complications before they become serious problems.
              </p>
              <ul className="space-y-4">
                {[
                  "Detect delayed healing early",
                  "Identify non-union risks",
                  "Adjust rehabilitation plans",
                  "Improve patient recovery outcomes"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <CheckCircle size={16} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-500/30">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h4 className="text-rose-100 font-bold mb-1">Critical Warning Signs</h4>
                    <p className="text-rose-200/70 text-sm">Identifying lack of callus formation early can prevent long-term mobility issues.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="text-emerald-100 font-bold mb-1">Success Indicators</h4>
                    <p className="text-emerald-200/70 text-sm">Consistent blood flow monitoring ensures the healing tissue is properly nourished.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Imaging Case Studies */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Imaging Case Studies</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Visual examples of fracture healing monitoring techniques.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((caseStudy, idx) => (
              <div key={idx} className="group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-blue-100/50 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-500">
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={caseStudy.image} 
                    alt={caseStudy.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 gap-4">
                    <button 
                      onClick={() => setSelectedCase(caseStudy)}
                      className="px-6 py-2 bg-white text-slate-900 rounded-full font-bold text-sm shadow-xl hover:bg-blue-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 flex items-center gap-2"
                    >
                      View Details <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{caseStudy.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {caseStudy.shortDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Healing Status Indicators */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Healing Status Indicators</h2>
            <p className="text-slate-500 dark:text-slate-400">Animated medical classifications for recovery assessment.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {statuses.map((status, idx) => (
              <div 
                key={idx} 
                className={`group p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 transition-all duration-500 hover:-translate-y-4 ${
                  status.color === 'emerald' ? 'border-emerald-100 hover:border-emerald-500 dark:border-emerald-900/30' :
                  status.color === 'amber' ? 'border-amber-100 hover:border-amber-500 dark:border-amber-900/30' :
                  'border-rose-100 hover:border-rose-500 dark:border-rose-900/30'
                }`}
              >
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-transform group-hover:rotate-12 duration-500 ${
                  status.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10' :
                  status.color === 'amber' ? 'bg-amber-50 dark:bg-amber-500/10' :
                  'bg-rose-50 dark:bg-rose-500/10'
                }`}>
                  {status.icon}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{status.badge}</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{status.title}</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                    {status.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Research Highlights */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Research Highlights</h2>
            <p className="text-slate-500 dark:text-slate-400">Key findings from clinical fracture recovery studies.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-1 rounded-3xl group">
              <div className="bg-white dark:bg-slate-900 rounded-[1.4rem] p-10 h-full flex flex-col justify-center text-center space-y-4 transition-all group-hover:bg-transparent">
                <span className="text-6xl font-black text-blue-600 group-hover:text-white transition-colors">{counts.sensitivity}%</span>
                <p className="text-slate-600 dark:text-slate-400 group-hover:text-blue-50 font-bold transition-colors">Sensitivity reported in some ultrasound studies</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-1 rounded-3xl group">
              <div className="bg-white dark:bg-slate-900 rounded-[1.4rem] p-10 h-full flex flex-col justify-center text-center space-y-4 transition-all group-hover:bg-transparent">
                <span className="text-6xl font-black text-indigo-600 group-hover:text-white transition-colors">{counts.earlier} Weeks</span>
                <p className="text-slate-600 dark:text-slate-400 group-hover:text-indigo-50 font-bold transition-colors">Earlier healing detection compared to standard X-rays</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 p-1 rounded-3xl group">
              <div className="bg-white dark:bg-slate-900 rounded-[1.4rem] p-10 h-full flex flex-col justify-center text-center space-y-4 transition-all group-hover:bg-transparent">
                <span className="text-6xl font-black text-cyan-600 group-hover:text-white transition-colors">{counts.radiation}%</span>
                <p className="text-slate-600 dark:text-slate-400 group-hover:text-cyan-50 font-bold transition-colors">Reduced radiation exposure from repeated radiographs</p>
              </div>
            </div>
          </div>
        </section>

        {/* Educational Notice */}
        <section className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/30 rounded-[2.5rem] p-12 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 rounded-3xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Info size={48} className="text-amber-500" />
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Important Educational Notice</h3>
                <div className="space-y-3 text-slate-600 dark:text-slate-400">
                  <p className="text-lg">This section is provided for <span className="font-bold text-amber-600">educational purposes only.</span></p>
                  <p>
                    This website does not perform ultrasound analysis, Doppler analysis, or healing diagnosis.
                    The AI model on this platform <span className="underline decoration-blue-500 decoration-2 underline-offset-4">only detects fractures from X-ray images</span>.
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white italic">
                    Please consult a qualified medical professional for diagnosis, treatment, and fracture recovery monitoring.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Case Study Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            onClick={() => setSelectedCase(null)}
          ></div>
          
          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            <button 
              onClick={() => setSelectedCase(null)}
              className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            
            <div className="md:w-1/2 h-64 md:h-auto bg-slate-100 dark:bg-slate-800">
              <img 
                src={selectedCase.image} 
                alt={selectedCase.title} 
                className="w-full h-full object-contain" 
              />
            </div>
            
            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedCase.title}
                </h3>
                <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
              </div>
              
              <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                <p>{selectedCase.modalDetails}</p>
              </div>
              
              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2 bg-amber-500 rounded-lg text-white">
                    <Info size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1 uppercase tracking-wider">Educational Disclaimer</p>
                    <p className="text-sm text-amber-800 dark:text-amber-300 opacity-90">
                      This information is for research education only. This website does not perform ultrasound analysis, Doppler analysis, or fracture healing diagnosis.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCase(null)}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-20 px-6 bg-slate-100 dark:bg-slate-900/50 text-center border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center gap-6 opacity-30">
            <HeartPulse size={24} />
            <Activity size={24} />
            <Stethoscope size={24} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide">
            EDUCATIONAL CONTENT INSPIRED BY PUBLISHED MEDICAL FRACTURE HEALING RESEARCH
          </p>
          <div className="w-24 h-1 bg-blue-500/20 mx-auto rounded-full"></div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HealingMonitoring;
