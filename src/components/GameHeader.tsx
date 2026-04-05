import { Menu } from "lucide-react";

const GameHeader = () => (
  <div className="flex items-center justify-between px-4 py-3">
    <span className="text-primary font-black text-xl italic tracking-tight">Aviator</span>
    <div className="bg-card border border-border px-4 py-1.5 rounded-full text-sm font-bold text-foreground">
      ₹10
    </div>
  </div>
);

export default GameHeader;
