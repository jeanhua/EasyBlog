import {
  Menu,
  X,
  Home,
  Bookmark,
  Tag,
  Users,
  Edit,
  LogOut,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export default function Nav() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function onLogout() {
    logout();
    nav("/");
  }

  const menuItems = [
    { path: "/", label: "Home", icon: <Home size={18} /> },
    { path: "/categories", label: "Categories", icon: <Bookmark size={18} /> },
    { path: "/tags", label: "Tags", icon: <Tag size={18} /> },
    { path: "/friends", label: "Friends", icon: <Users size={18} /> },
  ];

  const userMenuItems = [
    { path: "/write", label: "Write", icon: <Edit size={18} /> },
  ];

  const authMenuItems = [
    { path: "/login", label: "Login", icon: <ArrowRight size={18} /> },
    { path: "/register", label: "Register", icon: <UserPlus size={18} /> },
  ];

  return (
    <header className="transition-smooth sticky top-0 z-50 border-b bg-white/80 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-primary group text-xl font-bold">
          <span className="bg-clip-text transition-all duration-300 group-hover:from-violet-600">
            EasyBlog
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-1 md:flex">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="transition-smooth flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}

          {user ? (
            <div className="ml-4 flex items-center gap-2">
              {userMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="transition-smooth flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="group relative">
                <button className="transition-smooth flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span>{user.username}</span>
                </button>
                <div className="transition-smooth absolute right-0 mt-1 hidden w-48 rounded-md bg-white py-1 shadow-lg group-hover:block dark:bg-gray-800">
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {authMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-smooth flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium ${
                    item.path === "/login"
                      ? "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="transition-smooth rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-gray-800"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="animate-fade-in bg-white shadow-lg md:hidden dark:bg-gray-900">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="transition-smooth block items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {user ? (
              <>
                {userMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="transition-smooth block flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-base font-medium text-white hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="mt-2 flex items-center gap-2 rounded-md border-t border-gray-200 px-3 py-2 text-base font-medium dark:border-gray-700">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span>{user.username}</span>
                </div>

                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="transition-smooth flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="space-y-1">
                {authMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`transition-smooth block flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium ${
                      item.path === "/login"
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
