import { type FC, useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";

interface AddPocketModalProps {
  onClose: () => void;
  isHerTheme?: boolean;
}

const availableColours = ['blue', 'emerald', 'rose', 'amber', 'purple'] as const;
type ColourType = typeof availableColours[number];

const AddPocketModal: FC<AddPocketModalProps> = ({ onClose, isHerTheme }) => {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [colour, setColour] = useState<ColourType>('blue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DYNAMIC THEME CLASSES (Matching the Transaction Modal) ---
  const submitButtonClass = isHerTheme 
    ? "bg-gradient-to-br from-pink-300 to-amber-200 hover:from-pink-400 hover:to-amber-300 text-gray-900 shadow-[0_4px_15px_rgba(243,210,240,0.8)] font-bold"
    : "bg-blue-600 hover:bg-blue-500 text-white";

  const modalBg = isHerTheme 
    ? "bg-[#F3D2F0] text-gray-900 border-white/50 shadow-2xl shadow-pink-900/10" 
    : "bg-gray-900 border-white/10";

  const headingText = isHerTheme ? "text-rose-950" : "text-white";
  
  const closeBtn = isHerTheme 
    ? "text-rose-900/50 hover:text-rose-950 bg-white/30 hover:bg-white/60" 
    : "text-gray-400 hover:text-white bg-white/5";
  
  const labelText = isHerTheme ? "text-rose-900/70 font-semibold" : "text-gray-400";
  
  const inputClass = isHerTheme 
    ? "bg-white/40 border-white/60 text-gray-900 placeholder-rose-900/30 focus:border-pink-400 focus:bg-white/70 focus:ring-4 focus:ring-pink-400/10" 
    : "bg-black/50 border-white/10 text-white focus:border-blue-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newPocket = { name, current: 0, colour, target: target ? parseFloat(target) : null };
      await addDoc(collection(db, "pockets"), newPocket);
      onClose(); 
    } catch (error) {
      console.error("Error creating pocket:", error);
      alert("Failed to create pocket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div onClick={!isSubmitting ? onClose : undefined} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div 
        initial={{ y: "100%", opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: "100%", opacity: 0 }}
        className={`relative z-10 w-full max-w-md border-t sm:border p-6 rounded-t-3xl sm:rounded-3xl transition-colors duration-500 ${modalBg}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${headingText}`}>Create Pocket</h2>
          <button type="button" onClick={onClose} disabled={isSubmitting} className={`p-1 rounded-full transition-colors disabled:opacity-50 ${closeBtn}`}>
            <X size={20}/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`text-xs uppercase tracking-wider ${labelText}`}>Pocket Name</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Holiday Fund" disabled={isSubmitting}
              className={`w-full rounded-xl p-3 mt-1 outline-none transition-all disabled:opacity-50 ${inputClass}`} 
            />
          </div>

          <div>
            <label className={`text-xs uppercase tracking-wider ${labelText}`}>Target Goal (€) - Optional</label>
            <input 
              type="number" step="0.01" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Leave blank for no goal" disabled={isSubmitting}
              className={`w-full rounded-xl p-3 mt-1 outline-none transition-all disabled:opacity-50 ${inputClass}`} 
            />
          </div>

          <div>
            <label className={`text-xs uppercase tracking-wider mb-2 block ${labelText}`}>Pocket Colour</label>
            <div className="flex gap-3">
              {availableColours.map(c => (
                <button
                  key={c} type="button" disabled={isSubmitting} onClick={() => setColour(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all disabled:cursor-not-allowed ${
                    colour === c 
                      ? (isHerTheme ? 'border-rose-950 scale-110 shadow-md' : 'border-white scale-110') 
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c === 'blue' ? '#3b82f6' : c === 'emerald' ? '#10b981' : c === 'rose' ? '#f43f5e' : c === 'amber' ? '#f59e0b' : '#8b5cf6' }}
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded-xl mt-4 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${submitButtonClass}`}>
            {isSubmitting ? ( <><Loader2 size={20} className="animate-spin" /><span>Saving...</span></> ) : ( <span>Save Pocket</span> )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddPocketModal;