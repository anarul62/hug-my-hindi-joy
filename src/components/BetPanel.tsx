import { useState, useEffect, useRef } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useGame } from "@/contexts/GameContext";

const BetPanel = ({ panelIndex = 0, showCollapse = false }: { panelIndex?: 0 | 1; showCollapse?: boolean }) => {
  const [betAmount, setBetAmount] = useState(10.0);
  const [activeTab, setActiveTab] = useState<"bet" | "auto">("bet");
  const [autoBet, setAutoBet] = useState(false);
  const [autoCashOutEnabled, setAutoCashOutEnabled] = useState(false);
  const [autoCashOutValue, setAutoCashOutValue] = useState(1.10);
  const [autoCashOutInput, setAutoCashOutInput] = useState("1.10");
  const { phase, multiplier, bets, placeBet, cashOut, cancelBet, balance } = useGame();

  const myBet = bets[panelIndex];
  const hasBet = myBet !== null;
  const canBet = !hasBet && betAmount <= balance && phase === "waiting";
  const canCashOut = hasBet && !myBet.cashedOut && phase === "flying";
  const canCancel = hasBet && !myBet.cashedOut && phase === "waiting";

  // Auto cash out
  const cashedRef = useRef(false);
  useEffect(() => {
    if (phase !== "flying") { cashedRef.current = false; return; }
    if (autoCashOutEnabled && canCashOut && !cashedRef.current && multiplier >= autoCashOutValue) {
      cashedRef.current = true;
      cashOut(panelIndex);
    }
  }, [multiplier, phase, autoCashOutEnabled, autoCashOutValue, canCashOut, cashOut, panelIndex]);

  // Auto bet: place bet automatically when waiting starts
  const placedRef = useRef(false);
  useEffect(() => {
    if (phase !== "waiting") { placedRef.current = false; return; }
    if (autoBet && !hasBet && !placedRef.current && betAmount <= balance) {
      placedRef.current = true;
      placeBet(panelIndex, betAmount);
    }
  }, [phase, autoBet, hasBet, betAmount, balance, placeBet, panelIndex]);

  const handleMainButton = () => {
    if (canCancel) {
      cancelBet(panelIndex);
    } else if (canCashOut) {
      cashOut(panelIndex);
    } else if (!hasBet) {
      placeBet(panelIndex, betAmount);
    }
  };

  const getButtonContent = () => {
    if (canCancel) {
      return (
        <>
          <span className="text-[22px] font-black leading-tight">Cancel</span>
          <span className="text-[12px] font-semibold opacity-90 mt-0.5">Waiting for next round</span>
        </>
      );
    }
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
    if (canCancel) {
      return {
        background: "linear-gradient(180deg, rgb(220, 40, 50) 0%, rgb(180, 20, 30) 100%)",
        boxShadow: "0 4px 15px rgba(220, 40, 50, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
      };
    }
    if (canCashOut) {
      return {
        background: "linear-gradient(180deg, rgb(230, 160, 10) 0%, rgb(200, 120, 5) 100%)",
        boxShadow: "0 4px 15px rgba(230, 160, 10, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
      };
    }
    if (hasBet && myBet.cashedOut) {
      return {
        background: "linear-gradient(180deg, rgb(230, 180, 10) 0%, rgb(200, 140, 5) 100%)",
        boxShadow: "0 4px 15px rgba(230, 180, 10, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
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
            disabled={!canBet && !canCashOut && !canCancel && !hasBet}
            className="flex w-full flex-col items-center justify-center rounded-2xl text-white active:scale-95 transition-transform disabled:opacity-50"
            style={getButtonStyle()}
          >
            {getButtonContent()}
          </button>
        </div>
      </div>

      {/* Auto bet controls */}
      {activeTab === "auto" && (
        <div
          className="flex items-center justify-between gap-3 px-3 py-2 border-t border-white/10"
          style={{ background: "rgb(22, 23, 25)" }}
        >
          {/* Auto bet toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-foreground/80">Auto bet</span>
            <button
              onClick={() => setAutoBet((v) => !v)}
              className="relative flex h-[22px] w-[40px] items-center rounded-full transition-colors"
              style={{ background: autoBet ? "rgb(50, 205, 10)" : "rgb(60, 62, 66)" }}
            >
              <span
                className="absolute h-[18px] w-[18px] rounded-full bg-white transition-transform"
                style={{ transform: autoBet ? "translateX(20px)" : "translateX(2px)" }}
              />
            </button>
          </div>

          {/* Auto cash out */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-foreground/80">Auto Cash Out</span>
            <button
              onClick={() => setAutoCashOutEnabled((v) => !v)}
              className="relative flex h-[22px] w-[40px] items-center rounded-full transition-colors"
              style={{ background: autoCashOutEnabled ? "rgb(50, 205, 10)" : "rgb(60, 62, 66)" }}
            >
              <span
                className="absolute h-[18px] w-[18px] rounded-full bg-white transition-transform"
                style={{ transform: autoCashOutEnabled ? "translateX(20px)" : "translateX(2px)" }}
              />
            </button>
            <div
              className="flex items-center gap-1 rounded-full px-2 py-1"
              style={{ background: "rgb(14, 15, 16)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <input
                type="text"
                inputMode="decimal"
                value={autoCashOutInput}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!/^\d*\.?\d*$/.test(v)) return;
                  setAutoCashOutInput(v);
                  const n = parseFloat(v);
                  if (!isNaN(n) && n >= 1.01) setAutoCashOutValue(n);
                }}
                onBlur={() => {
                  const n = parseFloat(autoCashOutInput);
                  const safe = !isNaN(n) && n >= 1.01 ? n : 1.10;
                  setAutoCashOutValue(safe);
                  setAutoCashOutInput(safe.toFixed(2));
                }}
                className="w-[48px] bg-transparent text-[13px] font-bold text-foreground outline-none"
              />
              <span className="text-[12px] text-muted-foreground">x</span>
              <button
                onClick={() => { setAutoCashOutEnabled(false); setAutoCashOutValue(1.10); setAutoCashOutInput("1.10"); }}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BetPanel;
