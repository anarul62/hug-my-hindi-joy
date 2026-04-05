import GameHeader from "@/components/GameHeader";
import MultiplierHistory from "@/components/MultiplierHistory";
import GameArea from "@/components/GameArea";
import BetPanel from "@/components/BetPanel";
import BetHistory from "@/components/BetHistory";

const Index = () => (
  <div className="min-h-screen bg-background max-w-md mx-auto">
    <GameHeader />
    <MultiplierHistory />
    <GameArea />
    <div className="grid grid-cols-2 gap-1 mt-2 px-1">
      <BetPanel />
      <BetPanel />
    </div>
    <BetHistory />
  </div>
);

export default Index;
