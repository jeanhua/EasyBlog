import { BookOpen, AlertCircle, ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
    <div className="animate-fade-in min-h-[80vh] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-3xl font-bold text-transparent dark:from-amber-400 dark:to-orange-400">
            Browse Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore content by categories
          </p>
        </div>

        {error && (
          <div className="animate-fade-in mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex items-center justify-center">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </p>
              <button
                onClick={loadCategories}
                className="transition-smooth ml-4 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="animate-fade-in grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mb-1 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {cats.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                  No Categories Found
                </h3>
                <p className="mx-auto max-w-md text-gray-500 dark:text-gray-400">
                  There are no categories available yet. Check back later or
                  contact the site administrator.
                </p>
              </div>
            ) : (
              cats.map((c) => (
                <Link
                  key={c.id}
                  to={`/posts?category=${c.id}`}
                  className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-amber-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-amber-500/50"
                >
                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="transition-smooth text-xl font-semibold text-gray-900 group-hover:text-amber-600 dark:text-gray-100 dark:group-hover:text-amber-400">
                        {c.name}
                      </h3>
                      <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        Category
                      </div>
                    </div>

                    {c.description && (
                      <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-400">
                        {c.description}
                      </p>
                    )}

                    <div className="transition-smooth flex items-center text-sm text-gray-500 group-hover:text-amber-600 dark:text-gray-500 dark:group-hover:text-amber-400">
                      <span>View posts</span>
                      <ArrowRight
                        size={16}
                        className="ml-1 transform transition-transform group-hover:translate-x-1"
                      />
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
