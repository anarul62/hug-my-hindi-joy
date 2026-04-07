import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle, Zap, AlertTriangle } from "lucide-react";
import { useGame } from "@/contexts/GameContext";

const API_KEY = "AVIATOR-ADMIN-2024";

const Hack = () => {
  const [apiKey, setApiKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const { phase, multiplier, nextCrashPoint } = useGame();

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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-xl p-8 w-full max-w-md shadow-2xl border border-border text-center">
          <CheckCircle className="w-12 h-12 text-accent mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2">Hack Unlocked! ✅</h1>
          <p className="text-muted-foreground text-sm mb-6">Live crash prediction active</p>

          {/* Live Status */}
          <div className="bg-muted rounded-lg p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Current Phase</p>
            <p className="text-lg font-bold capitalize" style={{
              color: phase === "flying" ? "rgb(50, 205, 10)" : phase === "crashed" ? "rgb(220, 50, 50)" : "rgb(230, 160, 10)"
            }}>
              {phase === "flying" ? `Flying ${multiplier.toFixed(2)}x` : phase === "crashed" ? "Crashed!" : "⏳ Waiting for next round..."}
            </p>
          </div>

          {/* Prediction - show during waiting & flying */}
          {(phase === "waiting" || phase === "flying") && nextCrashPoint > 0 && (
            <div className="bg-muted rounded-lg p-6 mb-4 border-2 animate-pulse" style={{ borderColor: "rgb(220, 50, 50)" }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" style={{ color: "rgb(220, 50, 50)" }} />
                <p className="text-sm font-bold" style={{ color: "rgb(220, 50, 50)" }}>
                  NEXT CRASH POINT
                </p>
                <AlertTriangle className="w-5 h-5" style={{ color: "rgb(220, 50, 50)" }} />
              </div>
              <p className="text-6xl font-black text-accent my-3">{nextCrashPoint.toFixed(2)}x</p>
              <p className="text-xs text-muted-foreground mt-2">
                {phase === "waiting" 
                  ? "🔮 Next round will crash at this point — place your bet now!" 
                  : `⚡ Crash coming! Cash out before ${nextCrashPoint.toFixed(2)}x!`}
              </p>
            </div>
          )}

          {/* Crashed - generating next */}
          {phase === "crashed" && (
            <div className="bg-muted rounded-lg p-6 mb-4">
              <p className="text-xs text-muted-foreground mb-2">Round ended. Generating next crash point...</p>
              <Zap className="w-8 h-8 text-accent mx-auto animate-spin" />
              <p className="text-xs text-muted-foreground mt-2">Prediction will appear in ~5 seconds</p>
            </div>
          )}

          <Link to="/" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Game
          </Link>
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