import { useState, useEffect } from "react";

const GameArea = () => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [isFlying, setIsFlying] = useState(true);

  useEffect(() => {
    if (!isFlying) return;
    const interval = setInterval(() => {
      setMultiplier((prev) => {
        const next = prev + Math.random() * 0.03 + 0.01;
        if (next > 10) {
          setIsFlying(false);
          setTimeout(() => {
            setMultiplier(1.0);
            setIsFlying(true);
          }, 2000);
          return prev;
        }
        return parseFloat(next.toFixed(2));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isFlying]);

  return (
    <div className="relative bg-game-bg rounded-xl mx-3 h-[240px] flex items-center justify-center overflow-hidden border border-border">
      {/* Dark radial rays background */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 origin-bottom-left"
            style={{
              width: "200%",
              height: "2px",
              background: "linear-gradient(90deg, transparent, hsl(0 0% 25%), transparent)",
              transform: `rotate(${i * 30}deg)`,
            }}
          />
        ))}
      </div>

      {/* Red curve fill */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 240" preserveAspectRatio="none">
        <defs>
          <linearGradient id="curveGrad" x1="0" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor="hsl(350,70%,25%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(350,70%,40%)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d={`M 0 240 L 0 ${240 - multiplier * 15} Q ${100 + multiplier * 15} ${240 - multiplier * 18} ${Math.min(480, 50 + multiplier * 40)} ${Math.max(30, 240 - multiplier * 22)} L ${Math.min(480, 50 + multiplier * 40)} 240 Z`}
          fill="url(#curveGrad)"
        />
        <path
          d={`M 0 ${240 - multiplier * 15} Q ${100 + multiplier * 15} ${240 - multiplier * 18} ${Math.min(480, 50 + multiplier * 40)} ${Math.max(30, 240 - multiplier * 22)}`}
          fill="none"
          stroke="hsl(350,80%,50%)"
          strokeWidth="3"
        />
      </svg>

      {/* Plane */}
      <div
        className="absolute transition-all duration-100 text-destructive"
        style={{
          left: `${Math.min(82, 8 + multiplier * 8)}%`,
          bottom: `${Math.min(78, 8 + multiplier * 7)}%`,
          transform: "rotate(-20deg)",
        }}
      >
        <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
          <path d="M4 20 L20 14 L36 8 L44 6 L40 10 L28 14 L20 18 L12 22 Z" fill="hsl(350,80%,50%)" />
          <path d="M20 14 L24 4 L28 14" fill="hsl(350,80%,50%)" />
          <path d="M12 22 L14 28 L20 18" fill="hsl(350,80%,50%)" />
        </svg>
      </div>

      {/* Dots at bottom */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent/40" />
        ))}
      </div>

      {/* Multiplier display */}
      <div className="relative z-10 text-center">
        {isFlying ? (
          <span
            className="text-7xl font-black tracking-tight text-foreground"
            style={{ animation: "pulse-multiplier 1s ease-in-out infinite" }}
          >
            {multiplier.toFixed(2)}<span className="text-5xl">x</span>
          </span>
        ) : (
          <span className="text-4xl font-black text-destructive">Flew away!</span>
        )}
      </div>
    </div>
  );
};

export default GameArea;
