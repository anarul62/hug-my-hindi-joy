import { Clock } from "lucide-react";

const history = [1.00, 1.00, 1.00];

const MultiplierHistory = () => (
  <div className="flex items-center justify-between px-3 py-2">
    <div className="flex items-center gap-1.5">
      {history.map((val, i) => (
        <span
          key={i}
          className="bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full"
        >
          {val.toFixed(2)}x
        </span>
      ))}
    </div>
    <button className="flex items-center gap-1 text-muted-foreground">
      <Clock className="w-4 h-4" />
      <span className="text-xs">▼</span>
    </button>
  </div>
);

export default MultiplierHistory;
