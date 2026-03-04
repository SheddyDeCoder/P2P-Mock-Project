"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface UserProfile {
  name: string;
  // add other fields as needed
}

interface UserTrade {
  id: string;
  type: "buy" | "sell";
  asset: string;
  status: "active" | "completed" | "cancelled" | string;
  // add price, amount, etc. if you want richer display
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trades, setTrades] = useState<UserTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, tradesRes] = await Promise.all([
          api.get("/user/profile"),
          api.get("/user/trades"),
        ]);

        setProfile(profileRes.data);
        setTrades(tradesRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeTrades = trades.filter(t => t.status === "active");
  const completedTrades = trades.filter(t => t.status === "completed");

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Welcome back{profile?.name ? `, ${profile.name}` : ""}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Active Trades</h2>
          <div className="text-4xl font-bold text-green-600">{activeTrades.length}</div>
          {activeTrades.length > 0 && (
            <Link href="/dashboard/trades" className="text-blue-600 hover:underline mt-2 inline-block">
              View all active trades →
            </Link>
          )}
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Completed Trades</h2>
          <div className="text-4xl font-bold text-gray-600">{completedTrades.length}</div>
        </div>
      </div>

      {/* You can later add recent trades table, quick actions, etc. */}
      <div className="mt-8">
        <Link 
          href="/dashboard/create-trade"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg inline-block"
        >
          Create New Trade Offer
        </Link>
      </div>
    </div>
  );
}