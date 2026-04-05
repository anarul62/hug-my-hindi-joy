import { useState, useEffect } from "react";

const GameArea = () => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [isFlying, setIsFlying] = useState(true);

  useEffect(() => {
    if (!isFlying) return;
    const interval = setInterval(() => {
      setMultiplier((prev) => {
        const next = prev + Math.random() * 0.03 + 0.01;
        if (next > 8) {
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
    <div className="relative bg-game-bg rounded-lg mx-2 h-[220px] flex items-center justify-center overflow-hidden">
      {/* Background curve */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
        <defs>
          <linearGradient id="curveGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(0,0%,15%)" />
            <stop offset="100%" stopColor="hsl(330,80%,30%)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d={`M 0 220 Q ${100 + multiplier * 20} ${220 - multiplier * 20} ${Math.min(500, multiplier * 60)} ${Math.max(20, 220 - multiplier * 25)}`}
          fill="url(#curveGrad)"
          stroke="hsl(330,80%,55%)"
          strokeWidth="2"
        />
      </svg>

      {/* Plane */}
      <div
        className="absolute transition-all duration-100"
        style={{
          left: `${Math.min(85, 10 + multiplier * 10)}%`,
          bottom: `${Math.min(80, 10 + multiplier * 8)}%`,
        }}
      >
        <span className="text-3xl" style={{ filter: "hue-rotate(-30deg)" }}>🛩️</span>
      </div>

      {/* Multiplier display */}
      <div className="relative z-10 text-center">
        <span className="text-6xl font-black tracking-tight" style={{ animation: isFlying ? "pulse-multiplier 1s ease-in-out infinite" : "none" }}>
          {isFlying ? (
            <span className="text-foreground">{multiplier.toFixed(2)}<span className="text-4xl">x</span></span>
          ) : (
            <span className="text-destructive">Flew away!</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default GameArea;
