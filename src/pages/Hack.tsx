import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";

const Hack = () => {
  const [apiKey, setApiKey] = useState("");

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
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring mb-4"
        />

        <button className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 rounded-lg transition-opacity">
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
