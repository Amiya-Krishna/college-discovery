"use client";

import axios from "axios";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      <section className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0f1629]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

          <div className="p-8">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/20">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">Reset your password</h1>
            <p className="mt-1.5 text-sm text-slate-500">We&apos;ll send you a reset link to your email.</p>

            {sent ? (
              <div className="mt-7 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">Email sent!</p>
                    <p className="mt-0.5 text-xs text-emerald-500/80">
                      Check your inbox at <strong>{email}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">Email address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-3">
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-slate-500">
              <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                ← Back to login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}