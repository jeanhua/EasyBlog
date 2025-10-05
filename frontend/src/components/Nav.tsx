import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Nav() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  function onLogout() {
    logout();
    nav("/");
  }
  return (
    <header className="border-b bg-white/60 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold">
          EasyBlog
        </Link>
        <nav className="flex items-center">
          <Link to="/" className="mr-4 hover:underline">
            Home
          </Link>
          <Link to="/categories" className="mr-4 hover:underline">
            Categories
          </Link>
          <Link to="/tags" className="mr-4 hover:underline">
            Tags
          </Link>
          <Link to="/friends" className="mr-4 hover:underline">
            Friends
          </Link>
          {user ? (
            <>
              <Link to="/write" className="mr-4 hover:underline">
                Write
              </Link>
              <span className="mr-4">{user.username}</span>
              <button onClick={onLogout} className="hover:underline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4 hover:underline">
                Login
              </Link>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
