"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AxiosError } from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Fixed: capture the response
      const response = await api.post("/auth/register", form);

      console.log("Registration successful:", response.data);

      // Redirect to your nested login route
      router.push("/auth/login/login");
    } catch (err) {
      let displayError = "Registration failed. Please try again.";

      if (err instanceof AxiosError) {
        const axiosErr = err as AxiosError<any>;

        // Debug: show full response in console
        console.error("Registration failed - full response:", axiosErr.response);

        const data = axiosErr.response?.data;

        if (data) {
          // Try to extract the most useful message
          if (data.message) {
            displayError = data.message;
          } else if (data.error) {
            displayError = data.error;
          } else if (data.errors) {
            // Handle validation arrays (very common in Laravel / API backends)
            const firstErrorKey = Object.keys(data.errors)[0];
            const firstErrorMessage = data.errors[firstErrorKey]?.[0];
            if (firstErrorMessage) {
              displayError = `${firstErrorKey}: ${firstErrorMessage}`;
            } else {
              displayError = JSON.stringify(data.errors);
            }
          } else {
            displayError = JSON.stringify(data);
          }
        } else if (axiosErr.message) {
          displayError = axiosErr.message;
        }
      }

      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "80px auto", padding: "0 20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "32px" }}>Register</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "16px", textAlign: "center" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Full Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#aaa" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "24px" }}>
        Already have an account?{" "}
        <a href="/auth/login/login" style={{ color: "#0066cc" }}>
          Login
        </a>
      </p>
    </div>
  );
}