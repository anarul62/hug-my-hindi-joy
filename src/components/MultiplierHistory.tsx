import { Ellipsis } from "lucide-react";

const history = [
  { val: 1.41, color: "teal" },
  { val: 5.61, color: "purple" },
  { val: 2.85, color: "purple" },
  { val: 1.07, color: "teal" },
  { val: 1.44, color: "teal" },
  { val: 2.00, color: "purple" },
  { val: 1.00, color: "teal" },
];

const MultiplierHistory = () => (
  <div className="flex items-center gap-[6px] overflow-x-auto py-1 px-1 scrollbar-hide">
    {history.map((h, i) => (
      <span
        key={i}
        className={`flex-shrink-0 px-[5px] py-[1px] rounded-full text-[12px] font-bold cursor-default ${
          h.color === "teal" ? "text-history-teal" : "text-history-purple"
        }`}
      >
        {h.val.toFixed(2)}x
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

export default MultiplierHistory;
