import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import api from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Simple validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const pwHash = await api.sha256Hex(password);
      await login(email, pwHash);
      nav("/");
    } catch (err: any) {
      setError(
        err?.message || "Login failed. Please check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
          <div className="p-6 sm:p-8">
            <div className="mb-8 text-center">
              <h1 className="bg-clip-text text-3xl font-bold">Welcome Back</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Log in to continue to EasyBlog
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="animate-fade-in rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="transition-smooth block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pr-3 pl-10 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="transition-smooth block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pr-3 pl-10 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="transition-smooth flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    "Logging in..."
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?
                <Link
                  to="/register"
                  className="transition-smooth ml-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
