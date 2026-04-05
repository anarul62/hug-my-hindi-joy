import GameHeader from "@/components/GameHeader";
import MultiplierHistory from "@/components/MultiplierHistory";
import GameArea from "@/components/GameArea";
import BetPanel from "@/components/BetPanel";
import BetHistory from "@/components/BetHistory";

const Index = () => (
  <div className="mx-auto flex min-h-screen max-w-lg flex-col" style={{ background: "rgb(16, 17, 18)" }}>
    <GameHeader />
    <div className="flex flex-1 flex-col gap-[5px] px-[5px] pb-1">
      <MultiplierHistory />
      <GameArea />
      <BetPanel />
      <BetPanel showCollapse />
      <BetHistory />
    </div>
  </div>
);

export default Index;
