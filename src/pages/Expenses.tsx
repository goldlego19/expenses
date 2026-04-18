import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Wallet,
  PiggyBank,
  Receipt,
  Calendar,
  ChevronRight,
} from "lucide-react";

import type { Transaction, Pocket } from "../types/finance";
import OverviewCard from "../components/finance/OverviewCard";
import PocketCard from "../components/finance/PocketCard";
import TransactionItem from "../components/finance/TransactionItem";
import AddTransactionModal from "../components/finance/AddTransactionModal";
import AddPocketModal from "../components/finance/AddPocketModal";

// --- MOCK DATA ---
const initialTransactions: Transaction[] = [
  {
    id: "6",
    type: "income",
    amount: 2000,
    category: "Salary",
    date: "2026-05-15",
    note: "May Pay",
  },
  {
    id: "1",
    type: "expense",
    amount: 45.5,
    category: "Groceries",
    date: "2026-04-18",
    note: "Tesco run",
  },
  {
    id: "2",
    type: "income",
    amount: 2000,
    category: "Salary",
    date: "2026-04-15",
    note: "April Pay",
  },
  {
    id: "3",
    type: "expense",
    amount: 120,
    category: "Dining",
    date: "2026-04-12",
    note: "Date night",
  },
  {
    id: "4",
    type: "expense",
    amount: 30.0,
    category: "Transport",
    date: "2026-04-10",
    note: "Petrol",
  },
  {
    id: "5",
    type: "expense",
    amount: 65.0,
    category: "Utilities",
    date: "2026-03-28",
    note: "Internet bill",
  },
  {
    id: "7",
    type: "expense",
    amount: 15.0,
    category: "Entertainment",
    date: "2026-03-14",
    note: "Cinema",
  },
];

const initialPockets: Pocket[] = [
  {
    id: "p1",
    name: "Holiday Fund",
    target: 1500,
    current: 850,
    colour: "blue",
  },
  { id: "p2", name: "Rainy Day", current: 2100, colour: "emerald" },
];

export default function ExpensesApp() {
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddPocketModalOpen, setIsAddPocketModalOpen] = useState(false);

  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [pockets, setPockets] = useState<Pocket[]>(initialPockets);

  const currentMonthString = new Date().toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const [selectedMonth, setSelectedMonth] =
    useState<string>(currentMonthString);

  // --- GROUPING & FILTERING LOGIC ---
  const { groupedTransactions, months } = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const groups = sorted.reduce(
      (acc, tx) => {
        const monthYear = new Date(tx.date).toLocaleString("en-GB", {
          month: "long",
          year: "numeric",
        });
        if (!acc[monthYear]) acc[monthYear] = [];
        acc[monthYear].push(tx);
        return acc;
      },
      {} as Record<string, Transaction[]>,
    );

    if (!groups[currentMonthString]) {
      groups[currentMonthString] = [];
    }

    const sortedMonths = Object.keys(groups).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return { groupedTransactions: groups, months: sortedMonths };
  }, [transactions, currentMonthString]);

  // --- CALCULATE TOTALS ---
  const currentMonthTxs = groupedTransactions[selectedMonth] || [];
  const monthIncome = currentMonthTxs
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const monthExpense = currentMonthTxs
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const monthBalance = monthIncome - monthExpense;

  const handleAddPocket = (newPocket: Pocket) => {
    setPockets([...pockets, newPocket]);
  };

  return (
    <div className="relative min-h-[100dvh] text-white font-sans bg-gray-950 overflow-y-auto pb-24">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')",
        }}
      />

      {/* CHANGED: Max-width is now dynamic up to 1400px, improved padding for mobile */}
      <div className="relative z-10 w-full max-w-[95%] xl:max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 lg:pt-12 flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* CHANGED: Sidebar wider on desktop */}
        <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-12">
            <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg mb-6 hidden lg:block">
              Our Finances
            </h2>

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">
              Timeline
            </h3>

            {/* CHANGED: Added classes to hide scrollbars on mobile while keeping it scrollable */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {months.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`flex-shrink-0 snap-start flex items-center justify-between px-4 py-3 rounded-2xl transition-all border ${
                    selectedMonth === month
                      ? "bg-blue-500/20 border-blue-500/50 text-white"
                      : "bg-black/20 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                  }`}
                >
                  <span className="font-medium whitespace-nowrap">{month}</span>
                  {selectedMonth === month && (
                    <ChevronRight
                      size={16}
                      className="hidden lg:block text-blue-400"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 min-w-0">
          <header className="flex justify-between items-center mb-6 lg:hidden">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-lg">
                Our Finances
              </h1>
            </div>
            <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md border border-white/10 transition">
              <Wallet size={24} className="text-blue-400" />
            </button>
          </header>

          <div className="flex items-center gap-2 mb-6 text-xl font-semibold">
            <Calendar size={24} className="text-blue-400" />
            <h2>{selectedMonth} Overview</h2>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 lg:mb-10">
            <OverviewCard
              title="Net Balance"
              amount={monthBalance}
              type="neutral"
            />
            <OverviewCard title="Income" amount={monthIncome} type="income" />
            <OverviewCard
              title="Expenses"
              amount={monthExpense}
              type="expense"
            />
          </div>

          {/* Pockets Section */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PiggyBank size={20} className="text-pink-400" /> Savings Pockets
            </h2>
            {/* CHANGED: Hidden scrollbar for cleaner mobile look */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {pockets.map((pocket) => (
                <PocketCard key={pocket.id} pocket={pocket} />
              ))}
              <button
                onClick={() => setIsAddPocketModalOpen(true)}
                className="flex-shrink-0 w-40 h-32 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition snap-center cursor-pointer"
              >
                <Plus size={24} className="mb-2" />
                <span className="text-sm font-medium">New Pocket</span>
              </button>
            </div>
          </section>

          {/* Transactions List */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Receipt size={20} className="text-amber-400" /> Activity
            </h2>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {currentMonthTxs.length > 0 ? (
                  currentMonthTxs.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <TransactionItem transaction={tx} index={i} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10 bg-black/20 backdrop-blur-md rounded-3xl border border-white/5"
                  >
                    <p className="text-gray-400">
                      No transactions recorded for {selectedMonth}.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>
      </div>

      {/* CHANGED: Shifted FAB positioning specifically for mobile vs desktop */}
      <button
        onClick={() => setIsAddTxModalOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 bg-blue-500 hover:bg-blue-600 text-white p-4 lg:p-5 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-transform hover:scale-105"
      >
        <Plus size={28} className="lg:w-8 lg:h-8" />
      </button>

      {/* Modals */}
      <AnimatePresence>
        {isAddTxModalOpen && (
          <AddTransactionModal
            onClose={() => setIsAddTxModalOpen(false)}
            onAdd={(newTx) => setTransactions([newTx, ...transactions])} // Adds the new transaction to the top of the state
          />
        )}
        {isAddPocketModalOpen && (
          <AddPocketModal
            onClose={() => setIsAddPocketModalOpen(false)}
            onAdd={handleAddPocket}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
