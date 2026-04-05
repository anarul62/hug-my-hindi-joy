import { useState, useEffect, useRef } from "react";

const GameArea = () => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [isFlying, setIsFlying] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw dark rays
    ctx.save();
    ctx.translate(w * 0.3, h * 0.8);
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const angle = (i * Math.PI * 2) / 16;
      ctx.lineTo(Math.cos(angle) * w, Math.sin(angle) * h);
      ctx.lineTo(Math.cos(angle + 0.12) * w, Math.sin(angle + 0.12) * h);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fill();
    }
    ctx.restore();

    // Draw curve
    const progress = Math.min(1, (multiplier - 1) / 9);
    const endX = 40 + progress * (w - 80);
    const endY = h - 40 - progress * (h - 80);

    ctx.beginPath();
    ctx.moveTo(20, h - 20);
    ctx.quadraticCurveTo(endX * 0.5, h - 20, endX, endY);

    // Fill under curve
    const gradient = ctx.createLinearGradient(0, h, endX, endY);
    gradient.addColorStop(0, "rgba(180, 30, 30, 0.15)");
    gradient.addColorStop(1, "rgba(180, 30, 30, 0.4)");
    ctx.lineTo(endX, h - 20);
    ctx.lineTo(20, h - 20);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke curve
    ctx.beginPath();
    ctx.moveTo(20, h - 20);
    ctx.quadraticCurveTo(endX * 0.5, h - 20, endX, endY);
    ctx.strokeStyle = "rgb(220, 50, 50)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw plane at end
    ctx.save();
    ctx.translate(endX, endY - 10);
    ctx.rotate(-0.4);
    ctx.fillStyle = "rgb(220, 50, 50)";
    ctx.beginPath();
    ctx.moveTo(-15, 5);
    ctx.lineTo(15, -5);
    ctx.lineTo(20, -3);
    ctx.lineTo(18, 0);
    ctx.lineTo(5, 3);
    ctx.lineTo(-5, 8);
    ctx.closePath();
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(-15, 5);
    ctx.lineTo(-12, -5);
    ctx.lineTo(-8, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [multiplier, isFlying]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-[14px]"
      style={{
        background: "rgb(7, 9, 12)",
        aspectRatio: "16 / 9.5",
        border: "1.5px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        width={500}
        height={296}
      />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="text-center">
          {isFlying ? (
            <p className="text-[64px] font-black leading-none text-foreground animate-text-glow">
              {multiplier.toFixed(2)}<span className="text-[34px]">x</span>
            </p>
          ) : (
            <p className="text-[40px] font-black text-destructive">Flew away!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameArea;
