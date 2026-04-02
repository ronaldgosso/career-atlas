"use client";

export function LoadingOrb() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      {/* Outer ring */}
      <div className="absolute h-full w-full animate-[spin_3s_linear_infinite] rounded-full border-2 border-transparent border-t-teal-400 border-r-cyan-500" />

      {/* Middle ring */}
      <div className="absolute h-20 w-20 animate-[spin_2s_linear_infinite_reverse] rounded-full border-2 border-transparent border-l-cyan-500 border-b-teal-400 opacity-70" />

      {/* Inner core */}
      <div className="absolute h-12 w-12 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 opacity-80 blur-md" />

      {/* Center dot */}
      <div className="relative h-6 w-6 rounded-full bg-white shadow-lg shadow-teal-500/50" />

      {/* Orbiting particles */}
      {[0, 120, 240].map((rotation, i) => (
        <div
          key={i}
          className="absolute h-2 w-2 animate-[ping_2s_ease-in-out_infinite] rounded-full bg-cyan-400"
          style={{
            transform: `rotate(${rotation}deg) translateY(-48px)`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}
