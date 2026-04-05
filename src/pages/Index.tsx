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
    <div className="mt-2">
      <BetPanel />
      <BetPanel showCollapse />
    </div>
    <BetHistory />
  </div>
);

export default Index;
