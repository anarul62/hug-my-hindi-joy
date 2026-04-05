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
    <div className="mx-2 mt-2">
      <div className="flex bg-card rounded-t-lg overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-b-lg px-3 pb-3">
        <div className="flex justify-between py-2 text-xs text-muted-foreground">
          <span>{bets.length}/{bets.length} Bets</span>
          <span>Total win BDT <span className="text-foreground font-bold">{totalWin.toFixed(2)}</span></span>
        </div>

        <div className="space-y-0.5">
          {bets.map((bet, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-2 px-2 rounded text-sm ${
                bet.win ? "bg-accent/10" : ""
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground">👤</span>
                <span className="text-muted-foreground truncate">{bet.user}</span>
              </div>
              <span className="text-foreground font-medium">{bet.amount.toFixed(2)}</span>
              <span className={`font-bold ${bet.multiplier ? "text-multiplier-blue" : "text-muted-foreground"}`}>
                {bet.multiplier ? `${bet.multiplier.toFixed(2)}x` : "—"}
              </span>
              <span className="text-foreground font-medium">
                {bet.win ? bet.win.toFixed(2) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BetHistory;
