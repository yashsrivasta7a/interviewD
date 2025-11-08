import { useEffect, useRef } from 'react';

export default function GradientBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles only in bottom corners
    const particles = [];
    const particlesPerCorner = 30;

    // Bottom left corner particles
    for (let i = 0; i < particlesPerCorner; i++) {
      particles.push({
        x: Math.random() * 500,
        y: canvas.height - Math.random() * 400,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: [80, 40, 160]
      });
    }

    // Bottom right corner particles
    for (let i = 0; i < particlesPerCorner; i++) {
      particles.push({
        x: canvas.width - Math.random() * 500,
        y: canvas.height - Math.random() * 400,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: [100, 50, 180]
      });
    }
    
    // Bottom middle particles
    for (let i = 0; i < particlesPerCorner; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 400,
        y: canvas.height - Math.random() * 350,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: [110, 55, 190]
      });
    }

    let animationFrame;
    let time = 0;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Keep particles in their areas
        if (particle.color[0] === 80) { // Left corner
          if (particle.x < 0) particle.vx *= -1;
          if (particle.x > 500) particle.vx *= -1;
        } else if (particle.color[0] === 100) { // Right corner
          if (particle.x > canvas.width) particle.vx *= -1;
          if (particle.x < canvas.width - 500) particle.vx *= -1;
        } else { // Middle
          if (particle.x < canvas.width / 2 - 200) particle.vx *= -1;
          if (particle.x > canvas.width / 2 + 200) particle.vx *= -1;
        }
        
        if (particle.y < canvas.height - 400) particle.vy *= -1;
        if (particle.y > canvas.height) particle.vy *= -1;

        // Twinkle effect
        const twinkle = Math.sin(time * particle.twinkleSpeed * 100) * 0.4 + 0.6;
        const finalOpacity = particle.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 4
        );
        gradient.addColorStop(0, `rgba(${particle.color[0] + 100}, ${particle.color[1] + 100}, ${particle.color[2] + 75}, ${finalOpacity})`);
        gradient.addColorStop(0.4, `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, ${finalOpacity * 0.6})`);
        gradient.addColorStop(1, `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Main gradient background - More visible */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 80% at 100% 100%, 
              rgba(120, 60, 200, 0.5) 0%,
              rgba(100, 50, 180, 0.35) 25%,
              rgba(80, 40, 160, 0.15) 50%,
              transparent 75%),
            radial-gradient(ellipse 80% 80% at 0% 100%, 
              rgba(100, 50, 180, 0.5) 0%,
              rgba(80, 40, 160, 0.35) 25%,
              rgba(60, 30, 140, 0.15) 50%,
              transparent 75%),
            radial-gradient(ellipse 70% 60% at 50% 100%, 
              rgba(110, 55, 190, 0.4) 0%,
              rgba(90, 45, 170, 0.2) 40%,
              transparent 70%),
            #000000
          `
        }}
      />
      
      {/* Sparkle particles canvas - only in corners */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Sample content to demonstrate the gradient */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-4xl font-bold text-white">
            Hero UI Gradient Background
          </h1>
          <p className="text-gray-300 max-w-md">
            Enhanced purple glow in bottom corners with subtle sparkle effects
          </p>
          <div className="mt-8 p-6 rounded-lg border border-gray-700 bg-gray-900/30 backdrop-blur-sm">
            <p className="text-sm text-gray-400 font-mono">
              Black base with enhanced purple radial gradients ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}