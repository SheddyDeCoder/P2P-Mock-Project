"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Add this if you want shadcn Badge instead of custom
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // For buyer/seller icons

// Trade type
type Trade = {
  id: string;
  buyer: string;
  seller: string;
  asset: string;
  amount: string;
  status: "pending" | "funded" | "completed";
};

// Custom StatusBadge (you can replace with <Badge> from shadcn if preferred)
function StatusBadge({ status }: { status: Trade["status"] }) {
  const styles = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    funded: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    completed: "bg-green-500/20 text-green-400 border-green-500/50",
  };

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border capitalize ${styles[status] || "bg-gray-500/20 text-gray-400 border-gray-500/50"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function Home() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise((r) => setTimeout(r, 1200));

        // Updated mock data closer to your screenshot
        setTrades([
          { id: "1032", buyer: "0x34525588E", seller: "Johnstario3", asset: "BTC", amount: "0.10 BTC", status: "pending" },
          { id: "1016", buyer: "0x444A56GA", seller: "CyprioTrader8", asset: "BTC", amount: "900 USDT", status: "funded" },
          { id: "1007", buyer: "0x4555566", seller: "johnDoe123", asset: "BTC", amount: "500 BTC", status: "completed" },
          { id: "1023", buyer: "0x008566", seller: "John123", asset: "BTC", amount: "900 USDT", status: "completed" },
          { id: "1045", buyer: "0x0723492", seller: "AliceCrypto", asset: "BTC", amount: "200 BTC", status: "pending" },
        ]);
      } catch {
        setError("Failed to load trades. Check your connection or backend.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalTrades = trades.length;
  const activeEscrows = trades.filter((t) => t.status !== "completed").length;
  const completedTrades = trades.filter((t) => t.status === "completed").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-xl text-gray-400 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Trade Dashboard</h1>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Create New Trade</Button>
            <Button variant="outline">Refresh</Button>
            <Button variant="secondary">Export CSV</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-sm text-gray-400 mb-2">Total Trades</h3>
            <p className="text-4xl font-bold text-yellow-400">{totalTrades}</p>
            <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 w-[65%] rounded-full" />
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-sm text-gray-400 mb-2">Active Escrows</h3>
            <p className="text-4xl font-bold text-green-400">{activeEscrows}</p>
            <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[20%] rounded-full" />
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-sm text-gray-400 mb-2">Completed Trades</h3>
            <p className="text-4xl font-bold text-blue-400">{completedTrades}</p>
            <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[80%] rounded-full" />
            </div>
          </div>
        </div>

        {/* Trades Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Trades</h2>
            <div className="flex gap-4">
              {/* Filter placeholder */}
              <Button variant="outline" size="sm">Filter by Status</Button>
              <Button className="bg-yellow-600 hover:bg-yellow-500">Create Trade</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Trade ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-800/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">#{trade.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-yellow-500/20 text-yellow-400">B</AvatarFallback>
                        </Avatar>
                        <span className="font-mono">{trade.buyer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-blue-500/20 text-blue-400">S</AvatarFallback>
                        </Avatar>
                        <span className="font-mono">{trade.seller}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{trade.asset}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{trade.amount}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={trade.status} />
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}