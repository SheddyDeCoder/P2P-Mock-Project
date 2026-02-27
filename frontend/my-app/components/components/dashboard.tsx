"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Trade interface
interface Trade {
  id: string;
  tradeId?: string;
  buyer: string;
  seller: string;
  asset: string;
  amount: string;
  status: 'Pending' | 'Funded' | 'Completed' | 'Disputed' | 'Locked' | 'Released';
}

// Mock data (exactly as you had it)
const mockTrades: Trade[] = [
  {
    id: '1032',
    tradeId: '1032',
    buyer: '0x34525588E',
    seller: 'Maximilian',
    asset: 'BTC',
    amount: '5000 BTC',
    status: 'Pending',
  },
  {
    id: '1016',
    tradeId: '1016',
    buyer: '0x444A56GA',
    seller: 'Paschal',
    asset: 'USDT',
    amount: '900 USDT',
    status: 'Funded',
  },
  {
    id: '1007',
    tradeId: '1007',
    buyer: '0x4555566',
    seller: 'Shedrack',
    asset: 'ETH',
    amount: '7000 USDT',
    status: 'Completed',
  },
  {
    id: '1023',
    tradeId: '1023',
    buyer: '0x008566',
    seller: 'WizzyExachange',
    asset: 'BTC',
    amount: '10,000 USDT',
    status: 'Completed',
  },
  {
    id: '1045',
    tradeId: '1045',
    buyer: '0x0723492',
    seller: 'clintonbtc',
    asset: 'SELENA',
    amount: '900- BTC',
    status: 'Disputed',
  },
];

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading (replace with real axios fetch when ready)
    const timer = setTimeout(() => {
      setTrades(mockTrades);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
          </div>
          <p className="text-slate-300 text-lg animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 font-sans">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-300 hover:text-yellow-400 focus:outline-none transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-yellow-500 tracking-tight">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 flex items-center justify-center text-sm font-semibold text-yellow-300 border border-yellow-500/30">
                M
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-7 mb-10">
          {[
            { title: 'Total Trades', value: '32', color: 'yellow', progress: 65 },
            { title: 'Active Escrows', value: '5', color: 'green', progress: 20 },
            { title: 'Completed Trades', value: '20', color: 'blue', progress: 80 },
          ].map((stat) => (
            <div
              key={stat.title}
              className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <h3 className="text-sm text-slate-400 mb-2 font-medium tracking-wide">{stat.title}</h3>
              <p className={`text-4xl md:text-5xl font-extrabold text-${stat.color}-400 tracking-tight`}>{stat.value}</p>
              <div className="mt-4 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-500`}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Trades Section */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Trades</h2>
            <Button className="bg-yellow-600 hover:bg-yellow-500 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-yellow-500/30 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Trade
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-900/70">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Trade ID</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-700/30 transition-colors duration-200">
                    <td className="px-6 py-5 font-medium text-slate-200">#{trade.tradeId || trade.id}</td>
                    <td className="px-6 py-5 text-slate-300">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-yellow-500/20 text-yellow-400 text-xs">
                            {trade.buyer.charAt(2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {trade.buyer}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-300">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs">
                            {trade.seller.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {trade.seller}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-200">{trade.asset}</td>
                    <td className="px-6 py-5 text-slate-300">{trade.amount}</td>
                    <td className="px-6 py-5">
                      <span
                        className={`
                          inline-flex px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border
                          ${trade.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' : ''}
                          ${trade.status === 'Funded' ? 'bg-green-500/20 text-green-300 border-green-500/40' : ''}
                          ${trade.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : ''}
                          ${trade.status === 'Disputed' ? 'bg-red-500/20 text-red-300 border-red-500/40' : ''}
                        `}
                      >
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}