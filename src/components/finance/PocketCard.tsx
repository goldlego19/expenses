import { type FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiggyBank, Plus, X, Trash2 } from "lucide-react";
// CHANGED: Imported collection and addDoc to write to the transactions database
import { doc, updateDoc, deleteDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { type Pocket } from "../../types/finance";

interface PocketCardProps {
  pocket: Pocket;
  isHerTheme?: boolean;
}

const PocketCard: FC<PocketCardProps> = ({ pocket, isHerTheme }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addAmount, setAddAmount] = useState("");

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(addAmount);
    if (!addAmount || isNaN(amountNum)) return;

    try {
      // 1. Update the actual pocket balance
      const pocketRef = doc(db, "pockets", pocket.id);
      await updateDoc(pocketRef, {
        current: pocket.current + amountNum
      });

      // 2. Generate the Activity log entry
      const newTx = {
        // Positive amounts are expenses (money leaving wallet), negative amounts are income (money entering wallet)
        type: amountNum >= 0 ? 'expense' : 'income',
        amount: Math.abs(amountNum), 
        category: 'Savings Pocket',
        date: new Date().toISOString().split('T')[0],
        note: amountNum >= 0 ? `Deposited to ${pocket.name}` : `Withdrew from ${pocket.name}`,
        addedBy: isHerTheme ? "Sharona" : "Denzel",
        receiptUrl: null
      };

      // 3. Save it to the transactions database so it appears in the Activity list
      await addDoc(collection(db, "transactions"), newTx);

      setAddAmount("");
      setIsAdding(false); 
    } catch (error) {
      console.error("Error updating funds:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "pockets", pocket.id));
    } catch (error) {
      console.error("Error deleting pocket:", error);
      alert("Failed to delete pocket. Please try again.");
    }
  };

  const progress = pocket.target ? Math.min((pocket.current / pocket.target) * 100, 100) : 0;

  const colourMap = {
    blue: { bg: "bg-blue-500", text: "text-blue-500" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-500" },
    rose: { bg: "bg-rose-500", text: "text-rose-500" },
    amber: { bg: "bg-amber-500", text: "text-amber-500" },
    purple: { bg: "bg-purple-500", text: "text-purple-500" }
  };

  const pocketTheme = colourMap[pocket.colour] || colourMap.blue;
  
  // --- PASTEL GLASSMORPHISM FIXES ---
  const cardBg = isHerTheme ? "bg-white/60 border-white/80 text-rose-950 shadow-xl shadow-pink-900/5" : "bg-black/40 border-white/10 text-white";
  const textMuted = isHerTheme ? "text-rose-900/60" : "text-gray-400";
  
  const iconBg = isHerTheme ? "bg-white/90 shadow-sm" : "bg-black/10";
  const trackBg = isHerTheme ? "bg-white/60" : "bg-black/10";
  
  const actionBtn = isHerTheme ? "bg-white/80 hover:bg-white text-rose-900/50 hover:text-rose-950 shadow-sm" : "bg-white/10 hover:bg-white/20 text-white";
  const deleteBtn = isHerTheme ? "bg-white/80 hover:bg-red-100 text-rose-900/40 hover:text-red-500 shadow-sm" : "bg-white/10 hover:bg-red-500/20 text-gray-400 hover:text-red-400";

  const inputClass = isHerTheme 
    ? "bg-white/50 border-white/80 text-gray-900 placeholder-rose-900/40 focus:border-pink-400" 
    : "bg-black/50 border-white/10 text-white focus:border-blue-500";
  const overlayBg = isHerTheme ? "rgba(243,210,240,0.95)" : "rgba(17,24,39,0.95)";

  return (
    <div className={`flex-shrink-0 w-64 p-5 rounded-2xl border backdrop-blur-md snap-center relative overflow-hidden ${cardBg}`}>
      
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${iconBg}`}>
           <PiggyBank size={24} className={pocketTheme.text} />
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setIsDeleting(true)} className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${deleteBtn}`}>
            <Trash2 size={16} />
          </button>
          
          <button onClick={() => setIsAdding(!isAdding)} className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${actionBtn}`}>
            {isAdding ? <X size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-lg truncate">{pocket.name}</h3>
      
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold">£{pocket.current.toFixed(2)}</span>
        {pocket.target && <span className={`text-sm ${textMuted}`}>/ £{pocket.target.toFixed(2)}</span>}
      </div>

      {pocket.target && (
        <div className={`mt-4 w-full h-2 rounded-full overflow-hidden ${trackBg}`}>
          <div className={`h-full ${pocketTheme.bg} transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* --- ADD FUNDS OVERLAY --- */}
      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            onSubmit={handleAddFunds}
            className="absolute inset-0 z-10 p-5 backdrop-blur-xl flex flex-col justify-center rounded-2xl border border-white/20"
            style={{ backgroundColor: overlayBg }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className={`font-semibold ${isHerTheme ? 'text-rose-950' : 'text-white'}`}>Deposit Funds</span>
              <button type="button" onClick={() => setIsAdding(false)} className={isHerTheme ? 'text-rose-900/60 hover:text-rose-950' : 'text-gray-400 hover:text-white'}>
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2">
              <input 
                type="number" step="0.01" required placeholder="£0.00" autoFocus
                value={addAmount} onChange={e => setAddAmount(e.target.value)}
                className={`w-full rounded-xl p-2 outline-none border ${inputClass}`}
              />
              <button type="submit" className={`px-4 rounded-xl font-bold text-white transition-opacity hover:opacity-80 shadow-md ${pocketTheme.bg}`}>
                Add
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION OVERLAY --- */}
      <AnimatePresence>
        {isDeleting && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-20 p-5 backdrop-blur-xl flex flex-col justify-center items-center rounded-2xl border"
            style={{ backgroundColor: overlayBg, borderColor: isHerTheme ? 'rgba(244,63,94,0.3)' : 'rgba(239,68,68,0.3)' }}
          >
            <Trash2 size={32} className={`mb-2 ${isHerTheme ? 'text-red-400' : 'text-red-500'}`} />
            <p className={`text-sm text-center mb-4 font-semibold ${isHerTheme ? 'text-rose-950' : 'text-white'}`}>
              Delete this pocket?
            </p>
            <div className="flex gap-2 w-full">
              <button 
                type="button" onClick={() => setIsDeleting(false)} 
                className={`flex-1 py-2 rounded-xl transition-colors font-medium ${isHerTheme ? 'bg-white/40 text-rose-900 hover:bg-white/60' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
              >
                Cancel
              </button>
              <button type="button" onClick={handleDelete} className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-md shadow-red-500/20">
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PocketCard;