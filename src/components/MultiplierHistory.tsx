const history = [1.41, 5.61, 2.85, 1.07, 1.44, 2.00, 1.00, 3.21, 1.89, 7.42];

const getColor = (val: number) => {
  if (val >= 5) return "text-multiplier-pink";
  if (val >= 2) return "text-multiplier-blue";
  return "text-foreground";
};

const MultiplierHistory = () => (
  <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
    {history.map((val, i) => (
      <span key={i} className={`text-sm font-bold ${getColor(val)} whitespace-nowrap`}>
        {val.toFixed(2)}x
      </span>
    ))}
    <span className="text-muted-foreground text-sm cursor-pointer">•••</span>
  </div>
);

export default MultiplierHistory;
