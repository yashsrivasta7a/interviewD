import React, { useEffect, useRef } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { ArrowRight, Users, Brain, Trophy, Zap, Shield, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button1 from "./UI/Buttons1";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import PillNav from "./navbar";
import logo from '/test1.png';

// Small Tilt wrapper to give a glass-tilt effect on mouse move.
// It uses direct DOM transforms for smoothness and keeps a subtle scale on hover.
function Tilt({ children, className = "", max = 12, scale = 1.04 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = null;

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width) - 0.5; // -0.5 .. 0.5
      const py = (y / rect.height) - 0.5; // -0.5 .. 0.5
      const rotY = px * max; // rotateY
      const rotX = -py * max; // rotateX (invert so it feels natural)

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
      });
    }

    function onLeave() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)`;
      });
    }

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [max, scale]);

  return (
    <div
      ref={ref}
      className={"transform-gpu transition-transform duration-200 ease-out " + className}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

export default function MainPage() {
  const { user, isAuthenticated, logout, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles array (kept lightweight)
    const particles = [];
    // intentionally simple particles for subtle sparkle; you can expand if you like

    let animationFrame;
    let time = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      particles.forEach((p) => {
        // sample simple drift (no physics heavy work)
        p.x += p.vx;
        p.y += p.vy;
        // twinkle
        const tw = Math.sin(time * p.twinkleSpeed * 100) * 0.4 + 0.6;
        const finalOpacity = p.opacity * tw;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        g.addColorStop(0, `rgba(${p.color[0] + 60}, ${p.color[1] + 60}, ${p.color[2] + 60}, ${finalOpacity})`);
        g.addColorStop(0.4, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${finalOpacity * 0.6})`);
        g.addColorStop(1, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, 0)`);
        ctx.fillStyle = g;
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(draw);
    }

    draw();

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

  const handleSignOut = async () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const handleLogin = async () => {
    await loginWithRedirect();
  };

  const handleStartInterview = () => {
    if (isAuthenticated) navigate("/interview");
    else loginWithRedirect({ appState: { returnTo: "/interview" } });
  };

  const staggerContainer = { animate: { transition: { staggerChildren: 0.2 } } };

  const cardVariants = {
    initial: { opacity: 0, y: 50, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 w-full min-h-screen overflow-hidden pointer-events-none -z-10 bg-black">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 80% at 100% 100%, rgba(120,60,200,0.5) 0%, rgba(100,50,180,0.35) 25%, rgba(80,40,160,0.15) 50%, transparent 75%), radial-gradient(ellipse 80% 80% at 0% 100%, rgba(100,50,180,0.5) 0%, rgba(80,40,160,0.35) 25%, rgba(60,30,140,0.15) 50%, transparent 75%), radial-gradient(ellipse 70% 60% at 50% 100%, rgba(110,55,190,0.4) 0%, rgba(90,45,170,0.2) 40%, transparent 70%), #000000`,
          }}
        />
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: 'screen' }} />
      </div>

      <div className="min-h-screen relative pointer-events-auto">
        {/* PillNav Header - Centered */}
        <div className="flex fixed left-1/2 transform -translate-x-1/2 justify-center mb-24 z-[1000]">
          <PillNav
            logo={logo}
            logoAlt="MockMate Logo"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Features', href: '#features' },
              { label: 'How it Works', href: '#how-it-works' },
              { label: 'Reviews', href: '#testimonials' }
            ]}
            activeHref="/"
            className="custom-nav"
            ease="power2.easeOut"
            baseColor="#B19EEF "
            pillColor="#060010"
            hoveredPillTextColor="#000000"
            pillTextColor="#ffffff"
          />
        </div>
        
        {/* Login/Signup Button - Fixed Position */}
        <div className="fixed top-[1em] right-[2em] z-[1001] flex items-center gap-3">
          {!isAuthenticated ? (
            <Button onClick={handleLogin} variant="outline" className="border-gray-700 text-purple-300 hover:bg-gray-800 bg-gray-900/50 px-6 py-2 font-semibold shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-md">
              Login / Sign Up
            </Button>
          ) : (
            <Button onClick={handleSignOut} variant="outline" className="border-gray-700 text-purple-300 hover:bg-gray-800 bg-gray-900/50 px-6 py-2 font-semibold shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-md">
              Sign Out
            </Button>
          )}
        </div>

        {/* Hero */}
        <section className="py-20 px-4 relative overflow-hidden h-[100vh] flex items-center">
          <div className="  container mx-auto text-center max-w-4xl relative">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-900/40 to-teal-900/30 px-4 py-2 rounded-full text-sm font-medium text-purple-300 mb-6 border border-purple-500/20">
              <Zap className="w-4 h-4 text-purple-300" />
              <span>AI-Powered Interview Practice</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              <span className="block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Master Your Next</span>
              </span>
              <motion.span className="block text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #c084fc, #4ade80, #c084fc)", backgroundSize: "200% 100%", display: "inline-block" }} animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>Interview</motion.span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">Practice with our AI-powered interview bot. Get personalized feedback, improve your skills, and land your dream job with confidence.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/interview"><Button1 className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3">Start Free Interview</Button1></Link>
            </div>
          </div>
        </section>

        {/* Features (glass cards with tilt + purple outline on hover) */}
        <motion.section id="features" className="py-20 px-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
          <div className="container mx-auto -mt-28 ">
            <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <motion.div className="inline-flex items-center space-x-2 bg-teal-900/30 px-4 py-2 rounded-full text-sm font-medium text-teal-300 mb-4 border border-teal-500/20" whileHover={{ scale: 1.05 }}>
                <Award className="w-4 h-4 text-teal-300" />
                <span>Premium Features</span>
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-4">Why Choose MockMate?</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">Our platform combines cutting-edge AI technology with proven interview techniques</p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-8" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
              {[
                { icon: Brain, title: "AI-Powered Feedback", description: "Get instant, personalized feedback on your responses, body language, and communication skills.", gradient: "from-purple-500 to-purple-700" },
                { icon: Users, title: "Industry-Specific", description: "Practice with questions tailored to your field, from tech and finance to healthcare and education.", gradient: "from-teal-500 to-teal-600" },
                { icon: Trophy, title: "Track Progress", description: "Monitor your improvement over time with detailed analytics and performance metrics.", gradient: "from-emerald-500 to-emerald-600" },
              ].map((feature, index) => (
                <motion.div key={index} variants={cardVariants} className="">
                 <Tilt className="rounded-2xl">
  <Card className={`group relative h-full 
      bg-white/10 
      backdrop-blur-2xl 
      border border-white/20 
      shadow-[0_8px_30px_rgba(255,255,255,0.05)] 
      rounded-2xl 
      overflow-hidden 
      transition-all duration-300 
      hover:shadow-[0_8px_40px_rgba(160,90,255,0.15)] 
      hover:border-purple-400/40`}>
    
    {/* Add reflective gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-40 pointer-events-none"></div>

    <CardContent className="p-8 mt-5 text-center h-full flex flex-col relative z-10">
      <motion.div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }}>
        <feature.icon className="w-8 h-8 text-white" />
      </motion.div>
      <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
      <p className="text-gray-200 leading-relaxed flex-grow">{feature.description}</p>
    </CardContent>

    {/* purple outline on hover */}
    <div className="pointer-events-none absolute inset-0 rounded-2xl group-hover:ring-2 group-hover:ring-purple-500/40 group-hover:shadow-[0_0_30px_rgba(160,90,255,0.1)] transition-all duration-300"></div>
  </Card>
</Tilt>

                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* How it Works - step boxes with tilt + glass */}
        <motion.section id="how-it-works" className="py-20 px-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
          <div className="container mx-auto">
            <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <motion.div className="inline-flex items-center space-x-2 bg-gray-900/40 px-4 py-2 rounded-full text-sm font-medium text-gray-300 mb-4 shadow-sm border border-gray-700/50" whileHover={{ scale: 1.05 }}>
                <Shield className="w-4 h-4 text-gray-300" />
                <span>Simple Process</span>
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-xl text-gray-300">Simple steps to interview success</p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-8" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
              {[
                { number: "1", title: "Choose Your Role", description: "Select your target position and industry for personalized questions", gradient: "from-purple-600 to-purple-700" },
                { number: "2", title: "Practice Interview", description: "Engage with our AI interviewer in a realistic interview simulation", gradient: "from-teal-600 to-teal-700" },
                { number: "3", title: "Get Feedback", description: "Receive detailed analysis and tips to improve your performance", gradient: "from-emerald-600 to-emerald-700" },
              ].map((step, index) => (
                <motion.div key={index} className="text-center group relative" variants={cardVariants}>
                  <motion.div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 transform`} whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.3 }}>
                    {step.number}
                  </motion.div>

                  <Tilt className="mx-auto max-w-md rounded-2xl">
                    <div className="relative">
                      <div  className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-[0_8px_30px_rgba(255,255,255,0.05)] hover:shadow-[0_8px_40px_rgba(160,90,255,0.15)] transition-all duration-300">
                       <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-40 rounded-2xl pointer-events-none"></div>
    <h3 className="text-xl font-semibold text-white mb-3 relative z-10">{step.title}</h3>
    <p className="text-gray-200 leading-relaxed relative z-10">{step.description}</p>
  </div>
  <div className="pointer-events-none rounded-2xl absolute inset-0 group-hover:ring-2 group-hover:ring-purple-500/40 group-hover:shadow-[0_0_30px_rgba(160,90,255,0.1)] transition-all duration-300"></div>
</div>
                  </Tilt>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-purple-800/20 to-teal-900/30 rounded-xl -z-10" />
          <div className="container mx-auto text-center relative">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Ace Your Next Interview?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of successful candidates who used MockMate to land their dream jobs</p>
            <Link to="/interview">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-teal-500 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300">Start Your Free Interview Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        <footer className="bg-gray-900/80 backdrop-blur-sm text-gray-300 py-6 px-4 text-center text-sm border-t border-white/5">
          <div>© 2025 MockMate. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}

