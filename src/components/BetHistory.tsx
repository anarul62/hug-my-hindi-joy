import { useState, useEffect } from "react";
import { generateFakeBets, type FakeBet } from "@/lib/fakeData";

const tabs = ["All Bets", "Previous", "Top"] as const;

const BetHistory = () => {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All Bets");
  const [bets, setBets] = useState<FakeBet[]>(() => generateFakeBets(20));

  // Simulate live bets coming in
  useEffect(() => {
    const interval = setInterval(() => {
      setBets((prev) => {
        const newBets = generateFakeBets(Math.floor(Math.random() * 3) + 1);
        return [...newBets, ...prev].slice(0, 30);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalBets = bets.length;
  const totalWin = bets.reduce((s, b) => s + (b.cashout || 0), 0);

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
              color: activeTab === tab ? "#fff" : "rgb(107, 110, 120)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>{totalBets}/{totalBets} Bets</span>
        <span>
          Total win BDT <span className="text-foreground font-bold ml-1">{totalWin.toFixed(2)}</span>
        </span>
      </div>

      {/* Bet rows */}
      <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
        {bets.map((bet, i) => {
          const isWinner = bet.cashout !== null;
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
                <img
                  src={bet.avatar}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover bg-[rgb(51,51,51)]"
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
                />
                <span className="text-muted-foreground truncate">{bet.user}</span>
              </div>
              <span className="col-span-3 text-right text-foreground/80">{bet.amount.toFixed(2)}</span>
              <span className={`col-span-2 text-right font-bold ${bet.multiplier ? "text-purple-400" : "text-muted-foreground"}`}>
                {bet.multiplier ? `${bet.multiplier.toFixed(2)}x` : "—"}
              </span>
              <span className={`col-span-3 text-right font-semibold ${bet.cashout ? "text-foreground" : "text-muted-foreground"}`}>
                {bet.cashout ? bet.cashout.toFixed(2) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BetHistory;
