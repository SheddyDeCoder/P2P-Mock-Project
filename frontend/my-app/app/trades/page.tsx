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
  merchant: { name: string };
};

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/trades");
        setTrades(res.data ?? []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Could not load trades");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading trades...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (trades.length === 0) return <div className="p-8 text-center">No active offers right now.</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">P2P Marketplace</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trades.map((trade) => (
          <Link
            key={trade.id}
            href={`/trades/${trade.id}`}
            className="block border rounded-lg p-6 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  trade.type === "buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {trade.type.toUpperCase()}
              </span>
              <span className="text-xl font-bold">{trade.asset}</span>
            </div>

            <div className="space-y-1.5 text-sm">
              <p><strong>Price:</strong> {trade.price}</p>
              <p><strong>Limits:</strong> {trade.minAmount} – {trade.maxAmount} {trade.asset}</p>
              <p><strong>Merchant:</strong> {trade.merchant.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}