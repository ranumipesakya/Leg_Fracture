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
    <div className="font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      <PatientNavbar currentPage="physio" />

      {/* Header / Hero */}
      <section className="relative overflow-hidden border-b border-blue-100 bg-[#F0F7FF] dark:border-slate-800 dark:bg-slate-950">
        <div className="relative container mx-auto px-6 py-16 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div
                aria-hidden="true"
                className="pointer-events-none select-none opacity-0 inline-flex items-center gap-2 rounded-full border border-blue-300/70 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700 shadow-sm dark:border-cyan-700/60 dark:bg-slate-900/70 dark:text-cyan-300"
              >
                &nbsp;
              </div>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
                Stronger Recovery
                <span className="block text-[#2168d8] dark:text-cyan-300">Without the Guesswork</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm text-slate-600 sm:text-base md:text-lg dark:text-slate-300">
                Structured physiotherapy routines for post-surgery rehab, fall-related injuries, and chronic leg pain.
                Easy to follow, medically focused, and built to improve confidence step by step.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={scrollToOfferings}
                  className="rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Explore Programs
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-xl shadow-blue-100/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-300">
                  Recovery Summary
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                  3 Focused Programs
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Choose based on your condition and follow a guided path from gentle movement to stable strength.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-lg shadow-blue-100/60 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">5-10 min</p>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  per session
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-lg shadow-blue-100/60 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Stepwise</p>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  progression
                </p>
              </div>
            </div>
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
