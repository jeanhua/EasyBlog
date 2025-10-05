import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import api from "../lib/api";

export default function CategoryPage() {
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    setError(null);

    try {
      const categories = await api.fetchCategories();
      setCats(categories);
    } catch (err: any) {
      setError(err?.message || "Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
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
    <div className="min-h-[80vh] py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 mb-2">
            Browse Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore content by categories
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 animate-fade-in">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </p>
              <button
                onClick={loadCategories}
                className="ml-4 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-smooth"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-1" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cats.length === 0 ? (
              <div className="col-span-full text-center py-12 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Categories Found
                </h3>
                <p className="max-w-md mx-auto text-gray-500 dark:text-gray-400">
                  There are no categories available yet. Check back later or contact the site administrator.
                </p>
              </div>
            ) : (
              cats.map((c) => (
                <Link
                  key={c.id}
                  to={`/posts?category=${c.id}`}
                  className="block rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 hover:border-amber-500 dark:hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-smooth">
                        {c.name}
                      </h3>
                      <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-medium">
                        Category
                      </div>
                    </div>

                    {c.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {c.description}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-smooth">
                      <span>View posts</span>
                      <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
