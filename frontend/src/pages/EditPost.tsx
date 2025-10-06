import MDEditor from "@uiw/react-md-editor";
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Tag,
  Save,
  AlertCircle,
  Clock,
  List,
  PenTool,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>(
    [],
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTocItem, setActiveTocItem] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastActivityTimeRef = useRef<Date>(new Date());

  // Generate table of contents from markdown content
  useEffect(() => {
    const headers = content.match(/#{1,6}\s+(.+)/g);
    if (headers) {
      const newToc = headers.map((header, index) => {
        const level = header.match(/^#{1,6}/)?.[0].length || 1;
        const text = header.replace(/^#{1,6}\s+/, "").trim();
        const id = `heading-${index}`;
        return { id, text, level };
      });
      setToc(newToc);
    } else {
      setToc([]);
    }
  }, [content]);

  // Update last activity time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diffInMinutes =
        (now.getTime() - lastActivityTimeRef.current.getTime()) / 60000;
      if (
        diffInMinutes > 5 &&
        (title ||
          content ||
          summary ||
          categories.length > 0 ||
          tags.length > 0)
      ) {
        // This would be a good place to implement auto-save functionality
        console.log("Auto-save triggered");
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [title, content, summary, categories, tags]);

  // Track active TOC item based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (editorRef.current && toc.length > 0) {
        const scrollPosition = window.scrollY + 100;

        // Find the current heading
        for (let i = toc.length - 1; i >= 0; i--) {
          const element = document.getElementById(toc[i].id);
          if (element && element.offsetTop <= scrollPosition) {
            setActiveTocItem(toc[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [toc]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
      } catch (err: any) {
        setError(err?.message || "Failed to load post data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    // Simple validation
    if (!title.trim()) {
      setError("Please enter a title for your post");
      return;
    }

    if (!content.trim()) {
      setError("Please add some content to your post");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.updatePost(id, {
        title,
        content,
        summary,
        category_ids: categories,
        tag_ids: tags,
      });
      nav(`/posts/${id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to update post. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="border-grey-600 mb-4 inline-block h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Loading post...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-[80vh] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header with Back Button */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <button
              onClick={() => nav(`/posts/${id}`)}
              className="flex items-center gap-1.5 rounded-full p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              aria-label="Back to post"
            >
              <ArrowLeft size={18} />
              <span className="font-medium">View Post</span>
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            <Clock size={14} className="text-gray-500" />
            <span>Last edit: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
          {/* Card Header */}
          <div className="dark:to-gray-850 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 sm:p-8 dark:border-gray-700 dark:from-gray-800">
            <h1 className="animate-fade-in-up mb-2 bg-clip-text text-3xl font-bold">
              Edit Post
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Update your blog post with markdown formatting
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="animate-fade-in slide-in-from-top m-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex items-start">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <p className="ml-3 text-sm font-medium text-red-800 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="p-6 sm:p-8">
            {/* Title Input */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <BookOpen className="focus-within:text-grey-500 h-5 w-5 text-gray-400 transition-colors" />
                </div>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's your post about?"
                  className="focus:ring-grey-500 block w-full transform rounded-lg border border-gray-300 bg-gray-50 py-3 pr-3 pl-10 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-transparent focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
                  spellCheck="true"
                  autoComplete="off"
                />
              </div>
              {title && (
                <p className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-500">
                  <span className="mr-1 rounded bg-gray-100 px-1.5 py-0.5 font-mono dark:bg-gray-800">
                    {title.length}
                  </span>
                  characters
                </p>
              )}
            </div>

            {/* Summary Input */}
            <div className="mb-6">
              <label
                htmlFor="summary"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Summary (optional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <PenTool className="h-5 w-5 text-gray-400 transition-colors focus-within:text-blue-500" />
                </div>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="A brief summary that will appear as the excerpt for your post"
                  className="block w-full transform rounded-lg border border-gray-300 bg-gray-50 py-3 pr-3 pl-10 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
                  rows={2}
                  spellCheck="true"
                />
              </div>
            </div>

            {/* Content Editor with TOC */}
            <div className="mb-8">
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Content (Markdown)
                </label>
                <div className="mt-2 flex items-center text-xs text-gray-500 sm:mt-0 dark:text-gray-500">
                  {content && (
                    <span className="mr-2 rounded bg-gray-100 px-1.5 py-0.5 font-mono dark:bg-gray-800">
                      {content.length}
                    </span>
                  )}
                  <span>Supports Markdown formatting</span>
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row">
                {/* Table of Contents */}
                {toc.length > 0 && (
                  <div
                    className={`flex-shrink-0 transition-all duration-300 lg:w-64 xl:w-72 ${isSidebarCollapsed ? "opacity-0 lg:w-0" : ""}`}
                  >
                    <div className="animate-fade-in sticky top-8 rounded-xl border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
                      <div className="mb-4 flex items-center justify-between gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-2">
                          <List
                            size={16}
                            className="text-grey-600 dark:text-grey-400"
                          />
                          <span>Table of Contents</span>
                        </div>
                        <button
                          onClick={() =>
                            setIsSidebarCollapsed(!isSidebarCollapsed)
                          }
                          className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                          aria-label={
                            isSidebarCollapsed
                              ? "Expand sidebar"
                              : "Collapse sidebar"
                          }
                        >
                          {isSidebarCollapsed ? (
                            <List
                              size={16}
                              className="text-grey-500 dark:text-grey-400"
                            />
                          ) : (
                            <ArrowLeft
                              size={16}
                              className="text-grey-500 dark:text-grey-400"
                            />
                          )}
                        </button>
                      </div>
                      <nav className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 max-h-[60vh] space-y-1 overflow-y-auto pr-2 text-sm">
                        {toc.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={`block rounded-md px-2 py-1.5 transition-all duration-200 ${activeTocItem === item.id ? "bg-grey-100 text-grey-700 dark:bg-grey-900/30 dark:text-grey-300 font-medium" : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"}`}
                            style={{
                              paddingLeft: `${(item.level - 1) * 12}px`,
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              const element = document.getElementById(item.id);
                              if (element) {
                                element.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }
                            }}
                          >
                            {item.text}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </div>
                )}

                {/* Editor */}
                <div
                  ref={editorRef}
                  className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "" : "lg:ml-0"}`}
                >
                  <div className="w-full overflow-hidden rounded-xl border border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700">
                    <div className="flex items-center gap-1.5 border-b border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex space-x-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="ml-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Markdown Editor
                      </span>
                    </div>
                    <div className="bg-white dark:bg-gray-800">
                      <MDEditor
                        value={content}
                        onChange={(val) => setContent(val ?? "")}
                        height={800}
                        preview="edit"
                        className="rounded-lg border-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories and Tags */}
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Categories */}
              <div>
                <div className="mb-4 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Calendar className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Categories
                </div>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-9 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {allCats.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-900/50">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No categories available
                        </p>
                      </div>
                    ) : (
                      allCats.map((c) => (
                        <label
                          key={c.id}
                          className="group flex cursor-pointer items-center"
                        >
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
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 transition-all duration-200 focus:ring-blue-500"
                          />
                          <span className="ml-2.5 text-gray-700 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400">
                            {c.name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <div className="mb-4 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Tag className="text-grey-600 dark:text-grey-400 mr-2 h-5 w-5" />
                  Tags
                </div>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-9 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {allTags.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-900/50">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No tags available
                        </p>
                      </div>
                    ) : (
                      allTags.map((t) => (
                        <label
                          key={t.id}
                          className="group flex cursor-pointer items-center"
                        >
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
                            className="text-grey-600 focus:ring-grey-500 h-4 w-4 rounded border-gray-300 transition-all duration-200"
                          />
                          <span className="group-hover:text-grey-600 dark:group-hover:text-grey-400 ml-2.5 text-gray-700 transition-colors duration-200 dark:text-gray-300">
                            {t.name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
              <div className="flex-1">
                <button
                  type="submit"
                  className="from-grey-600 hover:from-grey-700 focus:ring-grey-500 flex w-full transform items-center justify-center gap-2 rounded-lg border border-transparent bg-gradient-to-r to-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:to-blue-700 focus:ring-2 focus:ring-offset-2 focus:outline-none active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:-translate-y-0"
                  disabled={saving || loading}
                >
                  {saving ? (
                    <>
                      <svg
                        className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Update Post</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => nav(`/posts/${id}`)}
                className="transform rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:-translate-y-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                disabled={saving || loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
