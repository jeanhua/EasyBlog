import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../lib/api";

export default function Write() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [categories, setCategories] = useState<number[]>([]);
  const [tags, setTags] = useState<number[]>([]);
  const [allCats, setAllCats] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    api
      .fetchCategories()
      .then((c: any) => setAllCats(c))
      .catch(() => {});
    api
      .fetchTags()
      .then((t: any) => setAllTags(t))
      .catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        title,
        content,
        summary,
        category_ids: categories,
        tag_ids: tags,
      };
      await api.createPost(payload);
      nav("/");
    } catch (err) {
      alert(String(err));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">Write Post</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border p-2"
        />
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summary"
          className="w-full border p-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content (markdown)"
          className="h-48 w-full border p-2"
        />
        <div className="flex gap-4">
          <div>
            <div className="text-sm font-semibold">Categories</div>
            <div className="space-y-1">
              {allCats.map((c) => (
                <label key={c.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={c.id}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setCategories((s) =>
                        e.target.checked
                          ? [...s, id]
                          : s.filter((x) => x !== id),
                      );
                    }}
                  />
                  <span className="ml-2">{c.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold">Tags</div>
            <div className="space-y-1">
              {allTags.map((t) => (
                <label key={t.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={t.id}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setTags((s) =>
                        e.target.checked
                          ? [...s, id]
                          : s.filter((x) => x !== id),
                      );
                    }}
                  />
                  <span className="ml-2">{t.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div>
          <button className="rounded bg-blue-600 px-3 py-1 text-white">
            Publish
          </button>
        </div>
      </form>
    </div>
  );
}
