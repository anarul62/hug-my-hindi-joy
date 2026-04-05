import { useState } from "react";

const BetPanel = () => {
  const [betAmount, setBetAmount] = useState(10.0);
  const [activeTab, setActiveTab] = useState<"bet" | "auto">("bet");

  const presets = [100, 200, 500, 1000];

  return (
    <div className="bg-card rounded-lg p-3 mx-1">
      <div className="flex mb-3">
        <button
          onClick={() => setActiveTab("bet")}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-l-md transition-colors ${
            activeTab === "bet" ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          Bet
        </button>
        <button
          onClick={() => setActiveTab("auto")}
          className={`flex-1 py-1.5 text-sm font-semibold rounded-r-md transition-colors ${
            activeTab === "auto" ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          Auto
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center bg-muted rounded-md flex-1">
          <button
            onClick={() => setBetAmount(Math.max(1, betAmount - 10))}
            className="px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            −
          </button>
          <input
            type="number"
            value={betAmount.toFixed(2)}
            onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
            className="bg-transparent text-center text-foreground font-bold w-full outline-none"
          />
          <button
            onClick={() => setBetAmount(betAmount + 10)}
            className="px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 mb-3">
        {presets.map((val) => (
          <button
            key={val}
            onClick={() => setBetAmount(val)}
            className="bg-muted text-muted-foreground text-xs py-1.5 rounded-md hover:bg-secondary hover:text-foreground transition-colors"
          >
            {val.toLocaleString()}
          </button>
        ))}
      </div>

      <button className="w-full bg-bet-green hover:opacity-90 text-accent-foreground font-bold py-4 rounded-lg transition-opacity">
        <div className="text-xs font-normal opacity-80">Bet (Next Round)</div>
        <div className="text-lg">{betAmount.toFixed(2)}</div>
        <div className="text-xs opacity-60">BDT</div>
      </button>
    </div>
  );
};

export default BetPanel;
