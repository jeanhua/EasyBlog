import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../lib/api";

export default function TagPage() {
  const [tags, setTags] = useState<any[]>([]);
  useEffect(() => {
    api
      .fetchTags()
      .then((t: any) => setTags(t))
      .catch(() => {});
  }, []);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Tags</h1>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link
            key={t.id}
            to={`/posts?tag=${t.id}`}
            className="rounded border px-3 py-1"
          >
            {t.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
