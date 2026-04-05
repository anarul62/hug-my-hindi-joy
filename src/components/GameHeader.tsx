import { Menu, MessageCircle } from "lucide-react";

const GameHeader = () => (
  <div className="flex items-center justify-between px-4 py-3">
    <span className="text-primary font-black text-xl italic tracking-tight">Aviator</span>
    <div className="flex items-center gap-3">
      <div className="bg-card px-3 py-1 rounded-full text-sm font-bold text-foreground">
        4,927.98 <span className="text-muted-foreground text-xs">BDT</span>
      </div>
      <Menu className="w-5 h-5 text-muted-foreground cursor-pointer" />
      <MessageCircle className="w-5 h-5 text-muted-foreground cursor-pointer" />
    </div>
  </div>
);

export default GameHeader;
