import { useState } from "react";
import { Minus, Plus, SquareMinus } from "lucide-react";

const BetPanel = ({ showCollapse = false }: { showCollapse?: boolean }) => {
  const [betAmount, setBetAmount] = useState(10.0);
  const [activeTab, setActiveTab] = useState<"bet" | "auto">("bet");

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-white/10"
      style={{ background: "rgb(30, 32, 34)" }}
    >
      {/* Tab bar */}
      <div className="flex items-center px-3 pt-3 pb-2">
        <div
          className="flex flex-1 rounded-full p-[3px]"
          style={{ background: "rgb(50, 52, 56)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={() => setActiveTab("bet")}
            className="flex-1 rounded-full py-[8px] text-[13px] font-semibold capitalize transition-colors"
            style={{
              background: activeTab === "bet" ? "rgb(75, 78, 82)" : "transparent",
              color: activeTab === "bet" ? "#fff" : "rgb(120, 123, 130)",
            }}
          >
            Bet
          </button>
          <button
            onClick={() => setActiveTab("auto")}
            className="flex-1 rounded-full py-[8px] text-[13px] font-semibold capitalize transition-colors"
            style={{
              background: activeTab === "auto" ? "rgb(75, 78, 82)" : "transparent",
              color: activeTab === "auto" ? "#fff" : "rgb(120, 123, 130)",
            }}
          >
            Auto
          </button>
        </div>
        {showCollapse && (
          <button
            className="ml-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground border border-white/15"
            style={{ background: "rgb(40, 42, 44)" }}
          >
            <Minus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Bet controls */}
      <div className="flex gap-3 px-3 pb-3">
        <div className="flex flex-col gap-2" style={{ width: "44%" }}>
          {/* Amount input */}
          <div
            className="flex items-center h-[48px] rounded-full px-3"
            style={{ background: "rgb(14, 15, 16)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="text-[20px] font-bold text-foreground flex-1">{betAmount.toFixed(2)}</span>
            <div className="flex items-center gap-[2px]">
              <button
                onClick={() => setBetAmount(Math.max(1, betAmount - 10))}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-foreground/70"
                style={{ background: "rgb(75, 78, 82)" }}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setBetAmount(betAmount + 10)}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-foreground/70"
                style={{ background: "rgb(75, 78, 82)" }}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-2 gap-[4px]">
            {[100, 200, 500, 1000].map((val) => (
              <button
                key={val}
                onClick={() => setBetAmount(val)}
                className="rounded-full py-[7px] text-[13px] font-semibold text-foreground/60 hover:text-foreground transition-colors"
                style={{ background: "rgb(50, 52, 56)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {val.toLocaleString()}₹
              </button>
            ))}
          </div>
        </div>

        {/* BET button */}
        <div className="flex flex-1">
          <button
            className="flex w-full items-center justify-center rounded-2xl font-black text-[28px] text-white tracking-wide active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(180deg, rgb(50, 205, 10) 0%, rgb(30, 160, 5) 100%)",
              boxShadow: "0 4px 15px rgba(40, 180, 10, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            BET
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetPanel;
