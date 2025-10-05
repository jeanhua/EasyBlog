import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../lib/api";

export default function CategoryPage() {
  const [cats, setCats] = useState<any[]>([]);
  useEffect(() => {
    api
      .fetchCategories()
      .then((c: any) => setCats(c))
      .catch(() => {});
  }, []);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Categories</h1>
      <div className="grid gap-2">
        {cats.map((c) => (
          <Link
            key={c.id}
            to={`/posts?category=${c.id}`}
            className="rounded border p-2 hover:bg-slate-50"
          >
            <div className="font-semibold">{c.name}</div>
            <div className="muted text-sm">{c.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
