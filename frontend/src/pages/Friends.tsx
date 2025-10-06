import {
  Users,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../lib/api";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );

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
    <div className="animate-fade-in min-h-[80vh]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Users className="text-blue-600 dark:text-blue-400" />
            <h1 className="from-blue-600 to-violet-600 bg-clip-text text-2xl font-bold">
              Friends
            </h1>
          </div>
          <Link
            to="/friends/new"
            className="transition-smooth inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            <Plus size={16} />
            <span>Add New Friend</span>
          </Link>
        </div>

        {error && (
          <div className="animate-fade-in mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
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
              <div key={i} className="animate-pulse rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Users
              size={48}
              className="mb-4 text-gray-400 dark:text-gray-600"
            />
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              No friend links yet
            </h3>
            <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
              Add your first friend link to connect with other bloggers
            </p>
            <Link
              to="/friends/new"
              className="transition-smooth inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
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
                className="group transition-smooth relative flex items-start gap-4 rounded-lg border bg-white p-4 shadow-sm hover:shadow-md dark:bg-gray-800"
              >
                {/* Avatar */}
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-700">
                  {f.avatar ? (
                    <img
                      src={f.avatar}
                      alt={f.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100" /><text fill="%239ca3af" font-family="Arial" font-size="40" x="50" y="65" text-anchor="middle">{f.title.charAt(0).toUpperCase()}</text></svg>';
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-gray-500 dark:text-gray-400">
                      {f.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <a
                      href={f.link}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-smooth flex items-center gap-1 truncate text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                    >
                      {f.title}
                      <ExternalLink size={14} className="flex-shrink-0" />
                    </a>
                  </div>
                  {f.description && (
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {f.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="ml-auto flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    to={`/friends/${f.ID}/edit`}
                    className="transition-smooth rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(f.ID)}
                    className="transition-smooth rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-red-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-red-400"
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
        <div className="bg-opacity-50 animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Confirm Deletion
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this friend link? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="transition-smooth rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => void onDelete(showDeleteConfirm)}
                disabled={loading}
                className="transition-smooth rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
