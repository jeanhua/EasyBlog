import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useSiteConfig } from "../context/SiteConfigContext";
import api from "../lib/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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
      if (!emailRe.test(email)) return "Invalid email";

      if (!password || password.length < 8)
        return "Password must be at least 8 characters";

      return null;
    }
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      const pwHash = await api.sha256Hex(password);
      await api.register(username, email, pwHash);
      // auto login
      await login(email, pwHash);
      nav("/");
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Register</h1>
      {enabled === false ? (
        <div className="mb-4 rounded border bg-yellow-100 p-4">
          Please note: registration is disabled by the site administrator.
          Please contact the site owner if you need an account.
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
        {error ? <div className="text-red-600">{error}</div> : null}
        <div>
          <button
            className="rounded bg-green-600 px-4 py-2 text-white"
            disabled={enabled === false}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
