import { useEffect, useState } from "react";
import { X, Star } from "lucide-react";
import { useGame } from "@/contexts/GameContext";

const CashOutToast = () => {
  const { lastCashout, dismissCashout } = useGame();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastCashout) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(() => dismissCashout(), 300);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [lastCashout, dismissCashout]);

  if (!lastCashout) return null;

  return (
    <div
      className={`pointer-events-auto absolute left-1/2 top-3 z-30 -translate-x-1/2 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
      style={{ width: "94%", maxWidth: 460 }}
    >
      <div
        className="flex items-stretch rounded-full overflow-hidden"
        style={{
          background: "rgba(20, 30, 20, 0.85)",
          border: "1.5px solid rgb(80, 180, 90)",
          boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex flex-1 items-center justify-center flex-col px-3 py-2">
          <span className="text-[12px] text-white/70 leading-tight">You have cashed out!</span>
          <span className="text-[18px] font-black text-white leading-tight">
            {lastCashout.multiplier.toFixed(2)}x
          </span>
        </div>
        <div
          className="flex flex-1 items-center justify-center gap-2 px-3 py-2 relative"
          style={{
            background: "linear-gradient(180deg, rgb(110, 200, 90), rgb(60, 150, 60))",
          }}
        >
          <Star className="h-4 w-4 text-white/60" fill="none" />
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-semibold text-white leading-tight">Win BDT</span>
            <span className="text-[18px] font-black text-white leading-tight">
              {lastCashout.winAmount.toFixed(2)}
            </span>
          </div>
          <Star className="h-4 w-4 text-white/60" fill="none" />
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(() => dismissCashout(), 200); }}
          className="flex items-center justify-center px-3"
          style={{ background: "rgba(255,255,255,0.08)" }}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-white/80" />
        </button>
      </div>
    </div>
  );
};

export default CashOutToast;
