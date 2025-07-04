import React, { useState } from 'react';
import {
  AnimatedLegoIcon,
  AnimatedVaseIcon,
  AnimatedShelvesIcon,
  AnimatedPencilCupIcon,
} from './icons/AnimatedIcons';

const categories = [
  { name: 'Toys & Games', floatClass: 'animate-float-toys', Icon: AnimatedLegoIcon },
  { name: 'Decor', floatClass: 'animate-float-decor', Icon: AnimatedVaseIcon },
  { name: 'Household', floatClass: 'animate-float-household', Icon: AnimatedShelvesIcon },
  { name: 'Pet Care', floatClass: 'animate-float-petcare', Icon: AnimatedPencilCupIcon },
];

const PARTICLE_COUNT = 12;

export default function CategoryBubbles() {
  // Track which bubbles have burst
  const [burst, setBurst] = useState([false, false, false, false]);
  // Track which bubbles are animating burst
  const [bursting, setBursting] = useState([false, false, false, false]);
  // Track particles for each bubble
  const [particles, setParticles] = useState([[], [], [], []] as number[][]);

  const handleBurst = (idx: number) => {
    if (burst[idx] || bursting[idx]) return;
    // Start burst animation
    setBursting(b => b.map((v, i) => (i === idx ? true : v)));
    // Create particles
    setParticles(ps =>
      ps.map((arr, i) =>
        i === idx ? Array.from({ length: PARTICLE_COUNT }, (_, j) => j) : arr
      )
    );
    // After animation, mark as disappeared
    setTimeout(() => {
      setBursting(b => b.map((v, i) => (i === idx ? false : v)));
      setBurst(b => b.map((v, i) => (i === idx ? true : v)));
      setParticles(ps => ps.map((arr, i) => (i === idx ? [] : arr)));
    }, 600);
  };

  return (
    <div className="w-full py-10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow">Shop by Category</h2>
        <p className="text-lg text-white/80">Discover amazing products across categories</p>
      </div>
      <div className="relative h-[220px] overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full flex items-center justify-center gap-12 md:gap-20" style={{ height: 140 }}>
          {categories.map((cat, i) => (
            <Bubble
              key={cat.name}
              label={cat.name}
              floatClass={cat.floatClass}
              onBurst={() => handleBurst(i)}
              bursting={bursting[i]}
              burst={burst[i]}
              particles={particles[i]}
              Icon={cat.Icon}
            />
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes gentleFloatToys {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes gentleFloatDecor {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes gentleFloatHousehold {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes gentleFloatPetCare {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-toys { animation: gentleFloatToys 3s ease-in-out infinite; animation-delay: 0s; }
        .animate-float-decor { animation: gentleFloatDecor 3.5s ease-in-out infinite; animation-delay: -0.5s; }
        .animate-float-household { animation: gentleFloatHousehold 4s ease-in-out infinite; animation-delay: -1s; }
        .animate-float-petcare { animation: gentleFloatPetCare 3.2s ease-in-out infinite; animation-delay: -1.5s; }
        @keyframes burstEffect {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(2); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
        .bubble-burst::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(116,185,255,0.8) 0%, rgba(116,185,255,0.4) 30%, transparent 60%);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
          pointer-events: none;
        }
        .burst-animation::after {
          animation: burstEffect 0.6s ease-out forwards;
        }
        @keyframes bubbleDisappear {
          0% { transform: scale(1); opacity: 1; }
          30% { transform: scale(1.3); opacity: 0.7; }
          100% { transform: scale(0); opacity: 0; visibility: hidden; }
        }
        .bursting { animation: bubbleDisappear 0.6s ease-out forwards !important; }
        .category-bubble.bursting { pointer-events: none; }
        .category-bubble.disappeared { opacity: 0 !important; transform: scale(0) !important; visibility: hidden !important; pointer-events: none !important; }
        @keyframes particleExplosion {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { opacity: 0; transform: scale(0); }
        }
        .particle { position: absolute; width: 6px; height: 6px; background: #74b9ff; border-radius: 50%; pointer-events: none; }
        @media (max-width: 768px) {
          .category-bubble { width: 100px !important; height: 100px !important; font-size: 0.85rem !important; }
        }
      `}</style>
    </div>
  );
}

function Bubble({ label, floatClass, onBurst, bursting, burst, particles, Icon }: {
  label: string;
  floatClass: string;
  onBurst: () => void;
  bursting: boolean;
  burst: boolean;
  particles: number[];
  Icon: React.ComponentType<{ className?: string }>;
}) {
  // Particle explosion directions
  const getParticleStyle = (i: number) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const distance = 40 + Math.random() * 50;
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance;
    return {
      left: '50%',
      top: '50%',
      transform: `translate(-50%, -50%) translate(${endX}px, ${endY}px)`,
      animation: `particleExplosion 0.6s ease-out forwards`,
      animationDelay: `${Math.random() * 0.1}s`,
    } as React.CSSProperties;
  };
  return (
    <div
      className={`category-bubble relative flex flex-col items-center justify-center w-[140px] h-[140px] md:w-[140px] md:h-[140px] rounded-full bg-gradient-to-br from-blue-300 via-blue-500 to-blue-400 text-white font-bold text-sm md:text-base text-center cursor-pointer border-2 border-white/20 select-none transition-transform duration-300 ${floatClass} ${bursting ? 'bursting bubble-burst burst-animation' : ''} ${burst ? 'disappeared' : ''}`}
      onClick={onBurst}
      style={{ position: 'relative' }}
    >
      <span className="z-10 pointer-events-none flex flex-col items-center justify-center">
        <Icon className="w-12 h-12 md:w-16 md:h-16 mb-2" />
        {label.split(' ').map((word, i) => (
          <span key={i} className="block">{word}</span>
        ))}
      </span>
      {/* Bubble highlight */}
      <span className="absolute top-[13%] left-[18%] w-[28%] h-[28%] rounded-full" style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, transparent 70%)' }} />
      {/* Particle explosion */}
      {particles.map(i => (
        <span key={i} className="particle" style={getParticleStyle(i)} />
      ))}
    </div>
  );
} 