export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note: string;
  receiptUrl?: string;
  addedBy?: string; // Add this line!
}

export interface Pocket {
  id: string;
  name: string;
  target?: number | null;
  current: number;
  colour: 'blue' | 'emerald' | 'rose' | 'amber' | 'purple'; 
}