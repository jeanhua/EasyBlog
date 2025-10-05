import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../lib/api";
import type { Post } from "../types";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api
      .fetchPosts(0, 10)
      .then((r) => {
        setPosts(r.items);
        setTotal(r.total);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="mb-4 text-3xl font-bold">Latest Posts</h1>
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
      </div>
      <div className="text-muted mt-6 text-sm">Total posts: {total}</div>
    </div>
  );
}
