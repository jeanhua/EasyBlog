import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Nav from "./components/Nav";
import { AuthProvider } from "./context/AuthContext";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import Category from "./pages/Category";
import Friends from "./pages/Friends";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Post from "./pages/Post";
import Register from "./pages/Register";
import Tag from "./pages/Tag";
import Write from "./pages/Write";
import FriendsEditor from "./pages/FriendEditor";
import EditPost from "./pages/EditPost";

function App() {
  return (
    <SiteConfigProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            <Nav />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/write" element={<Write />} />
                <Route path="/categories" element={<Category />} />
                <Route path="/tags" element={<Tag />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/friends/new" element={<FriendsEditor />} />
                <Route path="/friends/:id/edit" element={<FriendsEditor />} />
                <Route path="/posts/:id" element={<Post />} />
                <Route path="/posts/:id/edit" element={<EditPost />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </SiteConfigProvider>
  );
}

export default App;
