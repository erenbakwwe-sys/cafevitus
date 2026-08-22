import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Star, Waves, Coffee, Flame } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const Hero3D: React.FC = () => {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
    }> = [];

    const colors = ['#F59E0B', '#38BDF8', '#FDE68A', '#FFFFFF'];

    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#060D1E] via-[#0A142A] to-[#040813] text-white p-5 sm:p-8 lg:p-10 shadow-2xl border border-slate-800/80">
      {/* Interactive Background Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0"
      />

      {/* Radiant Glowing Orbs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Editorial Copy */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-black text-amber-300 shadow-xs"
          >
            <Waves className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Snekkersten Havn • Danmark</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight leading-tight text-white"
          >
            Hvor havnen møder <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-sky-300 bg-clip-text text-transparent">
              exceptionel gastronomi
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm lg:text-base text-slate-300 font-medium leading-relaxed max-w-lg"
          >
            {language === 'da'
              ? 'Friskfanget fisk, smørrebrød af højeste kvalitet og økologisk specialkaffe med udsigt over Øresund.'
              : 'Freshly caught fish, premium traditional smørrebrød and organic specialty coffee with a view over Øresund.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-2 pt-1 text-[11px] sm:text-xs font-bold"
          >
            <div className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'da' ? 'Specialkaffe' : 'Specialty Coffee'}</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>4.9 / 5 TripAdvisor</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-sky-500/20 backdrop-blur-md border border-sky-500/40 text-sky-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'da' ? 'Live QR Bestilling' : 'Live QR Ordering'}</span>
            </div>
          </motion.div>
        </div>

        {/* Right 3D Visual - shown on desktop, simplified on mobile */}
        <div className="hidden lg:flex lg:col-span-4 relative items-center justify-center min-h-[180px]">
          <motion.div
            animate={{
              rotateZ: [0, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="relative w-40 h-40 rounded-full bg-gradient-to-tr from-sky-600/30 via-amber-500/20 to-sky-400/30 border border-white/20 backdrop-blur-xl flex items-center justify-center p-4 shadow-2xl shadow-sky-500/20"
          >
            <motion.div
              animate={{ rotateZ: [0, -360] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full rounded-full border border-dashed border-amber-400/40 flex items-center justify-center"
            >
              <Compass className="w-16 h-16 text-amber-400/80" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
