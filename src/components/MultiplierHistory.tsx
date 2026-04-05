import { useGame } from "@/contexts/GameContext";

const MultiplierHistory = () => {
  const { crashHistory } = useGame();

  return (
    <div className="flex gap-1 overflow-x-auto py-1 scrollbar-hide">
      {crashHistory.map((val, i) => {
        const color = val >= 2 ? "rgb(147, 51, 234)" : "rgb(20, 184, 166)";
        return (
          <span
            key={i}
            className="shrink-0 rounded-full px-2.5 py-[3px] text-[11px] font-bold text-white"
            style={{ background: color }}
          >
            {val.toFixed(2)}x
          </span>
        );
      })}
    </div>
  );
};

export default MultiplierHistory;
