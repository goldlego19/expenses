import type { FC } from "react";
import type { Pocket } from "../../types/finance";

interface PocketCardProps {
  pocket: Pocket;
}

const PocketCard: FC<PocketCardProps> = ({ pocket }) => {
  // Check if a valid target exists
  const hasTarget =
    pocket.target !== undefined && pocket.target !== null && pocket.target > 0;

  const progress = hasTarget
    ? Math.min((pocket.current / pocket.target!) * 100, 100)
    : 0;

  const getProgressColour = (colourStr: string) => {
    const map: Record<string, string> = {
      emerald: "#10b981",
      blue: "#3b82f6",
      rose: "#f43f5e",
      amber: "#f59e0b",
      purple: "#8b5cf6",
    };
    return map[colourStr] || "#3b82f6";
  };

  return (
    <div className="flex-shrink-0 w-48 bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-3xl snap-center relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="font-semibold text-gray-200">{pocket.name}</h3>
        <p className="text-2xl font-bold text-white mt-2">
          £{pocket.current.toFixed(2)}
        </p>

        {hasTarget ? (
          <>
            <p className="text-xs text-gray-400 mb-3">
              of £{pocket.target?.toFixed(2)}
            </p>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundColor: getProgressColour(pocket.colour),
                }}
              />
            </div>
          </>
        ) : (
          // Display when no goal is set
          <p className="text-xs text-gray-400 mb-3 mt-1">No target set</p>
        )}
      </div>
    </div>
  );
};

export default PocketCard;
