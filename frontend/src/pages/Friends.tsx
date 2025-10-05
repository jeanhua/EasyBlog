import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../lib/api";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const load = () => {
    api
      .fetchFriends()
      .then((f: any) => setFriends(f))
      .catch(() => {});
  };
  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: number) {
    if (!confirm("Delete this friend link?")) return;
    try {
      await api.deleteFriend(id);
      load();
    } catch (err) {
      alert(String(err));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="mb-4 text-2xl font-bold">Friends</h1>
        <Link to="/friends/new" className="rounded border px-3 py-1">
          New Friend
        </Link>
      </div>
      <div className="grid gap-2">
        {friends.map((f) => (
          <div
            key={f.ID}
            className="flex items-start justify-between gap-4 rounded border p-4"
          >
            <div>
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="text-lg font-semibold"
              >
                {f.title}
              </a>
              <div className="muted text-sm">{f.description}</div>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/friends/${f.ID}/edit`}
                className="rounded border px-3 py-1"
              >
                Edit
              </Link>
              <button
                onClick={() => void onDelete(f.ID)}
                className="rounded bg-red-600 px-3 py-1 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
