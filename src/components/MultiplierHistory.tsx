import { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MultiplierHistory = () => {
  const { crashHistory } = useGame();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-hide bg-transparent">
        {crashHistory.map((val, i) => {
          const color = val >= 2 ? "rgb(147, 51, 234)" : "rgb(20, 184, 166)";
          return (
            <span
              key={i}
              className="shrink-0 rounded-full px-2.5 py-[3px] text-[11px] font-bold text-white"
              style={{ background: color }}
            >
              {val.toFixed(2)}x
            </span>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-full px-2 py-[3px] text-[14px] font-bold text-white leading-none"
          style={{ background: "rgb(60, 62, 68)" }}
          aria-label="Show all history"
        >
          ⋯
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" style={{ background: "rgb(27, 28, 29)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader>
            <DialogTitle className="text-foreground">Round History</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="flex flex-wrap gap-1.5">
              {crashHistory.map((val, i) => {
                const color = val >= 2 ? "rgb(147, 51, 234)" : "rgb(20, 184, 166)";
                return (
                  <span
                    key={i}
                    className="shrink-0 rounded-full px-2.5 py-[3px] text-[11px] font-bold text-white"
                    style={{ background: color }}
                  >
                    {val.toFixed(2)}x
                  </span>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MultiplierHistory;
