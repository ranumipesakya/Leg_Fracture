import React, { useRef } from "react";

interface Exercise {
  id: number;
  title: string;
  duration: string;
  sets: string;
  reps: string;
  imageUrl: string;
  videoUrl: string;
  instructions: string[];
  benefits: string[];
  precautions: string[];
}

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.replace("/", "").trim();
      return id.length ? id : null;
    }

    if (
      parsed.hostname.endsWith("youtube.com") ||
      parsed.hostname.endsWith("youtube-nocookie.com")
    ) {
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/embed/")[1]?.split("/")[0]?.trim();
        return id?.length ? id : null;
      }

      const id = parsed.searchParams.get("v")?.trim();
      return id?.length ? id : null;
    }

    return null;
  } catch {
    return null;
  }
}

function getYouTubeWatchUrl(url: string): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}

function publicUrl(assetPath: string): string {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const trimmedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const trimmedAsset = assetPath.startsWith("/")
    ? assetPath.slice(1)
    : assetPath;
  return `${trimmedBase}${trimmedAsset}`;
}

const exercises: Exercise[] = [
  {
    id: 1,
    title: "Gentle Ankle Circles",
    duration: "5 minutes",
    sets: "1 set",
    reps: "5-10 each direction",
    imageUrl: publicUrl("Ankle Circles.webp"),
    videoUrl: "https://youtu.be/mzTQGYGI0Ng?si=zocXp-4xcWj6Ia5F",
    instructions: [
      "Sit in a chair with your foot off the ground",
      "Slowly rotate your ankle clockwise",
      "Make small, gentle circles",
      "Reverse direction and do the same",
      "Keep movements smooth and controlled",
      "If standing, hold onto something for balance",
    ],
    benefits: [
      "Restores ankle mobility",
      "Reduces stiffness",
      "Improves balance",
    ],
    precautions: [
      "Move very gently initially",
      "Use support if unsteady",
    ],
  },
  {
    id: 2,
    title: "Calf Stretches",
    duration: "5-10 minutes",
    sets: "2-3 sets",
    reps: "Hold 30 seconds, 3 times",
    imageUrl: publicUrl("calf.webp"),
    videoUrl: "https://youtu.be/u4o0Fz6MFe0?si=YUH1tay0mtERs0vt",
    instructions: [
      "Stand facing a wall with hands at shoulder height",
      "Step the affected leg back about 2 feet",
      "Keep your back heel on the floor",
      "Bend your front knee slightly",
      "Feel the stretch in your back calf",
      "Hold for 30 seconds, then switch legs",
    ],
    benefits: [
      "Stretches calf muscles",
      "Improves flexibility",
      "Reduces tension",
    ],
    precautions: [
      "Don't stretch too forcefully",
      "Keep heels flat on floor",
    ],
  },
  {
    id: 3,
    title: "Seated Marching",
    duration: "5 minutes",
    sets: "1 set",
    reps: "As comfortable",
    imageUrl: publicUrl("marching.webp"),
    videoUrl: "https://youtu.be/XeIeEv38kcc?si=S0quN2bxM8bZUZC9",
    instructions: [
      "Sit in a sturdy chair with feet flat on floor",
      "Lift your right knee as high as comfortable",
      "Lower it back down with control",
      "Lift your left knee",
      "Continue alternating in a marching motion",
      "Swing arms naturally if desired",
    ],
    benefits: [
      "Improves hip mobility",
      "Warms up joints",
      "Gets blood flowing",
    ],
    precautions: [
      "Don't lift knees too high if painful",
      "Keep back straight",
    ],
  },
  {
    id: 4,
    title: "Balance Weight Shifts",
    duration: "5 minutes",
    sets: "1 set",
    reps: "Hold 10-20 seconds each side",
    imageUrl: publicUrl("standing.gif"),
    videoUrl: "https://youtu.be/O4-q0_GpfdA?si=Er3r1b44qtD-EGnl",
    instructions: [
      "Stand behind a sturdy chair, holding it for support",
      "Shift your weight onto your right foot",
      "Hold for 10-20 seconds",
      "Return to center",
      "Shift weight to your left foot",
      "Hold for 10-20 seconds",
    ],
    benefits: [
      "Improves balance",
      "Builds weight-bearing confidence",
      "Strengthens legs",
    ],
    precautions: [
      "Always have support nearby",
      "Start with eyes open",
    ],
  },
  {
    id: 5,
    title: "Heel-to-Toe Walking",
    duration: "5-10 minutes",
    sets: "1 set",
    reps: "20 steps, rest, repeat",
    imageUrl: publicUrl("heel-walk.gif"),
    videoUrl: "https://youtu.be/eghMLTn8tDc?si=4vWwH8RzheCR0D0B",
    instructions: [
      "Stand near a wall or have someone walk beside you",
      "Place your heel directly in front of your toes",
      "Take slow, deliberate steps in a line",
      "Keep your eyes focused ahead",
      "Take 20 steps, rest, repeat",
      "Use wall or person for support if needed",
    ],
    benefits: [
      "Improves balance",
      "Enhances coordination",
      "Builds confidence",
    ],
    precautions: [
      "Clear the path of obstacles",
      "Start in a safe, open area",
    ],
  },
];

const Recovery2: React.FC = () => {
  const modulesSectionRef = useRef<HTMLElement | null>(null);
  const hasAutoScrolledRef = useRef(false);

  const jumpToModules = () => {
    if (hasAutoScrolledRef.current) return;
    hasAutoScrolledRef.current = true;
    modulesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-slate-950 font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      <section
        className="h-[100svh] md:h-screen overflow-hidden"
        onWheel={(e) => {
          if (e.deltaY > 0) jumpToModules();
        }}
      >
        <div className="h-full w-full grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[45svh] md:h-full">
            <img
              src={publicUrl("fall1.png")}
              alt="After a fall recovery"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10 md:to-black/0" />
          </div>

          <div className="flex items-center justify-center h-full px-6 py-8 md:py-10 md:px-10 bg-[#F0F7FF] dark:bg-slate-900 transition-colors">
            <div className="w-full max-w-xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-[#1A202C] dark:text-white uppercase leading-tight">
                After a Fall
                <br />
                Exercises
              </h1>
              <p className="mt-5 text-sm md:text-base text-gray-600 dark:text-slate-400 leading-relaxed max-w-lg">
                Start gently. If you have severe pain, dizziness, or a suspected
                fracture, seek medical care before exercising.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={modulesSectionRef} className="py-20 container mx-auto px-4 bg-[#F0F7FF] dark:bg-slate-950 transition-colors">
        <div className="text-center mb-16">
          <span className="text-[#4A90FF] uppercase tracking-[0.3em] text-base md:text-lg font-black block mb-2">
            Step-by-Step
          </span>
          <h2 className="text-5xl md:text-6xl font-serif text-[#1A202C] dark:text-white">
            Recovery Modules
          </h2>
          <div className="w-16 h-[2px] bg-[#4A90FF] mx-auto mt-4"></div>
        </div>

        <div className="max-w-5xl mx-auto">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden mb-12 flex flex-col md:flex-row border border-gray-100 dark:border-slate-800 transition-transform hover:shadow-2xl"
            >
              <div className="md:w-1/2 flex flex-col bg-[#F8FBFF] dark:bg-slate-800">
                <div className="relative h-[300px] md:h-[360px]">
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 text-[#1A202C] dark:text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    Exercise Image
                  </div>
                </div>

                <div className="bg-[#1A202C] dark:bg-slate-950 text-white text-xs uppercase tracking-wider px-4 py-3 font-semibold flex items-center justify-between gap-3">
                  <span>Suggested Video</span>
                  <a
                    href={getYouTubeWatchUrl(exercise.videoUrl) ?? exercise.videoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="normal-case text-[11px] font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-full transition-colors"
                  >
                    Open link
                  </a>
                </div>
              </div>

              <div className="md:w-1/2 p-8">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <h3 className="text-2xl font-bold text-[#1A202C] dark:text-white">
                    {exercise.id}. {exercise.title}
                  </h3>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-bold text-[#4A90FF]">
                      {exercise.duration}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase">
                      {exercise.sets}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase mb-2">
                    Instructions
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2">
                    {exercise.instructions.map((step, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-[#4A90FF]">{"\u2022"}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t dark:border-slate-800 pt-4 mt-2">
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-green-600 mb-1">
                      Benefits
                    </h5>
                    <p className="text-[11px] text-gray-500 dark:text-slate-500 leading-tight">
                      {exercise.benefits.join(", ")}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-red-500 mb-1">
                      Precautions
                    </h5>
                    <p className="text-[11px] text-gray-500 dark:text-slate-500 leading-tight">
                      {exercise.precautions.join(", ")}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Reps: {exercise.reps}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16 bg-[#F0F7FF] dark:bg-slate-950 transition-colors">
        <div className="max-w-5xl mx-auto bg-[#1A202C] dark:bg-slate-900 rounded-2xl shadow-lg p-6 md:p-8 border border-transparent dark:border-slate-800">
          <h3 className="text-center text-lg md:text-xl font-extrabold tracking-tight text-white">
            Medical Disclaimer
          </h3>
          <p className="mt-3 text-sm md:text-base text-white/80 dark:text-slate-400 leading-relaxed text-center">
            These exercises are provided to help with general recovery and
            mobility improvement. They are not a replacement for professional
            medical advice. If you experience severe pain, swelling, dizziness,
            or suspect a fracture, please stop exercising and consult a doctor
            or qualified healthcare professional before continuing.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Recovery2;
