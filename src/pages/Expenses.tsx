import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Wallet,
  PiggyBank,
  Receipt,
  Calendar,
  ChevronRight,
  LogOut,
  LogIn,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { collection, onSnapshot, query } from "firebase/firestore";

import type { Transaction, Pocket } from "../types/finance";
import OverviewCard from "../components/finance/OverviewCard";
import PocketCard from "../components/finance/PocketCard";
import TransactionItem from "../components/finance/TransactionItem";
import AddTransactionModal from "../components/finance/AddTransactionModal";
import AddPocketModal from "../components/finance/AddPocketModal";

// --- SECURITY: ALLOWED USERS ONLY ---
const ALLOWED_EMAILS = ["gremblinu@gmail.com", "tigermeow26@gmail.com"];

export default function ExpensesApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pockets, setPockets] = useState<Pocket[]>([]);

  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddPocketModalOpen, setIsAddPocketModalOpen] = useState(false);

  const currentMonthString = new Date().toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const [selectedMonth, setSelectedMonth] =
    useState<string>(currentMonthString);

  // --- 1. AUTHENTICATION LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. FIRESTORE REAL-TIME LISTENERS ---
  useEffect(() => {
    // Check if user exists AND if their email is in the allowed list before fetching data
    if (!user || !user.email || !ALLOWED_EMAILS.includes(user.email)) return;

    const qTxs = query(collection(db, "transactions"));
    const unsubTxs = onSnapshot(qTxs, (snapshot) => {
      const txData: Transaction[] = [];
      snapshot.forEach((doc) =>
        txData.push({ id: doc.id, ...doc.data() } as Transaction),
      );
      setTransactions(txData);
    });

    const qPockets = query(collection(db, "pockets"));
    const unsubPockets = onSnapshot(qPockets, (snapshot) => {
      const pocketData: Pocket[] = [];
      snapshot.forEach((doc) =>
        pocketData.push({ id: doc.id, ...doc.data() } as Pocket),
      );
      setPockets(pocketData);
    });

    return () => {
      unsubTxs();
      unsubPockets();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

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

    if (!groups[currentMonthString]) groups[currentMonthString] = [];

    const sortedMonths = Object.keys(groups).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );
    return { groupedTransactions: groups, months: sortedMonths };
  }, [transactions, currentMonthString]);

  const currentMonthTxs = groupedTransactions[selectedMonth] || [];
  const monthIncome = currentMonthTxs
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const monthExpense = currentMonthTxs
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const monthBalance = monthIncome - monthExpense;

  // --- RENDER: LOADING STATE ---
  if (loadingAuth) {
    return (
      <div className="min-h-[100dvh] bg-gray-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-gray-400 font-medium tracking-wide">
          Verifying secure vault...
        </p>
      </div>
    );
  }

  // --- RENDER: LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="relative min-h-[100dvh] text-white font-sans bg-gray-950 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        <div className="relative z-10 w-full max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/50">
            <Wallet size={32} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Our Finances</h1>
          <p className="text-gray-400 text-sm mb-8">
            Sign in to access your shared financial dashboard.
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-white text-gray-900 hover:bg-gray-200 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
          >
            <LogIn size={20} />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: ACCESS DENIED SCREEN (Wrong Email) ---
  if (user.email && !ALLOWED_EMAILS.includes(user.email)) {
    return (
      <div className="relative min-h-[100dvh] text-white font-sans bg-gray-950 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-20 mix-blend-overlay grayscale"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        <div className="relative z-10 w-full max-w-sm bg-black/60 backdrop-blur-xl border border-red-500/30 p-8 rounded-3xl shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
            <ShieldAlert size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 text-sm mb-2">
            The account{" "}
            <span className="text-gray-200 font-semibold">{user.email}</span> is
            not authorized.
          </p>
          <p className="text-gray-500 text-xs mb-8">
            This is a private dashboard.
          </p>
          <button
            onClick={() => signOut(auth)}
            className="w-full bg-white/10 text-white hover:bg-red-500/20 hover:text-red-300 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors border border-white/5 hover:border-red-500/30"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN DASHBOARD ---
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

      <div className="relative z-10 w-full max-w-[95%] xl:max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 lg:pt-12 flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* --- SIDEBAR --- */}
        <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-12">
            <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg mb-6 hidden lg:block">
              Our Finances
            </h2>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">
              Timeline
            </h3>

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
            <button
              onClick={() => signOut(auth)}
              className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 p-2 rounded-full backdrop-blur-md border border-white/10 transition"
              title="Sign Out"
            >
              <LogOut size={24} />
            </button>
          </header>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <Calendar size={24} className="text-blue-400" />
              <h2>{selectedMonth} Overview</h2>
            </div>

            <button
              onClick={() => signOut(auth)}
              className="hidden lg:flex items-center gap-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 transition text-sm font-medium"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>

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

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PiggyBank size={20} className="text-pink-400" /> Savings Pockets
            </h2>
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

      <button
        onClick={() => setIsAddTxModalOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 bg-blue-500 hover:bg-blue-600 text-white p-4 lg:p-5 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-transform hover:scale-105"
      >
        <Plus size={28} className="lg:w-8 lg:h-8" />
      </button>

      <AnimatePresence>
        {isAddTxModalOpen && (
          <AddTransactionModal onClose={() => setIsAddTxModalOpen(false)} />
        )}
        {isAddPocketModalOpen && (
          <AddPocketModal onClose={() => setIsAddPocketModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
