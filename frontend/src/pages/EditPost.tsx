import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../lib/api";

export default function EditPost() {
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [allCats, setAllCats] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [categories, setCategories] = useState<number[]>([]);
  const [tags, setTags] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const p: any = await api.fetchPost(id as string);
        setTitle(p.title || "");
        setContent(p.content || "");
        setSummary(p.summary || "");
        setCategories((p.categories || []).map((c: any) => c.id));
        setTags((p.tags || []).map((t: any) => t.id));
        const cats = await api.fetchCategories();
        const tg = await api.fetchTags();
        setAllCats(cats);
        setAllTags(tg);
      } catch (err) {
        alert(String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    try {
      await api.updatePost(id, {
        title,
        content,
        summary,
        category_ids: categories,
        tag_ids: tags,
      });
      nav(`/posts/${id}`);
    } catch (err) {
      alert(String(err));
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">Edit Post</h1>
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
          placeholder="Content (Markdown)"
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
                    checked={categories.includes(c.id)}
                    onChange={(e) => {
                      const idn = Number(e.target.value);
                      setCategories((s) =>
                        e.target.checked
                          ? [...s, idn]
                          : s.filter((x) => x !== idn),
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
                    checked={tags.includes(t.id)}
                    onChange={(e) => {
                      const idn = Number(e.target.value);
                      setTags((s) =>
                        e.target.checked
                          ? [...s, idn]
                          : s.filter((x) => x !== idn),
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
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
