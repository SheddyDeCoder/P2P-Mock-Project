"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Basic client-side protection (PHASE 4)
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");  // ← adjust if your login route is different
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Using await api.get – exactly as roadmap requires
        const [profileResponse, tradesResponse] = await Promise.all([
          api.get("/user/profile"),
          api.get("/user/trades"),
        ]);

        setProfile(profileResponse.data);
        setTrades(tradesResponse.data || []);

        // Debug: see what the backend actually returns
        console.log("Profile data:", profileResponse.data);
        console.log("Trades data:", tradesResponse.data);

      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        const msg = err.response?.data?.message || "Failed to load dashboard data";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: "40px", color: "red", textAlign: "center" }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try again</button>
      </div>
    );
  }

  // Calculate stats (adjust status values based on what your backend actually returns)
  const activeTrades = trades.filter(t => 
    t.status?.toLowerCase() === "active" || 
    t.status?.toLowerCase() === "open" ||
    t.status?.toLowerCase() === "pending"
  ).length;

  const completedTrades = trades.filter(t => 
    t.status?.toLowerCase() === "completed" || 
    t.status?.toLowerCase() === "done" ||
    t.status?.toLowerCase() === "finished"
  ).length;

  return (
    <div style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "32px" }}>
        Dashboard {profile?.name ? `– Welcome, ${profile.name}` : ""}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        <div style={{ padding: "24px", background: "#f8f9fa", borderRadius: "12px", textAlign: "center" }}>
          <h3 style={{ marginBottom: "12px" }}>Active Trades</h3>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: "#198754" }}>
            {activeTrades}
          </div>
        </div>

        <div style={{ padding: "24px", background: "#f8f9fa", borderRadius: "12px", textAlign: "center" }}>
          <h3 style={{ marginBottom: "12px" }}>Completed Trades</h3>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: "#6c757d" }}>
            {completedTrades}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "32px" }}>
        <a
          href="/dashboard/create-trade"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "#0d6efd",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Create New Trade Offer
        </a>
      </div>
    </div>
  );
}