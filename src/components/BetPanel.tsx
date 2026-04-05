import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useGame } from "@/contexts/GameContext";

const BetPanel = ({ panelIndex = 0, showCollapse = false }: { panelIndex?: 0 | 1; showCollapse?: boolean }) => {
  const [betAmount, setBetAmount] = useState(10.0);
  const [activeTab, setActiveTab] = useState<"bet" | "auto">("bet");
  const { phase, multiplier, bets, placeBet, cashOut, balance } = useGame();

  const myBet = bets[panelIndex];
  const hasBet = myBet !== null;
  const canBet = !hasBet && betAmount <= balance;
  const canCashOut = hasBet && !myBet.cashedOut && phase === "flying";

  const handleMainButton = () => {
    if (canCashOut) {
      cashOut(panelIndex);
    } else if (!hasBet) {
      placeBet(panelIndex, betAmount);
    }
  };

  const getButtonContent = () => {
    if (canCashOut) {
      const winAmount = (myBet!.amount * multiplier).toFixed(2);
      return (
        <>
          <span className="text-[11px] font-semibold opacity-90">Cash Out</span>
          <span className="text-[24px] font-black leading-tight">{winAmount}</span>
          <span className="text-[11px] font-semibold opacity-70">BDT</span>
        </>
      );
    }
    if (hasBet && myBet.cashedOut) {
      return (
        <>
          <span className="text-[11px] font-semibold opacity-80">Won!</span>
          <span className="text-[22px] font-black leading-tight text-white">{(myBet.amount * (myBet.cashoutMultiplier || 1)).toFixed(2)}</span>
          <span className="text-[11px] font-semibold opacity-70">{myBet.cashoutMultiplier?.toFixed(2)}x</span>
        </>
      );
    }
    if (hasBet) {
      return (
        <>
          <span className="text-[11px] font-semibold opacity-80">Waiting...</span>
          <span className="text-[22px] font-black leading-tight">{myBet.amount.toFixed(2)}</span>
          <span className="text-[11px] font-semibold opacity-70">BDT</span>
        </>
      );
    }
    return (
      <>
        <span className="text-[11px] font-semibold opacity-80">
          {phase === "flying" ? "Bet (Next Round)" : "Bet"}
        </span>
        <span className="text-[26px] font-black leading-tight">{betAmount.toFixed(2)}</span>
        <span className="text-[11px] font-semibold opacity-70">BDT</span>
      </>
    );
  };

  const getButtonStyle = () => {
    if (canCashOut) {
      return {
        background: "linear-gradient(180deg, rgb(230, 160, 10) 0%, rgb(200, 120, 5) 100%)",
        boxShadow: "0 4px 15px rgba(230, 160, 10, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
      };
    }
    if (hasBet && myBet.cashedOut) {
      return {
        background: "linear-gradient(180deg, rgb(80, 80, 85) 0%, rgb(60, 60, 65) 100%)",
        boxShadow: "none",
      };
    }
    if (hasBet) {
      return {
        background: "linear-gradient(180deg, rgb(180, 50, 20) 0%, rgb(140, 30, 10) 100%)",
        boxShadow: "0 4px 15px rgba(180, 50, 20, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
      };
    }
    return {
      background: "linear-gradient(180deg, rgb(50, 205, 10) 0%, rgb(30, 160, 5) 100%)",
      boxShadow: "0 4px 15px rgba(40, 180, 10, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
    };
  };

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
                {val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* BET / CASHOUT button */}
        <div className="flex flex-1">
          <button
            onClick={handleMainButton}
            disabled={!canBet && !canCashOut && !hasBet}
            className="flex w-full flex-col items-center justify-center rounded-2xl text-white active:scale-95 transition-transform disabled:opacity-50"
            style={getButtonStyle()}
          >
            {getButtonContent()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetPanel;
