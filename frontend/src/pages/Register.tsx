import {
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";

import api from "../lib/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();
  const siteCfg = useSiteConfig();
  const enabled = siteCfg.enable_register ?? false;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    function validate() {
      if (!username || username.length < 3)
        return "Username must be at least 3 characters";
      const emailRe = /^\S+@\S+\.\S+$/;
      if (!emailRe.test(email)) return "Invalid email address";

      if (!password || password.length < 8)
        return "Password must be at least 8 characters";

      return null;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const pwHash = await api.sha256Hex(password);
      await api.register(username, email, pwHash);
      // auto login
      await login(email, pwHash);
      nav("/");
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again later.");
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
              <h1 className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent dark:from-green-400 dark:to-teal-400">
                Create Account
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Join EasyBlog to start sharing your thoughts
              </p>
            </div>

            {!enabled ? (
              <div className="animate-fade-in mb-6 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Registration Disabled
                    </p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      Registration is currently disabled by the site
                      administrator. Please contact the site owner if you need
                      an account.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

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
                  htmlFor="username"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="transition-smooth block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pr-3 pl-10 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                    placeholder="Choose a username"
                    disabled={!enabled}
                  />
                  {username.length >= 3 && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

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
                    className="transition-smooth block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pr-3 pl-10 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                    placeholder="you@example.com"
                    disabled={!enabled}
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
                    className="transition-smooth block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pr-3 pl-10 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                    placeholder="••••••••"
                    disabled={!enabled}
                  />
                  {password.length >= 8 && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="transition-smooth flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-green-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!enabled || loading}
                >
                  {loading ? (
                    "Creating account..."
                  ) : (
                    <>
                      <span>Register</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?
                <Link
                  to="/login"
                  className="transition-smooth ml-1 font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
