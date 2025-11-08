import React, { useEffect, useState, useRef } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { ArrowRight, Users, Brain, Trophy, Star, Zap, Shield, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button1 from "./UI/Buttons1";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";

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

    // Create particles only in bottom corners
    const particles = [];
    const particlesPerCorner = 30;

    // Bottom left corner particles
  

    
    // Bottom middle particles


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

  const handleSignOut = async () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const handleLogin = async () => {
    await loginWithRedirect();
  };

  const handleStartInterview = () => {
    if (isAuthenticated) {
      navigate("/interview");
    } else {
      loginWithRedirect({
        appState: { returnTo: "/interview" },
      });
    }
  };

  const staggerContainer = { animate: { transition: { staggerChildren: 0.2 } } };

  const cardVariants = {
    initial: { opacity: 0, y: 50, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    hover: { y: -8, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <>
      {/* ===== Enhanced Gradient Background (fixed, non-interactive) ===== */}
      <div className="fixed inset-0 w-full min-h-screen overflow-hidden pointer-events-none -z-10 bg-black">
        {/* Main gradient background */}
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
        
        {/* Sparkle particles canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* ===== Foreground Content (interactive) ===== */}
      <div className="min-h-screen relative pointer-events-auto">
        <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white/90 to-purple-300 bg-clip-text text-transparent">
                MockMate
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors font-medium">
                How it Works
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors font-medium">
                Reviews
              </a>
            </nav>

            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="border-gray-700 text-purple-300 hover:bg-gray-800 bg-gray-900/50 px-6 py-2 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                >
                  Login / Sign In
                </Button>
              ) : (
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-gray-700 text-purple-300 hover:bg-gray-800 bg-gray-900/50 px-6 py-2 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                >
                  Sign Out
                </Button>
              )}
              <Button
                onClick={handleStartInterview}
                className="bg-gradient-to-r from-purple-600 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Interview
              </Button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="container mx-auto text-center max-w-4xl relative">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-900/40 to-teal-900/30 px-4 py-2 rounded-full text-sm font-medium text-purple-300 mb-6 border border-purple-500/20">
              <Zap className="w-4 h-4 text-purple-300" />
              <span>AI-Powered Interview Practice</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              <span className="block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Master Your Next</span>
              </span>
              <motion.span
                className="block text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(90deg, #c084fc, #4ade80, #c084fc)",
                  backgroundSize: "200% 100%",
                  display: "inline-block",
                }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Interview
              </motion.span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Practice with our AI-powered interview bot. Get personalized feedback, improve your skills, and land your
              dream job with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/interview">
                <Button1 className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3">Start Free Interview</Button1>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <motion.section
          id="features"
          className="py-20 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto">
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
                { icon: Brain, title: "AI-Powered Feedback", description: "Get instant, personalized feedback on your responses, body language, and communication skills.", gradient: "from-purple-500 to-purple-700", hoverColor: "hover:border-purple-400" },
                { icon: Users, title: "Industry-Specific", description: "Practice with questions tailored to your field, from tech and finance to healthcare and education.", gradient: "from-teal-500 to-teal-600", hoverColor: "hover:border-teal-400" },
                { icon: Trophy, title: "Track Progress", description: "Monitor your improvement over time with detailed analytics and performance metrics.", gradient: "from-emerald-500 to-emerald-600", hoverColor: "hover:border-emerald-400" },
              ].map((feature, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className={`border-white/10 hover:shadow-xl transition-all duration-300 group ${feature.hoverColor} h-full bg-gray-900/40 backdrop-blur-sm`}>
                    <CardContent className="p-8 mt-5 text-center h-full flex flex-col">
                      <motion.div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.1 }} transition={{ duration: 0.5 }}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                      <p className="text-gray-300 leading-relaxed flex-grow">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* How it Works */}
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
                <motion.div key={index} className="text-center group" variants={cardVariants} whileHover={{ y: -5 }}>
                  <motion.div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg group-hover:shadow-xl transition-all duration-300`} whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.3 }}>
                    {step.number}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{step.description}</p>
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
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-teal-500 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                Start Your Free Interview Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900/80 backdrop-blur-sm text-gray-300 py-6 px-4 text-center text-sm border-t border-white/5">
          <div>© 2025 MockMate. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}