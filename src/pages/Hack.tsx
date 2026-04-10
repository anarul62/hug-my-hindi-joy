import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { useGame } from "@/contexts/GameContext";

const API_KEY = "AVIATOR-ADMIN-2024";

const Hack = () => {
  const [apiKey, setApiKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const { phase, multiplier, nextCrashPoint, crashHistory, waitingCountdown } = useGame();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date().toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleUnlock = () => {
    if (apiKey === API_KEY) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (unlocked) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #1a0e00 0%, #0a0a0a 40%)" }}>
        {/* Header */}
        <div className="text-center pt-6 pb-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[14px]">▶</span>
            <h1 className="text-[28px] font-black" style={{ color: "rgb(255, 140, 0)" }}>AviatorHack</h1>
          </div>
          <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Session: 115m remaining</p>
        </div>

        <div className="flex-1 px-4 pb-4 space-y-3">
          {/* History */}
          <div className="rounded-lg p-3" style={{ border: "1px solid rgba(255,140,0,0.4)", background: "rgba(255,140,0,0.05)" }}>
            <p className="text-[11px] font-bold mb-2" style={{ color: "rgb(255, 100, 50)" }}>HISTORY</p>
            <div className="flex flex-wrap gap-1">
              {crashHistory.slice(0, 20).map((v, i) => (
                <span key={i} className="shrink-0 rounded-full px-2.5 py-[3px] text-[11px] font-bold text-white"
                  style={{ background: v >= 2 ? "rgb(147, 51, 234)" : "rgb(20, 184, 166)" }}>
                  {v.toFixed(2)}x
                </span>
              ))}
            </div>
          </div>

          {/* Next Crash Prediction */}
          <div className="rounded-lg p-5 text-center" style={{ border: "1.5px solid rgba(255,140,0,0.5)", background: "linear-gradient(180deg, rgba(80,20,0,0.4), rgba(40,10,0,0.6))" }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[14px]">🎯</span>
              <p className="text-[14px] font-bold tracking-wider" style={{ color: "rgb(255, 140, 0)" }}>NEXT CRASH PREDICTION</p>
            </div>
            {(phase === "waiting" || phase === "flying") && nextCrashPoint > 0 ? (
              <>
                <p className="text-[72px] font-black leading-none my-2" style={{ color: "rgb(180, 100, 255)" }}>
                  {nextCrashPoint.toFixed(2)}x
                </p>
                {phase === "flying" && (
                  <p className="text-[36px] font-bold mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {multiplier.toFixed(2)}x
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-[20px] font-bold mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>Generating...</p>
              </>
            )}
          </div>

          {/* Plane */}
          <div className="rounded-lg p-4 flex items-center justify-center" style={{ border: "1px solid rgba(0,180,80,0.3)", background: "rgba(0,60,30,0.3)" }}>
            <img src="/plane.svg" alt="plane" className="w-[80px] h-[55px]" style={{ filter: "brightness(1.2) saturate(1.5)" }} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg p-3 text-center" style={{ border: "1px solid rgba(255,140,0,0.3)", background: "rgba(255,140,0,0.05)" }}>
              <p className="text-[10px] font-bold tracking-wider" style={{ color: "rgb(255, 140, 0)" }}>ACCURACY</p>
              <p className="text-[18px] font-black text-white">99%</p>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ border: "1px solid rgba(255,140,0,0.3)", background: "rgba(255,140,0,0.05)" }}>
              <p className="text-[10px] font-bold tracking-wider" style={{ color: "rgb(255, 140, 0)" }}>MODE</p>
              <p className="text-[18px] font-black text-white">AUTO</p>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ border: "1px solid rgba(255,140,0,0.3)", background: "rgba(255,140,0,0.05)" }}>
              <p className="text-[10px] font-bold tracking-wider" style={{ color: "rgb(255, 140, 0)" }}>SYNC</p>
              <p className="text-[18px] font-black" style={{ color: "rgb(0, 200, 100)" }}>LIVE</p>
            </div>
          </div>

          {/* Live status bar */}
          <div className="rounded-lg p-3 flex items-center justify-center gap-2" style={{ border: "1px solid rgba(0,180,80,0.4)", background: "rgba(0,60,30,0.2)" }}>
            <div className="w-[10px] h-[10px] rounded-full animate-pulse" style={{ background: "rgb(100, 220, 100)" }} />
            <span className="text-[15px] font-bold" style={{ color: "rgb(100, 220, 100)" }}>
              LIVE — {phase === "flying" ? `${multiplier.toFixed(2)}x` : phase === "waiting" ? `Waiting ${waitingCountdown.toFixed(0)}s` : "Crashed"}
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link to="/" className="w-[44px] h-[44px] rounded-lg flex items-center justify-center" style={{ border: "1.5px solid rgba(255,140,0,0.5)", background: "rgba(255,140,0,0.1)" }}>
            <span className="text-[20px]">🏠</span>
          </Link>
          <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.4)" }}>{clock}</span>
          <div className="w-[44px] h-[44px] rounded-lg flex items-center justify-center" style={{ border: "1.5px solid rgba(255,140,0,0.5)", background: "rgba(255,140,0,0.1)" }}>
            <span className="text-[20px]">📤</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card rounded-xl p-8 w-full max-w-md shadow-2xl border border-border">
        <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <Lock className="w-5 h-5" />
          🔐 Hack Access
        </h1>

        <label className="block text-sm text-muted-foreground mb-2">API Key</label>
        <input
          type="text"
          placeholder="Enter API key"
          value={apiKey}
          onChange={(e) => { setApiKey(e.target.value); setError(false); }}
          className={`w-full bg-muted border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring mb-1 ${error ? "border-destructive" : "border-border"}`}
        />
        {error && <p className="text-destructive text-xs mb-3">Invalid API key</p>}

        <button
          onClick={handleUnlock}
          className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 rounded-lg transition-opacity mt-3"
        >
          Unlock Hack
        </button>

        <Link to="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground mt-4 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Game
        </Link>
      </div>
    </div>
  );
};

export default Hack;
