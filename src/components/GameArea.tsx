import { useEffect, useRef, useMemo } from "react";
import { useGame } from "@/contexts/GameContext";

const GameArea = () => {
  const { phase, multiplier, waitingCountdown } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeImg = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/plane.svg";
    img.onload = () => { planeImg.current = img; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark rays
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

    if (phase === "waiting") {
      // Show "Waiting..." text only
      return;
    }

    // Draw curve
    const maxMult = 15;
    const progress = Math.min(1, (multiplier - 1) / (maxMult - 1));
    const endX = 40 + progress * (w - 80);
    const endY = h - 40 - progress * (h - 80);

    // Fill under curve
    ctx.beginPath();
    ctx.moveTo(20, h - 20);
    ctx.quadraticCurveTo(endX * 0.5, h - 20, endX, endY);
    ctx.lineTo(endX, h - 20);
    ctx.lineTo(20, h - 20);
    const gradient = ctx.createLinearGradient(0, h, endX, endY);
    gradient.addColorStop(0, "rgba(180, 30, 30, 0.15)");
    gradient.addColorStop(1, "rgba(180, 30, 30, 0.4)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke curve
    ctx.beginPath();
    ctx.moveTo(20, h - 20);
    ctx.quadraticCurveTo(endX * 0.5, h - 20, endX, endY);
    ctx.strokeStyle = phase === "crashed" ? "rgb(150, 40, 40)" : "rgb(220, 50, 50)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw plane SVG image
    if (planeImg.current && phase === "flying") {
      ctx.save();
      ctx.translate(endX, endY - 5);
      const angle = Math.atan2(-(endY - (h - 20)), endX - 20) * 0.5;
      ctx.rotate(-angle * 0.6);
      ctx.drawImage(planeImg.current, -40, -25, 60, 30);
      ctx.restore();
    }
  }, [multiplier, phase]);

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
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
        {phase === "waiting" && (
          <div className="flex flex-col items-center justify-center w-full h-full gap-3 px-6">
            {/* UFC | Aviator */}
            <div className="flex items-center gap-3">
              <span className="text-[28px] font-black italic" style={{ color: "rgb(220, 40, 40)" }}>UFC</span>
              <span className="text-[20px] font-light" style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
              <div className="flex items-center gap-1">
                <img src="/plane.svg" alt="plane" className="w-[28px] h-[20px]" style={{ filter: "brightness(0.8) sepia(1) hue-rotate(-30deg) saturate(5)" }} />
                <span className="text-[18px] font-bold italic" style={{ color: "rgb(220, 50, 50)" }}>Aviator</span>
              </div>
            </div>
            <p className="text-[14px] font-extrabold tracking-wider text-white">OFFICIAL PARTNERS</p>

            {/* Loading bar */}
            <div className="w-full max-w-[300px] h-[5px] rounded-full overflow-hidden mt-1" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-100 ease-linear"
                style={{
                  width: `${((5 - waitingCountdown) / 5) * 100}%`,
                  background: "linear-gradient(90deg, rgb(220, 40, 40), rgb(180, 30, 60))",
                }}
              />
            </div>

            {/* SPRIBE badge */}
            <div
              className="flex flex-col items-center gap-1 px-5 py-2.5 rounded-lg mt-2"
              style={{
                background: "rgba(40, 60, 30, 0.7)",
                border: "1.5px solid rgba(80, 120, 50, 0.6)",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-[20px] h-[20px] rounded-full" style={{ background: "radial-gradient(circle, rgba(200,200,200,0.9), rgba(100,100,100,0.5))" }} />
                <span className="text-[16px] font-bold text-white">SPRIBE</span>
              </div>
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded"
                style={{ border: "1px solid rgba(80, 160, 50, 0.5)" }}
              >
                <span className="text-[11px] font-semibold" style={{ color: "rgb(140, 200, 100)" }}>Official Game</span>
                <span className="text-[12px]">✅</span>
              </div>
              <span className="text-[10px]" style={{ color: "rgba(200, 200, 180, 0.7)" }}>Since 2019</span>
            </div>
          </div>
        )}
        {phase === "flying" && (
          <p className="text-[64px] font-black leading-none text-foreground animate-text-glow">
            {multiplier.toFixed(2)}<span className="text-[34px]">x</span>
          </p>
        )}
        {phase === "crashed" && (
          <div className="text-center">
            <p className="text-[40px] font-black text-destructive">Flew away!</p>
            <p className="text-[24px] font-bold text-destructive/70">{multiplier.toFixed(2)}x</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameArea;
