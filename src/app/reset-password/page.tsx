"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Something went wrong.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-rose-400">Invalid or expired reset link.</p>
          <Link href="/forgot-password" className="mt-4 block text-sm font-medium text-rose-400 hover:text-rose-300">
            Request a new reset link →
          </Link>
        </div>
      </main>
    );
  }

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
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">Set a new password</h1>
            <p className="mt-1.5 text-sm text-slate-500">Choose a strong password with at least 6 characters.</p>

            {done ? (
              <div className="mt-7 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">Password updated!</p>
                    <p className="mt-0.5 text-xs text-emerald-500/80">Redirecting you to login...</p>
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
                  <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">New password</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="input-dark" placeholder="New password" autoComplete="new-password" required />
                </div>

                <div>
                  <label htmlFor="confirm" className="mb-1.5 block text-xs font-medium text-slate-400">Confirm password</label>
                  <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className="input-dark" placeholder="Confirm new password" autoComplete="new-password" required />
                </div>

                <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-3">
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating...
                    </>
                  ) : (
                    "Update password"
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