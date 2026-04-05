import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle, Zap } from "lucide-react";

const API_KEY = "AVIATOR-ADMIN-2024";

const Hack = () => {
  const [apiKey, setApiKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [nextMultiplier, setNextMultiplier] = useState<number | null>(null);

  const handleUnlock = () => {
    if (apiKey === API_KEY) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const predict = () => {
    const vals = [2.35, 5.12, 1.87, 10.43, 3.76, 7.21, 1.14, 4.58, 15.32, 2.91];
    setNextMultiplier(vals[Math.floor(Math.random() * vals.length)]);
  };

  if (unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-xl p-8 w-full max-w-md shadow-2xl border border-border text-center">
          <CheckCircle className="w-12 h-12 text-accent mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2">Hack Unlocked! ✅</h1>
          <p className="text-muted-foreground text-sm mb-6">Next round prediction ready</p>

          <button
            onClick={predict}
            className="w-full bg-accent hover:opacity-90 text-accent-foreground font-bold py-4 rounded-lg transition-opacity flex items-center justify-center gap-2 mb-4"
          >
            <Zap className="w-5 h-5" />
            Predict Next Round
          </button>

          {nextMultiplier && (
            <div className="bg-muted rounded-lg p-6 mb-4">
              <p className="text-sm text-muted-foreground mb-1">Next Multiplier</p>
              <p className="text-5xl font-black text-accent">{nextMultiplier.toFixed(2)}x</p>
              <p className="text-xs text-muted-foreground mt-2">Place your bet now!</p>
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
