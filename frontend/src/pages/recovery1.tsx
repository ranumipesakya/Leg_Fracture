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
    title: "Ankle Pumps",
    duration: "5-10 min",
    sets: "3-5 sets",
    reps: "10-15 reps",
    imageUrl:
      publicUrl("ankel.gif"),
    videoUrl: "https://youtu.be/KxfFzSOAT7g?si=awzUIzo3vg5N8Uhx",
    instructions: [
      "Sit comfortably with your leg elevated on a pillow",
      "Slowly flex your ankle, pulling your toes toward you",
      "Hold for 2-3 seconds",
      "Point your toes away from you",
      "Hold for 2-3 seconds",
      "Repeat in a smooth, controlled motion",
    ],
    benefits: ["Improves blood circulation", "Reduces swelling", "Prevents blood clots"],
    precautions: ["Stop if you feel sharp pain", "Keep movements gentle"],
  },
  {
    id: 2,
    title: "Toe Curls",
    duration: "3-5 min",
    sets: "2-3 sets",
    reps: "10 reps",
    imageUrl:
      publicUrl("toe.gif"),
    videoUrl: "https://youtube.com/shorts/RoEmHev3KZ8?si=lhEJITCWNat3cPP5",
    instructions: [
      "Sit with your foot flat on the floor",
      "Place a small towel on the floor in front of you",
      "Use your toes to curl and grab the towel",
      "Hold for 5 seconds",
      "Release and repeat",
    ],
    benefits: ["Strengthens toe muscles", "Improves grip", "Foot coordination"],
    precautions: ["Don't force your toes", "Use a light towel initially"],
  },
  {
    id: 3,
    title: "Heel Slides",
    duration: "5-10 min",
    sets: "2-3 sets",
    reps: "10 per leg",
    imageUrl:
     publicUrl("heel.gif"),
    videoUrl: "https://youtu.be/A7fcobCVppc?si=cAgXsw8flhaYLWjF",
    instructions: [
      "Lie on your back with both legs straight",
      "Slowly slide your heel toward your buttocks",
      "Slide as far as comfortable (45-90 degrees)",
      "Hold for 5 seconds",
      "Slowly slide back to starting position",
    ],
    benefits: ["Knee range of motion", "Reduces stiffness", "Joint health"],
    precautions: ["Don't push through sharp pain", "Use a slider or cloth"],
  },
  {
    id: 4,
    title: "Quad Sets",
    duration: "5 min",
    sets: "3 sets",
    reps: "10 reps",
    imageUrl:
      publicUrl("sqare.gif"),
    videoUrl: "https://www.youtube.com/embed/5TUK4uT2nnw",
    instructions: [
      "Lie on your back with one leg straight",
      "Tighten the muscle on top of your thigh",
      "Push the back of your knee down into the floor",
      "Hold for 5 seconds",
      "Relax and repeat",
    ],
    benefits: ["Maintains quad strength", "Prevents atrophy", "Knee stability"],
    precautions: ["Don't hold your breath", "Keep kneecap moving upward"],
  },
  {
    id: 5,
    title: "Straight Leg Raise",
    duration: "5-10 min",
    sets: "3 sets",
    reps: "10 per leg",
    imageUrl:
      publicUrl("raise.gif"),
    videoUrl: "https://youtu.be/qvi8aM02_GY?si=kPnhnmYQnzjtWTjk",
    instructions: [
      "Lie on your back with one leg straight and one bent",
      "Tighten your thigh muscle on the straight leg",
      "Lift your leg about 12 inches off the floor",
      "Keep your knee completely straight",
      "Lower slowly with control",
    ],
    benefits: ["Strengthens quadriceps", "Leg stability", "Builds endurance"],
    precautions: ["Start with non-affected leg", "Stop if knee feels unstable"],
  },
  {
    id: 6,
    title: "Ankle Circles",
    duration: "3-5 min",
    sets: "10 each dir.",
    reps: "N/A",
    imageUrl:
      publicUrl("Ankle Circles.webp"),
    videoUrl: "https://youtu.be/mzTQGYGI0Ng?si=zocXp-4xcWj6Ia5F",
    instructions: [
      "Sit comfortably or lie back with your leg elevated",
      "Rotate your ankle slowly in a circular motion",
      "Do 10 circles clockwise",
      "Do 10 circles counter-clockwise",
    ],
    benefits: ["Improves ankle mobility", "Reduces stiffness", "Coordination"],
    precautions: ["Keep circles small if swollen", "Don't force range"],
  },
];

const Recovery1: React.FC = () => {
  const modulesSectionRef = useRef<HTMLElement | null>(null);
  const hasAutoScrolledRef = useRef(false);

  const jumpToModules = () => {
    if (hasAutoScrolledRef.current) return;
    hasAutoScrolledRef.current = true;
    modulesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] font-['Plus_Jakarta_Sans',_sans-serif]">
      <section
        className="h-[100svh] md:h-screen overflow-hidden"
        onWheel={(e) => {
          if (e.deltaY > 0) jumpToModules();
        }}
      >
        <div className="h-full w-full grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[45svh] md:h-full">
            <img
              src={publicUrl("surgery1.avif")}
              alt="Recovery"
              className="absolute inset-0 w-full h-full object-cover object-[50%_70%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10 md:to-black/0" />
          </div>

          <div className="flex items-center justify-center h-full px-6 py-8 md:py-10 md:px-10 bg-[#F0F7FF]">
            <div className="w-full max-w-xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-[#1A202C] uppercase leading-tight">
                Post-Surgery Recovery
                <br />
                Exercises
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section ref={modulesSectionRef} className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[#4A90FF] uppercase tracking-[0.3em] text-base md:text-lg font-black block mb-2">
            Step-by-Step
          </span>
          <h2 className="text-5xl md:text-6xl font-serif text-[#1A202C]">
            Recovery Modules
          </h2>
          <div className="w-16 h-[2px] bg-[#4A90FF] mx-auto mt-4"></div>
        </div>

        <div className="max-w-5xl mx-auto">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden mb-12 flex flex-col md:flex-row border border-gray-100 transition-transform hover:shadow-2xl"
            >
              <div className="md:w-1/2 flex flex-col bg-[#F8FBFF]">
                <div className="relative h-[250px] md:h-[280px]">
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.title}
                    className={`w-full h-full object-cover ${
                      exercise.id === 2
  ? "transform scale-110 object-[50%_75%]"
  : exercise.id === 5
  ? "object-center"
  : ""
                    }`}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 text-[#1A202C] text-xs font-bold px-3 py-1 rounded-full shadow">
                    Exercise Image
                  </div>
                </div>

                <div className="bg-[#1A202C] text-white text-xs uppercase tracking-wider px-4 py-3 font-semibold flex items-center justify-between gap-3">
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
                  <h3 className="text-2xl font-bold text-[#1A202C]">
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
                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">
                    Instructions
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {exercise.instructions.map((step, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-[#4A90FF]">{"\u2022"}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 mt-2">
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-green-600 mb-1">
                      Benefits
                    </h5>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      {exercise.benefits.join(", ")}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase text-red-500 mb-1">
                      Precautions
                    </h5>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      {exercise.precautions.join(", ")}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-wider">
                  Reps: {exercise.reps}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-5xl mx-auto bg-[#1A202C] rounded-2xl shadow-lg p-6 md:p-8">
          <h3 className="text-center text-lg md:text-xl font-extrabold tracking-tight text-white">
            Medical Disclaimer
          </h3>
          <p className="mt-3 text-sm md:text-base text-white/80 leading-relaxed">
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

export default Recovery1;
