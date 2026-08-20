import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Star, Waves, Coffee, Flame, Heart } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const Hero3D: React.FC = () => {
  const { t } = useLanguage();
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

    for (let i = 0; i < 35; i++) {
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
        ctx.shadowBlur = 10;
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#060D1E] via-[#0A142A] to-[#040813] text-white p-6 sm:p-10 shadow-2xl border border-slate-800/80">
      {/* Interactive Background Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0"
      />

      {/* Radiant Glowing Orbs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Editorial Copy */}
        <div className="lg:col-span-7 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-extrabold text-amber-300 shadow-sm"
          >
            <Waves className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Snekkersten Havn • Est. 2024</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white"
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
            className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-lg"
          >
            Oplev kystens charme i Snekkersten. Friskfanget fisk, smørrebrød af højeste kvalitet og økologisk specialkaffe med udsigt over Øresund.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-2.5 pt-2 text-xs font-bold"
          >
            <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Økologisk Kaffe</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>4.9 / 5 Stjerner</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 backdrop-blur-md border border-sky-500/40 text-sky-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Live Bordbestilling</span>
            </div>
          </motion.div>
        </div>

        {/* Right 3D Visual Floating Scene */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[220px]">
          {/* Central 3D Glowing Compass Sphere */}
          <motion.div
            animate={{
              rotateZ: [0, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-sky-600/30 via-amber-500/20 to-sky-400/30 border border-white/20 backdrop-blur-xl flex items-center justify-center p-4 shadow-2xl shadow-sky-500/20"
          >
            <motion.div
              animate={{ rotateZ: [0, -360] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full rounded-full border border-dashed border-amber-400/40 flex items-center justify-center"
            >
              <Compass className="w-20 h-20 text-amber-400/80" />
            </motion.div>
          </motion.div>

          {/* Floating 3D Badge 1: Top Right */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-2 right-2 sm:right-6 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-xl backdrop-blur-xl border border-white/40 flex items-center gap-2.5 text-xs font-black z-20"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Star className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Michelin Standard</div>
              <div className="text-xs font-black">Havne Smørrebrød</div>
            </div>
          </motion.div>

          {/* Floating 3D Badge 2: Bottom Left */}
          <motion.div
            animate={{
              y: [0, 10, 0],
              rotate: [0, -2, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="absolute -bottom-2 left-2 sm:left-6 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-xl backdrop-blur-xl border border-white/40 flex items-center gap-2.5 text-xs font-black z-20"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Friskfanget</div>
              <div className="text-xs font-black">Grønlandske Rejer</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
