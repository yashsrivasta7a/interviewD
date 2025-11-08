import React from "react";

export default function GradientBackground() {
  return (
    <div className="fixed inset-0 w-full min-h-screen overflow-hidden pointer-events-none">
      {/* Base layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/90 via-white to-teal-50/90" />

      {/* Moving gradient circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-teal-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[500px] h-[500px] bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-purple-300/20 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-3000" />
      </div>

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-teal-100/20" />

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          filter: "contrast(150%) brightness(1000%)"
        }}
      />

      {/* Bottom-left sparkles */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "500px",
          height: "400px",
          background: `
            radial-gradient(circle at 15% 85%, rgba(180, 140, 235, 0.6) 0%, transparent 2%),
            radial-gradient(circle at 25% 75%, rgba(180, 140, 235, 0.5) 0%, transparent 1.5%),
            radial-gradient(circle at 8% 92%, rgba(180, 140, 235, 0.7) 0%, transparent 2.5%),
            radial-gradient(circle at 35% 88%, rgba(180, 140, 235, 0.4) 0%, transparent 1.8%),
            radial-gradient(circle at 18% 78%, rgba(180, 140, 235, 0.55) 0%, transparent 2.2%)
          `,
          animation: "twinkle 3s ease-in-out infinite",
          zIndex: 2,
          pointerEvents: "none"
        }}
      />

      {/* Bottom-right sparkles */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "500px",
          height: "400px",
          background: `
            radial-gradient(circle at 85% 85%, rgba(200, 150, 255, 0.6) 0%, transparent 2%),
            radial-gradient(circle at 75% 75%, rgba(200, 150, 255, 0.5) 0%, transparent 1.5%),
            radial-gradient(circle at 92% 92%, rgba(200, 150, 255, 0.7) 0%, transparent 2.5%),
            radial-gradient(circle at 65% 88%, rgba(200, 150, 255, 0.4) 0%, transparent 1.8%),
            radial-gradient(circle at 82% 78%, rgba(200, 150, 255, 0.55) 0%, transparent 2.2%)
          `,
          animation: "twinkle 3.5s ease-in-out infinite 0.5s",
          zIndex: 2,
          pointerEvents: "none"
        }}
      />

      {/* Bottom-middle sparkles */}
      <div
        style={{
          position: "absolute",
          bottom: "50px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "400px",
          height: "350px",
          background: `
            radial-gradient(circle at 50% 80%, rgba(210, 165, 255, 0.5) 0%, transparent 2%),
            radial-gradient(circle at 45% 90%, rgba(210, 165, 255, 0.4) 0%, transparent 1.5%),
            radial-gradient(circle at 55% 85%, rgba(210, 165, 255, 0.6) 0%, transparent 2.2%),
            radial-gradient(circle at 48% 75%, rgba(210, 165, 255, 0.45) 0%, transparent 1.7%)
          `,
          animation: "twinkle 4s ease-in-out infinite 1s",
          zIndex: 2,
          pointerEvents: "none"
        }}
      />

      {/* Content layer (pointer-events-auto so children can be interactive if placed) */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          padding: "4rem 2rem",
          textAlign: "center",
          color: "white",
          pointerEvents: "auto"
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #ffffff 0%, #d4a5ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Hero UI Gradient Background
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "rgba(255, 255, 255, 0.8)",
            marginBottom: "0.5rem"
          }}
        >
          Enhanced purple glow in bottom corners with subtle sparkle effects
        </p>
        <p
          style={{
            fontSize: "1.25rem",
            color: "rgba(255, 255, 255, 0.8)"
          }}
        >
          Black base with enhanced purple radial gradients ✨
        </p>
      </div>

      {/* CSS Animations & helper classes */}
      <style>{`
        /* twinkle for sparkle opacity */
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* blob morphing animation */
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(20px, -10px) scale(1.05);
          }
          66% {
            transform: translate(-15px, 10px) scale(0.95);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        /* utility animation classes (small helpers to match your tailwind-like names) */
        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-4000 { animation-delay: 4s; }

        /* ensure the grain overlay doesn't steal pointer events */
        .pointer-events-none { pointer-events: none; }
      `}</style>
    </div>
  );
}
