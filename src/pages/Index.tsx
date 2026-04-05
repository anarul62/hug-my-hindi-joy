import GameHeader from "@/components/GameHeader";
import MultiplierHistory from "@/components/MultiplierHistory";
import GameArea from "@/components/GameArea";
import BetPanel from "@/components/BetPanel";
import BetHistory from "@/components/BetHistory";
import { useGame } from "@/contexts/GameContext";

const BalanceBar = () => {
  const { balance } = useGame();
  return (
    <div className="flex items-center justify-between px-3 py-1">
      <span className="text-[12px] text-muted-foreground">Balance:</span>
      <span className="text-[14px] font-bold text-foreground">{balance.toFixed(2)} BDT</span>
    </div>
  );
};

const Index = () => (
  <div className="mx-auto flex min-h-screen max-w-lg flex-col" style={{ background: "rgb(16, 17, 18)" }}>
    <GameHeader />
    <div className="flex flex-1 flex-col gap-[5px] px-[5px] pb-1">
      <MultiplierHistory />
      <GameArea />
      <BalanceBar />
      <BetPanel panelIndex={0} />
      <BetPanel panelIndex={1} showCollapse />
      <BetHistory />
    </div>
  </div>
);

export default Index;
