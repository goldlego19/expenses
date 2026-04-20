import { type FC } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Paperclip } from "lucide-react";
import { type Transaction } from "../../types/finance";

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
}

const TransactionItem: FC<TransactionItemProps> = ({ transaction, index }) => {
  const isIncome = transaction.type === 'income';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-black/60 transition"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {isIncome ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-100">{transaction.category}</p>
            {transaction.receiptUrl && <Paperclip size={14} className="text-gray-400" />}
            
            {/* CHANGED: Name Tag Pill */}
            {transaction.addedBy && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                transaction.addedBy === 'Sharona' 
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/20' 
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
              }`}>
                {transaction.addedBy}
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-400 mt-0.5">{transaction.note} • {transaction.date}</p>
        </div>
      </div>
      <p className={`font-bold ${isIncome ? 'text-emerald-400' : 'text-white'}`}>
        {isIncome ? '+' : '-'}€{transaction.amount.toFixed(2)}
      </p>
    </motion.div>
  );
};

export default TransactionItem;