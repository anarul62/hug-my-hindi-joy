import { useState } from "react";
import { Clock } from "lucide-react";

type Bet = {
  userId: number;
  avatar: string;
  amount: number;
  multiplier: string;
  cashout: string;
};

const avatars = ["🦁", "🐯", "🦊", "🐲", "🦅", "🌺", "🌿", "🎯", "🅰️", "🦋", "🎪"];

const bets: Bet[] = [
  { userId: 32387, avatar: avatars[0], amount: 4567, multiplier: "-", cashout: "-" },
  { userId: 20885, avatar: avatars[1], amount: 4966, multiplier: "-", cashout: "-" },
  { userId: 44796, avatar: avatars[2], amount: 6091, multiplier: "-", cashout: "-" },
  { userId: 19301, avatar: avatars[3], amount: 6442, multiplier: "-", cashout: "-" },
  { userId: 42368, avatar: avatars[4], amount: 7114, multiplier: "-", cashout: "-" },
  { userId: 48107, avatar: avatars[5], amount: 5029, multiplier: "-", cashout: "-" },
  { userId: 46883, avatar: avatars[6], amount: 4488, multiplier: "-", cashout: "-" },
  { userId: 28617, avatar: avatars[7], amount: 2357, multiplier: "-", cashout: "-" },
  { userId: 47434, avatar: avatars[8], amount: 4635, multiplier: "-", cashout: "-" },
  { userId: 49726, avatar: avatars[9], amount: 9497, multiplier: "-", cashout: "-" },
  { userId: 26536, avatar: avatars[10], amount: 4939, multiplier: "-", cashout: "-" },
];

const tabs = ["All Bets", "My Bets"] as const;

const BetHistory = () => {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All Bets");

  return (
    <div className="mx-3 mt-2 pb-6">
      {/* Tabs */}
      <div className="flex bg-card rounded-full overflow-hidden border border-border mx-auto max-w-[220px] mb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors rounded-full ${
              activeTab === tab ? "bg-secondary text-foreground" : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-sm font-semibold text-foreground">
          TOTAL BETS : <span className="text-accent">445</span>
        </div>
        <button className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          Previous hand
        </button>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_1fr_0.7fr_0.7fr] px-2 py-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
        <span>User</span>
        <span className="text-center">Bet</span>
        <span className="text-center">Mult.</span>
        <span className="text-center">Cash out</span>
      </div>

      {/* Bet rows */}
      <div className="space-y-0.5">
        {bets.map((bet, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_0.7fr_0.7fr] items-center px-2 py-2.5 rounded-lg hover:bg-card/50"
          >
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg">
                {bet.avatar}
              </span>
              <span className="text-sm font-medium text-foreground">{bet.userId}</span>
            </div>
            <div className="flex justify-center">
              <span className="bg-muted text-foreground text-xs font-bold px-3 py-1 rounded-md">
                {bet.amount}₹
              </span>
            </div>
            <span className="text-center text-sm text-muted-foreground">{bet.multiplier}</span>
            <span className="text-center text-sm text-muted-foreground">{bet.cashout}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BetHistory;
