import { type FC, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Pocket } from "../../types/finance";

interface AddPocketModalProps {
  onClose: () => void;
  onAdd: (pocket: Pocket) => void;
}

const availableColours: Pocket["colour"][] = [
  "blue",
  "emerald",
  "rose",
  "amber",
  "purple",
];

const AddPocketModal: FC<AddPocketModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [colour, setColour] = useState<Pocket["colour"]>("blue");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPocket: Pocket = {
      id: Date.now().toString(),
      name,
      current: 0,
      colour,
      target: target ? parseFloat(target) : undefined, // Parse if exists, else undefined
    };

    onAdd(newPocket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="relative z-10 w-full max-w-md bg-gray-900 border-t sm:border border-white/10 p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Create Pocket</h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-white bg-white/5 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Pocket Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Holiday Fund"
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white mt-1 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Target Goal (£) - Optional
            </label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Leave blank for no goal"
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white mt-1 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">
              Pocket Colour
            </label>
            <div className="flex gap-3">
              {availableColours.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColour(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${colour === c ? "border-white scale-110" : "border-transparent"}`}
                  style={{
                    backgroundColor:
                      c === "blue"
                        ? "#3b82f6"
                        : c === "emerald"
                          ? "#10b981"
                          : c === "rose"
                            ? "#f43f5e"
                            : c === "amber"
                              ? "#f59e0b"
                              : "#8b5cf6",
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors"
          >
            Save Pocket
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddPocketModal;
