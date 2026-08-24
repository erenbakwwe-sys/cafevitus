import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Compass, Sparkles, Star, Waves, Coffee, Flame, Anchor, Wind, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const Hero3D: React.FC = () => {
  const { language, t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Parallax Tilt State
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 180, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 25 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-5deg', '5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 800);
    let height = (canvas.height = canvas.offsetHeight || 300);

    // Pause rendering when Hero is scrolled out of view to eliminate lag
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      targetAlpha: number;
      color: string;
    }> = [];

    const colors = ['#F59E0B', '#38BDF8', '#FBBF24', '#E0F2FE', '#FFFFFF', '#67E8F9'];
    const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 28;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.0 + 0.8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        alpha: Math.random() * 0.5 + 0.2,
        targetAlpha: Math.random() * 0.7 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      if (isVisibleRef.current) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          p.alpha += (p.targetAlpha - p.alpha) * 0.02;
          if (Math.abs(p.targetAlpha - p.alpha) < 0.05) {
            p.targetAlpha = Math.random() * 0.7 + 0.2;
          }

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#060D1E] via-[#0A1633] to-[#040814] text-white p-6 sm:p-9 lg:p-12 shadow-2xl border border-slate-800/90 will-change-transform"
    >
      {/* Interactive Background Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-75 z-0"
      />

      {/* Radiant Glowing Atmosphere Orbs */}
      <div className="absolute top-0 right-0 -mr-28 -mt-28 w-96 h-96 rounded-full bg-sky-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-28 -mb-28 w-96 h-96 rounded-full bg-amber-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

      {/* Decorative Subtle Harbor Waves SVG Line */}
      <div className="absolute -bottom-6 left-0 right-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 60C240 100 480 20 720 60C960 100 1200 20 1440 60V120H0V60Z" fill="url(#waveGrad)" />
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center" style={{ transform: 'translateZ(20px)' }}>
        {/* Editorial Copy */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-5">
          {/* Top Harbor Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs font-black text-amber-300 shadow-md shadow-amber-500/10"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
            <Waves className="w-4 h-4 text-sky-400" />
            <span className="tracking-wide">{t.hero.harborBadge}</span>
            <span className="opacity-40">|</span>
            <span className="text-[11px] text-sky-200 font-semibold flex items-center gap-1">
              <Wind className="w-3 h-3 text-sky-300" /> {t.hero.breezeBadge}
            </span>
          </motion.div>

          {/* Main Serif Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-white font-serif-luxury"
          >
            {t.hero.headlinePart1} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-amber-100 to-sky-300 bg-clip-text text-transparent drop-shadow-sm">
              {t.hero.headlinePart2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm lg:text-base text-slate-300 font-medium leading-relaxed max-w-xl"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-2.5 pt-1.5 text-xs font-bold"
          >
            <div className="px-3.5 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2 hover:bg-white/15 transition-colors shadow-sm">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>{t.hero.badgeCoffee}</span>
            </div>
            
            <div className="px-3.5 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2 hover:bg-white/15 transition-colors shadow-sm">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{t.hero.badgeRating}</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-2xl bg-sky-500/20 backdrop-blur-md border border-sky-400/40 text-sky-200 flex items-center gap-2 shadow-sm">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{t.hero.badgeQr}</span>
            </div>
          </motion.div>
        </div>

        {/* Right 3D Visual - Dynamic Rotating Compass & Nautical Ring */}
        <div className="hidden lg:flex lg:col-span-4 relative items-center justify-center min-h-[220px]">
          {/* Ambient Glow Disk */}
          <div className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-sky-500/20 to-amber-500/20 blur-2xl animate-pulse" />

          <motion.div
            animate={{
              rotateZ: [0, 360],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="relative w-48 h-48 rounded-full bg-gradient-to-tr from-sky-600/30 via-slate-900/60 to-amber-500/30 border border-white/25 backdrop-blur-2xl flex items-center justify-center p-5 shadow-2xl shadow-sky-500/20"
          >
            {/* Inner Counter-Rotating Ring */}
            <motion.div
              animate={{ rotateZ: [0, -360] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full rounded-full border-2 border-dashed border-amber-400/50 flex items-center justify-center relative"
            >
              <Compass className="w-20 h-20 text-amber-400/90 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
              
              {/* Compass Cardinal Dots */}
              <div className="absolute top-1 w-2 h-2 rounded-full bg-sky-400 shadow-md" />
              <div className="absolute bottom-1 w-2 h-2 rounded-full bg-amber-400 shadow-md" />
              <div className="absolute left-1 w-2 h-2 rounded-full bg-white/70 shadow-md" />
              <div className="absolute right-1 w-2 h-2 rounded-full bg-white/70 shadow-md" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};


