"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

type Trade = {
  id: string;
  type: "buy" | "sell";
  asset: string;
  price: number;
  minAmount: number;
  maxAmount: number;
  merchant: {
    name: string;
  };
};

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/trades");

        console.log("Trades API response:", response.data);

        const tradesData = Array.isArray(response.data)
          ? response.data
          : response.data?.trades ||
            response.data?.data ||
            response.data?.results ||
            [];

        setTrades(tradesData);
      } catch (err: any) {
        console.error("Trades fetch error:", err);

        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not load trades. Please try again later.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available offers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">!</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <div className="text-gray-400 text-6xl mb-6">📭</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No active offers yet</h2>
          <p className="text-gray-600 mb-8">
            There are currently no buy or sell offers in the marketplace.
            <br />
            Check back later or create your own offer!
          </p>
          <Link
            href="/dashboard/create-trade"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Create Your First Offer →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">P2P Marketplace</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the best buy and sell offers for crypto and stablecoins
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trades.map((trade) => (
            <Link
              key={trade.id}
              href={`/trades/${trade.id}`}
              className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      trade.type === "buy"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {trade.type.toUpperCase()}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">{trade.asset}</span>
                </div>

                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="font-semibold">{trade.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Limits:</span>
                    <span>
                      {trade.minAmount} – {trade.maxAmount} {trade.asset}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Merchant:</span>
                    <span className="font-medium">{trade.merchant.name}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="text-center text-blue-600 font-medium hover:text-blue-800 transition">
                  View Offer →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}