import { useState } from "react";
import { Minus, Plus, ChevronDown } from "lucide-react";

const BetPanel = ({ showCollapse = false }: { showCollapse?: boolean }) => {
  const [betAmount, setBetAmount] = useState(10.0);
  const [activeTab, setActiveTab] = useState<"bet" | "auto">("bet");

  const presets = [100, 200, 500, 1000];

  return (
    <div className="bg-card rounded-xl p-3 mx-3 mb-2 border border-border">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 bg-muted rounded-full overflow-hidden">
          <button
            onClick={() => setActiveTab("bet")}
            className={`flex-1 py-2 text-xs font-semibold transition-colors rounded-full ${
              activeTab === "bet" ? "bg-secondary text-foreground" : "text-muted-foreground"
            }`}
          >
            Bet
          </button>
          <button
            onClick={() => setActiveTab("auto")}
            className={`flex-1 py-2 text-xs font-semibold transition-colors rounded-full ${
              activeTab === "auto" ? "bg-secondary text-foreground" : "text-muted-foreground"
            }`}
          >
            Auto
          </button>
        </div>
        {showCollapse && (
          <button className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-muted-foreground">
            <Minus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1">
          <div className="flex items-center bg-muted rounded-lg px-2 py-2">
            <span className="text-foreground font-bold text-lg flex-1">{betAmount.toFixed(2)}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setBetAmount(Math.max(1, betAmount - 10))}
                className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBetAmount(betAmount + 10)}
                className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 mt-1.5">
            {presets.map((val) => (
              <button
                key={val}
                onClick={() => setBetAmount(val)}
                className="bg-muted text-muted-foreground text-[10px] py-1.5 rounded-md hover:bg-secondary hover:text-foreground transition-colors"
              >
                {val.toLocaleString()}₹
              </button>
            ))}
          </div>
        </div>

        <button className="bg-bet-green hover:opacity-90 text-accent-foreground font-extrabold text-xl py-8 px-8 rounded-xl transition-opacity">
          BET
        </button>
      </div>
    </div>
  );
};

export default BetPanel;
