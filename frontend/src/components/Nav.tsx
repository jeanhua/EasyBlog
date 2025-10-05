import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Home, Bookmark, Tag, Users, Edit, LogOut, UserPlus, ArrowRight } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Nav() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function onLogout() {
    logout();
    nav("/");
  }

  const menuItems = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    { path: '/categories', label: 'Categories', icon: <Bookmark size={18} /> },
    { path: '/tags', label: 'Tags', icon: <Tag size={18} /> },
    { path: '/friends', label: 'Friends', icon: <Users size={18} /> },
  ];

  const userMenuItems = [
    { path: '/write', label: 'Write', icon: <Edit size={18} /> },
  ];

  const authMenuItems = [
    { path: '/login', label: 'Login', icon: <ArrowRight size={18} /> },
    { path: '/register', label: 'Register', icon: <UserPlus size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm shadow-sm transition-smooth">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link 
          to="/" 
          className="text-xl font-bold text-primary group"
        >
          <span className="bg-clip-text transition-all duration-300 group-hover:from-violet-600">
            EasyBlog
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="px-3 py-2 rounded-md text-sm font-medium transition-smooth hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5"
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
                  className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white transition-smooth hover:bg-blue-700 flex items-center gap-1.5"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-smooth hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                    ) : (
                      <span className="h-full w-full flex items-center justify-center text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span>{user.username}</span>
                </button>
                <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 py-1 hidden group-hover:block transition-smooth">
                  <button 
                    onClick={onLogout} 
                    className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth flex items-center gap-1.5 ${
                    item.path === '/login' 
                      ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
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
          className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth flex items-center gap-2"
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
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-smooth flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                <div className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium border-t border-gray-200 dark:border-gray-700 mt-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                    ) : (
                      <span className="h-full w-full flex items-center justify-center text-sm">
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
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth flex items-center gap-2"
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
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-smooth flex items-center gap-2 ${
                      item.path === '/login' 
                        ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
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
