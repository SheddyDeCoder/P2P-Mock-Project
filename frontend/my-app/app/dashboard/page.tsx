"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login/login");
      return;
    }

    const loadData = async () => {
      try {
        const [profileRes, tradesRes] = await Promise.all([
          api.get("/user/profile"),
          api.get("/user/trades"),
        ]);

        console.log("Trades response:", tradesRes.data); // ← debug

        const trades = Array.isArray(tradesRes.data)
          ? tradesRes.data
          : tradesRes.data?.trades || [];

        const active = trades.filter((t: any) => 
          t.status?.toLowerCase().includes("active") || 
          t.status?.toLowerCase().includes("open")
        ).length;

        const completed = trades.filter((t: any) => 
          t.status?.toLowerCase().includes("completed") || 
          t.status?.toLowerCase().includes("done")
        ).length;

        setActiveCount(active);
        setCompletedCount(completed);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;

  if (error) return <div style={{ padding: "40px", color: "red", textAlign: "center" }}>{error}</div>;

  return (
    <div style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "40px" }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
        <div style={{ padding: "24px", background: "#f8f9fa", borderRadius: "8px", textAlign: "center" }}>
          <h3>Active Trades</h3>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: "#198754" }}>
            {activeCount}
          </div>
        </div>

        <div style={{ padding: "24px", background: "#f8f9fa", borderRadius: "8px", textAlign: "center" }}>
          <h3>Completed Trades</h3>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: "#6c757d" }}>
            {completedCount}
          </div>
        </div>
      </div>

      <a
        href="/dashboard/create-trade"
        style={{
          display: "inline-block",
          padding: "12px 28px",
          background: "#0d6efd",
          color: "white",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Create New Trade
      </a>
    </div>
  );
}