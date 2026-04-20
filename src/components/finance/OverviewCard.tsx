import type { FC } from "react";

interface OverviewCardProps {
  title: string;
  amount: number;
  type: "income" | "expense" | "neutral";
}

const OverviewCard: FC<OverviewCardProps> = ({ title, amount, type }) => {
  const colours = {
    income: "text-emerald-400",
    expense: "text-rose-400",
    neutral: "text-white",
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-xl flex flex-col justify-center">
      <span className="text-sm text-gray-400 font-medium mb-1">{title}</span>
      <span className={`text-3xl font-bold tracking-tight ${colours[type]}`}>
        €{amount.toFixed(2)}
      </span>
    </div>
  );
};

export default OverviewCard;
