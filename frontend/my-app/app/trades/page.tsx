"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";  // your current api.ts (localhost only)
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

        console.log("Trades full response:", {
          status: response.status,
          data: response.data,
          headers: response.headers,
        });

        const tradesData = Array.isArray(response.data)
          ? response.data
          : response.data?.trades ||
            response.data?.data ||
            response.data?.results ||
            response.data?.offers ||  // added common variants
            [];

        setTrades(tradesData);
      } catch (err: any) {
        console.error("Trades fetch failed full details:", {
          message: err.message,
          response: err.response ? {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data,
          } : null,
          request: err.request ? "Request sent but no response" : null,
        });

        let errorMessage = "Could not load trades. Please try again later.";

        if (err.response) {
          const { status, data } = err.response;
          if (status === 401) errorMessage = "Please login to view offers";
          else if (status === 403) errorMessage = "You don't have permission to view trades";
          else if (status === 404) errorMessage = "Trades endpoint not found on server";
          else if (status >= 500) errorMessage = "Server error – please contact support";
          else if (data?.message) errorMessage = data.message;
          else if (data?.error) errorMessage = data.error;
        } else if (err.request) {
          errorMessage = "Cannot reach backend server (is it running at http://localhost:5000?)";
        } else {
          errorMessage = err.message || errorMessage;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);


}