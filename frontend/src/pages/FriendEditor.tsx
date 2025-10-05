import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../lib/api";

export default function FriendEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const friends = await api.fetchFriends();
        const f = friends.find((x: any) => String(x.ID) === String(id));
        if (f) {
          setTitle(f.title || "");
          setLink(f.link || "");
          setDescription(f.description || "");
          setAvatar(f.avatar || "");
        }
      } catch {
        /* ignore */
      }
    })();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { title, link, description, avatar };
      if (id) {
        await api.updateFriend(id, payload);
      } else {
        await api.createFriend(payload);
      }
      nav("/friends");
    } catch (err) {
      alert(String(err));
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">{id ? "Edit" : "New"} Friend</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border p-2"
        />
        <input
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="Avatar"
          className="w-full border p-2"
        />
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="LINK"
          className="w-full border p-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border p-2"
        />
        <div>
          <button className="rounded bg-blue-600 px-3 py-1 text-white">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
