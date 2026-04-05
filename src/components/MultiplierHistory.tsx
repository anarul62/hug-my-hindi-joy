import { Ellipsis } from "lucide-react";
import { useState, useEffect } from "react";
import { generateCrashHistory } from "@/lib/fakeData";

const getColor = (val: number) => {
  if (val >= 2) return "text-history-purple";
  return "text-history-teal";
};

const MultiplierHistory = () => {
  const [history, setHistory] = useState(() => generateCrashHistory(8));

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => {
        const newVal = parseFloat((1 + Math.random() * (Math.random() > 0.7 ? 10 : 2)).toFixed(2));
        return [newVal, ...prev.slice(0, 14)];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-[6px] overflow-x-auto py-1 px-1 scrollbar-hide">
      {history.map((val, i) => (
        <span
          key={i}
          className={`flex-shrink-0 px-[5px] py-[1px] rounded-full text-[12px] font-bold cursor-default ${getColor(val)}`}
        >
          {val.toFixed(2)}x
        </span>
      ))}
      <button
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: "rgb(44, 45, 48)" }}
      >
        <Ellipsis className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
};

export default MultiplierHistory;
