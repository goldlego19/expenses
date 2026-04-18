import { type FC, useState } from "react";
import { motion } from "framer-motion";
import { X, Camera, Loader2 } from "lucide-react";
import type { Transaction } from "../../types/finance";

// --- CLOUDINARY CONFIGURATION ---
// Replace these with your actual Cloudinary details
const CLOUDINARY_CLOUD_NAME = "dqmwg8afw";
const CLOUDINARY_UPLOAD_PRESET = "expenses_receipts";

interface AddTransactionModalProps {
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
}

const AddTransactionModal: FC<AddTransactionModalProps> = ({
  onClose,
  onAdd,
}) => {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url; // This is the permanent public link to your image
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);

    let uploadedUrl = undefined;

    try {
      // 1. Upload to Cloudinary if an image is attached
      if (file) {
        uploadedUrl = await uploadToCloudinary(file);
      }

      // 2. Create the transaction object (this saves to your Firebase database)
      const newTx: Transaction = {
        id: Date.now().toString(),
        type,
        amount: parseFloat(amount),
        category,
        date,
        note,
        receiptUrl: uploadedUrl,
      };

      onAdd(newTx);
      onClose();
    } catch (error) {
      console.error("Error uploading receipt:", error);
      alert("Failed to upload the receipt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        onClick={!isSubmitting ? onClose : undefined}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="relative z-10 w-full max-w-md bg-gray-900 border-t sm:border border-white/10 p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Add Entry</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white bg-white/5 p-1 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${type === "expense" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${type === "income" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Amount (£)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white mt-1 text-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white mt-1 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option>Groceries</option>
                <option>Rent/Bills</option>
                <option>Dining Out</option>
                <option>Transport</option>
                <option>Salary</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white mt-1 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Tesco run"
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white mt-1 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 block">
              Receipt (Optional)
            </label>
            <div className="relative w-full h-28 bg-black/50 border-2 border-dashed border-white/10 rounded-xl hover:border-blue-500/50 transition-colors flex items-center justify-center overflow-hidden group">
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="w-full h-full object-cover opacity-80"
                  />
                  {!isSubmitting && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setFile(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-full text-gray-400 transition-colors ${isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer group-hover:text-white"}`}
                >
                  <Camera size={24} className="mb-2" />
                  <span className="text-xs font-medium">Tap to take photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <span>Save Entry</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddTransactionModal;
