import { type FC } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { type Transaction } from "../../types/finance";

interface TransactionDetailsModalProps {
  transaction: Transaction;
  onClose: () => void;
  isHerTheme?: boolean;
}

const TransactionDetailsModal: FC<TransactionDetailsModalProps> = ({ transaction, onClose, isHerTheme }) => {
  const isIncome = transaction.type === 'income';

  // --- DYNAMIC THEME CLASSES ---
  const modalBg = isHerTheme 
    ? "bg-[#F3D2F0] text-gray-900 border-white/50 shadow-2xl shadow-pink-900/10" 
    : "bg-gray-900 border-white/10";
  
  const closeBtn = isHerTheme 
    ? "text-rose-900/50 hover:text-rose-950 bg-white/30 hover:bg-white/60" 
    : "text-gray-400 hover:text-white bg-white/5";
  
  const labelText = isHerTheme ? "text-rose-900/70 font-semibold" : "text-gray-400";
  const valueText = isHerTheme ? "text-gray-900" : "text-white";
  const imageBox = isHerTheme ? "border-white/60 bg-white/40" : "border-white/10 bg-black/30";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div 
        initial={{ y: "100%", opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: "100%", opacity: 0 }}
        className={`relative z-10 w-full max-w-md border-t sm:border p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin transition-colors duration-500 ${modalBg}`}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className={`text-3xl font-bold ${isIncome ? 'text-emerald-500' : (isHerTheme ? 'text-rose-950' : 'text-white')}`}>
              {isIncome ? '+' : '-'}£{transaction.amount.toFixed(2)}
            </h2>
            <p className={`text-lg mt-1 font-semibold ${labelText}`}>{transaction.category}</p>
          </div>
          <button type="button" onClick={onClose} className={`p-1.5 rounded-full transition-colors ${closeBtn}`}>
            <X size={20}/>
          </button>
        </div>

        <div className="space-y-5 bg-black/5 p-4 rounded-2xl border border-black/5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className={`block text-xs uppercase tracking-wider mb-1 ${labelText}`}>Date</span>
              <span className={`font-medium ${valueText}`}>{transaction.date}</span>
            </div>
            <div>
              <span className={`block text-xs uppercase tracking-wider mb-1 ${labelText}`}>Added By</span>
              <span className={`font-medium ${valueText}`}>{transaction.addedBy || 'Unknown'}</span>
            </div>
          </div>

          {transaction.note && (
            <div>
              <span className={`block text-xs uppercase tracking-wider mb-1 ${labelText}`}>Note</span>
              <span className={`font-medium ${valueText}`}>{transaction.note}</span>
            </div>
          )}
        </div>

        {transaction.receiptUrl && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2 px-1">
               <span className={`text-xs uppercase tracking-wider font-semibold ${labelText}`}>Receipt</span>
               <a 
                 href={transaction.receiptUrl} 
                 target="_blank" 
                 rel="noreferrer" 
                 className={`text-xs font-semibold flex items-center gap-1 hover:underline ${isHerTheme ? 'text-pink-600' : 'text-blue-400'}`}
               >
                 Open full size <ExternalLink size={12}/>
               </a>
            </div>
            <div className={`w-full rounded-2xl border overflow-hidden p-2 backdrop-blur-sm ${imageBox}`}>
              <img 
                src={transaction.receiptUrl} 
                alt="Receipt" 
                className="w-full h-auto object-contain max-h-72 rounded-xl" 
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TransactionDetailsModal;