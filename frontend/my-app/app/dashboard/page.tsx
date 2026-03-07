"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";  // ← your current api.ts (no auto token)

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");  // or "/auth/login/login" if that's your path
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Manually add token to headers for protected calls
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [profileResponse, tradesResponse] = await Promise.all([
          api.get("/user/profile", config),
          api.get("/user/trades", config),
        ]);

        setProfile(profileResponse.data);
        setTrades(tradesResponse.data || []);

        console.log("Profile:", profileResponse.data);
        console.log("Trades:", tradesResponse.data);

      } catch (err: any) {
        console.error("Dashboard fetch failed:", err);
        let msg = "Failed to load dashboard data";

        if (err.response) {
          msg = err.response.data?.message 
             || `Error ${err.response.status}: ${err.response.statusText}`;
        } else if (err.request) {
          msg = "No response from server (backend down or wrong URL?)";
        } else {
          msg = err.message;
        }

        setError(msg);

        // If 401 → token invalid/expired → force re-login
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading dashboard...</div>;

  if (error) {
    return (
      <div style={{ padding: "40px", color: "red", textAlign: "center" }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const activeTrades = trades.filter(t => 
    ["active", "open", "pending"].includes(t.status?.toLowerCase?.() || "")
  ).length;

  const completedTrades = trades.filter(t => 
    ["completed", "done", "finished"].includes(t.status?.toLowerCase?.() || "")
  ).length;

  return (
    <div style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "32px" }}>
        Dashboard {profile?.name || profile?.username ? `– Welcome, ${profile.name || profile.username}` : ""}
      </h1>

      {/* ... rest of your UI (cards, create button) remains the same ... */}
    </div>
  );
}