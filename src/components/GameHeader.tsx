import { Menu, MessageCircle } from "lucide-react";
import { useGame } from "@/contexts/GameContext";

const GameHeader = () => {
  const { balance } = useGame();

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-primary font-black text-xl italic tracking-tight">Aviator</span>
      <div className="flex items-center gap-2">
        <div
          className="px-3 py-1 rounded-full text-[13px] font-bold text-foreground"
          style={{ background: "rgb(27, 28, 29)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-muted-foreground text-[11px]">BDT</span>
        </div>
        <Menu className="w-5 h-5 text-muted-foreground cursor-pointer" />
        <MessageCircle className="w-5 h-5 text-muted-foreground cursor-pointer" />
      </div>
    </div>
  );
};

export default GameHeader;