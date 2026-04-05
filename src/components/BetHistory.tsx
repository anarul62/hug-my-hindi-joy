import { useState } from "react";

type Bet = {
  user: string;
  amount: number;
  multiplier: number | null;
  win: number | null;
};

const bets: Bet[] = [
  { user: "p***r", amount: 30.84, multiplier: 1.39, win: 42.87 },
  { user: "a***n", amount: 3989.14, multiplier: null, win: null },
  { user: "n***r", amount: 201.07, multiplier: 1.14, win: 229.22 },
  { user: "m***t", amount: 338.32, multiplier: 1.41, win: 477.03 },
  { user: "i***p", amount: 55.68, multiplier: 1.39, win: 77.40 },
  { user: "r***n", amount: 88.25, multiplier: null, win: null },
  { user: "v***k", amount: 2555.59, multiplier: null, win: null },
  { user: "p***d", amount: 63.40, multiplier: null, win: null },
  { user: "h***r", amount: 581.69, multiplier: null, win: null },
  { user: "i***d", amount: 641.62, multiplier: null, win: null },
  { user: "b***y", amount: 625.84, multiplier: null, win: null },
  { user: "t***r", amount: 42.88, multiplier: null, win: null },
];

const tabs = ["All Bets", "Previous", "Top"] as const;

const BetHistory = () => {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All Bets");
  const totalWin = bets.reduce((s, b) => s + (b.win || 0), 0);

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: "rgb(27, 28, 29)" }}>
      {/* Tabs */}
      <div className="flex mx-2 mt-2 rounded-full overflow-hidden" style={{ background: "rgb(14, 14, 14)" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-[7px] text-[12px] font-semibold rounded-full transition-colors"
            style={{
              background: activeTab === tab ? "rgb(44, 45, 48)" : "transparent",
              color: activeTab === tab ? "rgb(255,255,255)" : "rgb(107, 110, 120)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>{bets.length}/{bets.length} Bets</span>
        <span>
          Total win BDT <span className="text-foreground font-bold ml-1">{totalWin.toFixed(2)}</span>
        </span>
      </div>

      {/* Bet rows */}
      <div className="max-h-40 overflow-y-auto scrollbar-hide">
        {bets.map((bet, i) => {
          const isWinner = bet.win !== null;
          return (
            <div
              key={i}
              className="grid grid-cols-12 px-2 py-[5px] text-[11px] items-center"
              style={{
                borderLeft: `2px solid ${isWinner ? "rgb(40, 169, 9)" : "transparent"}`,
                background: isWinner ? "rgba(40, 169, 9, 0.07)" : "transparent",
              }}
            >
              <div className="col-span-4 flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[7px]"
                  style={{ background: "rgb(51, 51, 51)" }}
                >
                  👤
                </div>
                <span className="text-muted-foreground truncate">{bet.user}</span>
              </div>
              <span className="col-span-3 text-right text-foreground/80">{bet.amount.toFixed(2)}</span>
              <span className={`col-span-2 text-right font-bold ${bet.multiplier ? "text-purple-400" : "text-muted-foreground"}`}>
                {bet.multiplier ? `${bet.multiplier.toFixed(2)}x` : "—"}
              </span>
              <span className={`col-span-3 text-right font-semibold ${bet.win ? "text-foreground" : "text-muted-foreground"}`}>
                {bet.win ? bet.win.toFixed(2) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BetHistory;
