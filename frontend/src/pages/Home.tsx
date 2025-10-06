import { Calendar, User, Eye, ArrowUpRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../lib/api";
import type { Post } from "../types";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .fetchPosts(0, 10)
      .then((r) => {
        setPosts(r.items);
        setTotal(r.total);
      })
      .catch((e) => console.error(e))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // const formatDate = (dateString?: string) => {
  //   if (!dateString) return "";
  //   const options: Intl.DateTimeFormatOptions = {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   };
  //   return new Date(dateString).toLocaleDateString(undefined, options);
  // };

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="bg-clip-text text-3xl font-bold md:text-4xl">
              Latest Posts
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Discover and read the newest content from our community
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-6">
        {posts.map((p) => (
          <article
            key={p.ID}
            className="group flex items-start gap-4 rounded-lg border bg-white/60 p-4 shadow-sm hover:shadow-md dark:bg-slate-800"
          >
            <div className="flex-1">
              <Link
                to={`/posts/${p.ID}`}
                className="text-xl font-semibold hover:underline"
              >
                {p.title}
              </Link>
              {p.summary ? (
                <p className="text-muted mt-2 text-sm">{p.summary}</p>
              ) : null}
              <div className="text-muted mt-3 flex items-center gap-3 text-xs">
                <div>By {p.author?.username || "unknown"}</div>
                <div>·</div>
                <div>{p.created_at?.slice(0, 10)}</div>
                <div className="ml-2 flex gap-1">
                  {(p.categories || []).map((c) => (
                    <span
                      key={(c as any).id}
                      className="rounded border px-2 py-0.5 text-xs"
                    >
                      {(c as any).name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
        {!posts.length && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-gray-400 dark:text-gray-600">
              <ArrowUpRight size={48} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              No posts found
            </h3>
            <p className="max-w-md text-gray-600 dark:text-gray-400">
              There are no posts available at the moment. Check back later.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Total posts: {total}
      </div>
    </div>
  );
}
