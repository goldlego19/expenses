import { type FC, useState } from "react";
import { motion } from "framer-motion";
import { X, Camera, Loader2 } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";

// --- CLOUDINARY CONFIGURATION ---
// TODO: Replace these with your actual Cloudinary details
const CLOUDINARY_CLOUD_NAME = "dqmwg8afw";
const CLOUDINARY_UPLOAD_PRESET = "expenses_receipts";

interface AddTransactionModalProps {
  onClose: () => void;
  isHerTheme?: boolean;
  userEmail: string; // CHANGED: Added prop
}

const AddTransactionModal: FC<AddTransactionModalProps> = ({ onClose, isHerTheme, userEmail }) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DYNAMIC THEME CLASSES ---
  const submitButtonClass = isHerTheme 
    ? "bg-gradient-to-br from-pink-300 to-amber-200 hover:from-pink-400 hover:to-amber-300 text-gray-900 shadow-[0_4px_15px_rgba(243,210,240,0.8)] font-bold"
    : "bg-blue-600 hover:bg-blue-500 text-white";

  const modalBg = isHerTheme ? "bg-[#F3D2F0] text-gray-900 border-white/50 shadow-2xl shadow-pink-900/10" : "bg-gray-900 border-white/10";
  const headingText = isHerTheme ? "text-rose-950" : "text-white";
  const closeBtn = isHerTheme ? "text-rose-900/50 hover:text-rose-950 bg-white/30 hover:bg-white/60" : "text-gray-400 hover:text-white bg-white/5";
  const labelText = isHerTheme ? "text-rose-900/70 font-semibold" : "text-gray-400";
  
  const inputClass = isHerTheme 
    ? "bg-white/40 border-white/60 text-gray-900 placeholder-rose-900/30 focus:border-pink-400 focus:bg-white/70 focus:ring-4 focus:ring-pink-400/10" 
    : "bg-black/50 border-white/10 text-white focus:border-blue-500";
  
  const tabWrapper = isHerTheme ? "bg-white/30" : "bg-white/5";
  const activeTabClass = isHerTheme ? "bg-white text-rose-950 shadow-sm" : "bg-white/10 text-white";
  const inactiveTabClass = isHerTheme ? "text-rose-900/60 hover:text-rose-950" : "text-gray-400 hover:text-white";

  const uploadBox = isHerTheme 
    ? "bg-white/30 border-white/60 hover:border-pink-400 hover:bg-white/50 text-rose-900/50 group-hover:text-rose-950" 
    : "bg-black/30 border-white/10 hover:border-blue-500/50 text-gray-400 group-hover:text-white";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); 
    }
  };

  const uploadToCloudinary = async (imageFile: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) throw new Error("Failed to upload image");
    const data = await response.json();
    return data.secure_url; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setIsSubmitting(true); 

    let uploadedUrl = undefined;
    
    // CHANGED: Determine who added it!
    const authorName = userEmail.toLowerCase() === "tigermeow26@gmail.com" ? "Sharona" : "Denzel";

    try {
      if (file) { uploadedUrl = await uploadToCloudinary(file); }
      
      const newTx = { 
        type, 
        amount: parseFloat(amount), 
        category, 
        date, 
        note, 
        receiptUrl: uploadedUrl || null,
        addedBy: authorName // CHANGED: Attach name to database document
      };
      
      await addDoc(collection(db, "transactions"), newTx);
      onClose(); 
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div onClick={!isSubmitting ? onClose : undefined} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div 
        initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        className={`relative z-10 w-full max-w-md border-t sm:border p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin transition-colors duration-500 ${modalBg}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${headingText}`}>Add Entry</h2>
          <button type="button" onClick={onClose} disabled={isSubmitting} className={`p-1 rounded-full transition-colors disabled:opacity-50 ${closeBtn}`}>
            <X size={20}/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`flex gap-2 p-1 rounded-xl transition-colors ${tabWrapper}`}>
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${type === 'expense' ? activeTabClass : inactiveTabClass}`}>
              Expense
            </button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${type === 'income' ? activeTabClass : inactiveTabClass}`}>
              Income
            </button>
          </div>
          
          <div>
            <label className={`text-xs uppercase tracking-wider font-semibold ${labelText}`}>Amount (€)</label>
            <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={`w-full rounded-xl p-3 mt-1 text-xl outline-none transition-colors ${inputClass}`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold ${labelText}`}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full rounded-xl p-3 mt-1 outline-none transition-colors ${inputClass}`}>
                <option>Groceries</option>
                <option>Rent/Bills</option>
                <option>Dining Out</option>
                <option>Transport</option>
                <option>Salary</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold ${labelText}`}>Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={`w-full rounded-xl p-3 mt-1 outline-none transition-colors ${inputClass}`} />
            </div>
          </div>

          <div>
            <label className={`text-xs uppercase tracking-wider font-semibold ${labelText}`}>Note (Optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Tesco run" className={`w-full rounded-xl p-3 mt-1 outline-none transition-colors ${inputClass}`} />
          </div>

          <div>
            <label className={`text-xs uppercase tracking-wider font-semibold mb-2 block ${labelText}`}>Receipt (Optional)</label>
            <div className={`relative w-full h-28 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center overflow-hidden group ${uploadBox}`}>
              {preview ? (
                <>
                  <img src={preview} alt="Receipt preview" className="w-full h-full object-cover opacity-80" />
                  {!isSubmitting && (
                    <button type="button" onClick={() => { setPreview(null); setFile(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:text-red-400 transition-colors">
                       <X size={16} />
                    </button>
                  )}
                </>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                  <Camera size={24} className="mb-2" />
                  <span className="text-xs font-medium">Tap to take photo</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} disabled={isSubmitting} />
                </label>
              )}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className={`w-full font-bold py-3 rounded-xl mt-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${submitButtonClass}`}>
            {isSubmitting ? ( <><Loader2 size={20} className="animate-spin" /><span>Uploading...</span></> ) : ( <span>Save Entry</span> )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddTransactionModal;