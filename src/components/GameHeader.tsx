import { useState } from "react";
import { Menu, MessageCircle, Volume2, Music, Sparkles, Star, History, Coins, HelpCircle, FileText, Shield } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

const GameHeader = () => {
  const {
    balance,
    soundEnabled,
    musicEnabled,
    animationEnabled,
    setSoundEnabled,
    setMusicEnabled,
    setAnimationEnabled,
  } = useGame();
  const [open, setOpen] = useState(false);

  const Row = ({
    icon,
    label,
    right,
  }: {
    icon: React.ReactNode;
    label: string;
    right?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <div className="flex items-center gap-3 text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[15px]">{label}</span>
      </div>
      {right}
    </div>
  );

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-primary font-black text-xl italic tracking-tight">Aviator</span>
      <div className="flex items-center gap-2">
        <div
          className="px-3 py-1 rounded-full text-[13px] font-bold text-foreground"
          style={{ background: "rgb(27, 28, 29)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
          <span className="text-muted-foreground text-[11px]">BDT</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button aria-label="Menu" className="p-1">
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[88%] max-w-sm border-r border-white/10 p-0"
            style={{ background: "rgb(20, 21, 22)" }}
          >
            <div className="px-4 pt-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl">🌑</div>
                <div className="text-foreground font-semibold truncate flex-1">Player</div>
              </div>
            </div>
            <div className="px-4">
              <Row
                icon={<Volume2 className="w-5 h-5" />}
                label="Sound"
                right={<Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />}
              />
              <Row
                icon={<Music className="w-5 h-5" />}
                label="Music"
                right={<Switch checked={musicEnabled} onCheckedChange={setMusicEnabled} />}
              />
              <Row
                icon={<Sparkles className="w-5 h-5" />}
                label="Animation"
                right={<Switch checked={animationEnabled} onCheckedChange={setAnimationEnabled} />}
              />
              <Row icon={<Star className="w-5 h-5" />} label="Free Bets" />
              <Row icon={<History className="w-5 h-5" />} label="My Bet History" />
              <Row icon={<Coins className="w-5 h-5" />} label="Game Limits" />
              <Row icon={<HelpCircle className="w-5 h-5" />} label="How To Play" />
              <Row icon={<FileText className="w-5 h-5" />} label="Game Rules" />
              <Row icon={<Shield className="w-5 h-5" />} label="Provably Fair Settings" />
            </div>
          </SheetContent>
        </Sheet>
        <MessageCircle className="w-5 h-5 text-muted-foreground cursor-pointer" />
      </div>
    </div>
  );
};

export default GameHeader;
