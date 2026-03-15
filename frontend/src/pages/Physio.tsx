import React, { useRef } from "react";
import PatientNavbar from "../components/PatientNavbar";

interface PhysioGuideline {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  exercises: number;
  level: string;
}

const physioGuidelines: PhysioGuideline[] = [
  {
    id: "post-surgery",
    title: "Post-Surgery Recovery",
    subtitle: "Lower Leg Rehabilitation",
    description:
      "Gentle exercises for after fracture repair, ACL reconstruction, or other lower leg surgeries.",
    image: "/surgery1.avif",
    exercises: 6,
    level: "Gentle to Moderate",
  },
  {
    id: "after-fall",
    title: "After a Fall",
    subtitle: "Injury Rehabilitation",
    description:
      "Rehabilitation exercises for injuries sustained from falls or accidents.",
    image: "/fall1.png",
    exercises: 5,
    level: "Gentle to Moderate",
  },
  {
    id: "general-pain",
    title: "General Leg Pain",
    subtitle: "Chronic Care",
    description:
      "Exercises for chronic pain, muscle strain, or general discomfort.",
    image: "/normal.avif",
    exercises: 4,
    level: "All Levels",
  },
];

const Physio: React.FC = () => {
  const offeringsRef = useRef<HTMLElement | null>(null);

  const scrollToOfferings = () => {
    offeringsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sectionStyle: React.CSSProperties = {
    width: "100%",
    height: "calc(100vh - 72px)",
    minHeight: "500px",
    backgroundImage: "url('/physio.webp')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    position: "relative",
    fontFamily: "Arial, sans-serif",
  };

  const overlayStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.45), rgba(0,0,0,0.1))",
    display: "flex",
    alignItems: "center",
  };

  const contentStyle: React.CSSProperties = {
    marginLeft: "80px",
    color: "white",
    maxWidth: "500px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "64px",
    fontWeight: 300,
    lineHeight: "1.2",
    margin: 0,
  };

  const boldStyle: React.CSSProperties = {
    fontWeight: 800,
  };

  const buttonStyle: React.CSSProperties = {
    marginTop: "30px",
    padding: "14px 32px",
    backgroundColor: "#4A90FF",
    border: "none",
    borderRadius: "30px",
    fontSize: "20px",
    fontWeight: "bold",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  };

  const getCardOffset = (index: number) => {
    if (index === 0) {
      return "md:translate-y-12 md:-translate-x-4";
    }
    if (index === 1) {
      return "md:-translate-y-8";
    }
    return "md:translate-y-12 md:translate-x-4";
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-slate-950 font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      <PatientNavbar currentPage="physio" />

      {/* Hero Section */}
      <section style={sectionStyle}>
        <div style={overlayStyle}>
          <div style={contentStyle}>
            <h1 style={titleStyle}>
              Physiotherapy <br />
              <span style={boldStyle}>for rapid recovery</span>
            </h1>

            <button style={buttonStyle} onClick={scrollToOfferings}>
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Offerings Section */}
      <section
        ref={offeringsRef}
        id="physio-offerings"
        className="py-24 bg-[#F0F7FF] dark:bg-slate-950"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <span className="text-[#E74C3C] uppercase tracking-[0.4em] text-sm md:text-base font-black block mb-4">
              Our Services
            </span>
            <h2 className="text-5xl md:text-6xl font-serif text-[#1A202C] dark:text-white mb-6">
              What We&apos;re Offering
            </h2>
            <div className="w-16 h-[1px] bg-gray-300 dark:bg-slate-700 mx-auto"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {physioGuidelines.map((item, index) => (
              <div
                key={item.id}
                className={`group relative w-full sm:w-[320px] h-[520px] overflow-hidden cursor-pointer transition-all duration-500 ${getCardOffset(
                  index
                )}`}
                onClick={() => {
                  if (item.id === "after-fall") {
                    window.location.hash = "/recovery2";
                    return;
                  }
                  if (item.id === "general-pain") {
                    window.location.hash = "/recovery3";
                    return;
                  }
                  window.location.hash = "/recovery1";
                }}
              >
                <div className="h-full w-full overflow-hidden shadow-xl rounded-sm bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-500 flex flex-col justify-end p-6">
                    <p className="text-white/0 group-hover:text-white/90 text-sm italic mb-24 transition-all duration-500 translate-y-4 group-hover:translate-y-0 text-center px-4">
                      {item.description}
                    </p>
                  </div>

                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[85%] z-20">
                    <div className="bg-white dark:bg-slate-900 py-6 px-4 text-center shadow-2xl transition-all duration-300 group-hover:-translate-y-2 border border-transparent dark:border-slate-800">
                      <h3 className="font-serif text-xl text-[#1A202C] dark:text-white font-medium leading-tight">
                        {item.title}
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {item.subtitle}
                      </p>

                      <div className="max-h-0 overflow-hidden group-hover:max-h-12 transition-all duration-500">
                        <p className="text-[10px] text-[#4A90E2] font-bold uppercase tracking-[0.2em] mt-3">
                          {item.exercises} Exercises {"\u2022"} {item.level}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Physio;
