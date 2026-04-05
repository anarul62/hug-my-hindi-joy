import { useState } from "react";
import { Minus, Plus, SquareMinus } from "lucide-react";

const BetPanel = ({ showCollapse = false }: { showCollapse?: boolean }) => {
  const [betAmount, setBetAmount] = useState(10.0);
  const [activeTab, setActiveTab] = useState<"bet" | "auto">("bet");

  return (
    <div className="w-full overflow-hidden rounded-xl" style={{ background: "rgb(27, 28, 29)" }}>
      {/* Tab bar */}
      <div className="flex items-center px-2 pt-2 pb-1">
        <div className="flex flex-1 rounded-full p-[2px]" style={{ background: "rgb(14, 15, 16)" }}>
          <button
            onClick={() => setActiveTab("bet")}
            className="flex-1 rounded-full py-[7px] text-[12px] font-semibold capitalize transition-colors"
            style={{
              background: activeTab === "bet" ? "rgb(52, 54, 58)" : "transparent",
              color: activeTab === "bet" ? "rgb(255, 255, 255)" : "rgb(107, 110, 120)",
            }}
          >
            Bet
          </button>
          <button
            onClick={() => setActiveTab("auto")}
            className="flex-1 rounded-full py-[7px] text-[12px] font-semibold capitalize transition-colors"
            style={{
              background: activeTab === "auto" ? "rgb(52, 54, 58)" : "transparent",
              color: activeTab === "auto" ? "rgb(255, 255, 255)" : "rgb(107, 110, 120)",
            }}
          >
            Auto
          </button>
        </div>
        {showCollapse && (
          <button
            className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground"
            style={{ background: "rgb(14, 15, 16)" }}
          >
            <SquareMinus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Bet controls */}
      <div className="flex gap-2 px-2 pb-2">
        <div className="flex flex-col gap-1" style={{ width: "42%" }}>
          <div className="flex items-center gap-[2px]">
            <button
              onClick={() => setBetAmount(Math.max(1, betAmount - 10))}
              className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              style={{ background: "rgb(52, 54, 58)" }}
            >
              <Minus className="h-4 w-4" />
            </button>
            <div
              className="flex h-[36px] min-w-0 flex-1 items-center justify-center rounded-lg"
              style={{ background: "rgb(14, 15, 16)" }}
            >
              <input
                type="number"
                className="w-full bg-transparent text-center text-[16px] font-bold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={betAmount.toFixed(2)}
                onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <button
              onClick={() => setBetAmount(betAmount + 10)}
              className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              style={{ background: "rgb(52, 54, 58)" }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-[3px]">
            {[100, 200, 500, 1000].map((val) => (
              <button
                key={val}
                onClick={() => setBetAmount(val)}
                className="rounded-lg py-[6px] text-[12px] font-semibold text-muted-foreground hover:text-foreground"
                style={{ background: "rgb(52, 54, 58)" }}
              >
                {val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1">
          <button
            className="flex w-full flex-col items-center justify-center rounded-xl font-bold"
            style={{
              background: "linear-gradient(rgba(40, 169, 9, 0.5), rgba(30, 130, 7, 0.5))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <span className="text-[11px] text-white/60">Bet (Next Round)</span>
            <span className="text-[18px] font-black text-white/70">{betAmount.toFixed(2)}</span>
            <span className="text-[10px] text-white/50">BDT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetPanel;
