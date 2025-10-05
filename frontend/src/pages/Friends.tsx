import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Edit, Trash2, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";

import api from "../lib/api";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .fetchFriends()
      .then((f: any) => setFriends(f))
      .catch(() => {
        setError("Failed to load friend links");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: number) {
    setLoading(true);
    try {
      await api.deleteFriend(id);
      load();
    } catch (err) {
      console.error("Error deleting friend:", err);
      setError("Failed to delete friend link");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  }

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-[80vh] animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-2">
            <Users className="text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold bg-clip-text from-blue-600 to-violet-600">
              Friends
            </h1>
          </div>
          <Link 
            to="/friends/new" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-transparent text-sm font-medium shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-smooth"
          >
            <Plus size={16} />
            <span>Add New Friend</span>
          </Link>
        </div>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4 animate-fade-in">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="ml-3 text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </p>
              <button 
                onClick={load} 
                className="ml-auto flex-shrink-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
            <Users size={48} className="mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              No friend links yet
            </h3>
            <p className="max-w-md text-gray-600 dark:text-gray-400 mb-6">
              Add your first friend link to connect with other bloggers
            </p>
            <Link 
              to="/friends/new" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-transparent text-sm font-medium shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-smooth"
            >
              <Plus size={16} />
              <span>Create First Friend Link</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {friends.map((f) => (
              <div
                key={f.ID}
                className="group relative flex items-start gap-4 rounded-lg border bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-smooth"
              >
                {/* Avatar */}
                <div className="h-12 w-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
                  {f.avatar ? (
                    <img 
                      src={f.avatar} 
                      alt={f.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100" /><text fill="%239ca3af" font-family="Arial" font-size="40" x="50" y="65" text-anchor="middle">{f.title.charAt(0).toUpperCase()}</text></svg>';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg font-semibold">
                      {f.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={f.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-smooth flex items-center gap-1 truncate"
                    >
                      {f.title}
                      <ExternalLink size={14} className="flex-shrink-0" />
                    </a>
                  </div>
                  {f.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {f.description}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/friends/${f.ID}/edit`}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(f.ID)}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this friend link? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-smooth"
              >
                Cancel
              </button>
              <button
                onClick={() => void onDelete(showDeleteConfirm)}
                disabled={loading}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
