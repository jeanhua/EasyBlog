import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Tag,
  AlertCircle,
  PenTool,
  FileText,
  ArrowLeft,
  ThumbsUp,
  List,
  BookOpen,
  Save,
  Clock,
  CheckCircle
} from "lucide-react";
import api from "../lib/api";
import MDEditor from "@uiw/react-md-editor";
import React, { useState, useEffect, useRef } from "react";

// Custom Markdown Editor theme
const editorTheme = {
  token: {
    heading1: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
    heading2: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginTop: '0.75rem',
      marginBottom: '0.5rem',
    },
    heading3: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      marginTop: '0.5rem',
      marginBottom: '0.25rem',
    },
  },
  code: {
    color: '#e45756',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    padding: '0.2rem 0.4rem',
    fontFamily: 'monospace',
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '8px',
  },
};

export default function Write() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [categories, setCategories] = useState<number[]>([]);
  const [tags, setTags] = useState<number[]>([]);
  const [allCats, setAllCats] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toc, setToc] = useState<{ id: string, text: string, level: number }[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTocItem, setActiveTocItem] = useState<string | null>(null);
  const nav = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const lastActivityTimeRef = useRef<Date>(new Date());

  // Generate table of contents from markdown content
  useEffect(() => {
    const headers = content.match(/#{1,6}\s+(.+)/g);
    if (headers) {
      const newToc = headers.map((header, index) => {
        const level = header.match(/^#{1,6}/)?.[0].length || 1;
        const text = header.replace(/^#{1,6}\s+/, '').trim();
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
    const handleContentChange = () => {
      lastActivityTimeRef.current = new Date();
    };

    const interval = setInterval(() => {
      const now = new Date();
      const diffInMinutes = (now.getTime() - lastActivityTimeRef.current.getTime()) / 60000;
      if (diffInMinutes > 5 && (title || content || summary || categories.length > 0 || tags.length > 0)) {
        // This would be a good place to implement auto-save functionality
        console.log('Auto-save triggered');
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.fetchCategories(), api.fetchTags()])
      .then(([cats, tags]) => {
        setAllCats(cats);
        setAllTags(tags);
      })
      .catch(() => {
        setError("Failed to load categories and tags");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

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
      const payload = {
        title,
        content,
        summary,
        category_ids: categories,
        tag_ids: tags,
      };
      await api.createPost(payload);
      nav("/");
    } catch (err: any) {
      setError(err?.message || "Failed to publish post. Please try again.");
    } finally {
      setSaving(false);
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
    <div className="min-h-[80vh] py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="flex items-center">
            <button
              onClick={() => nav("/")}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
              aria-label="Back to Home"
            >
              <ArrowLeft size={18} />
              <span className="font-medium">Dashboard</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400">
            <Clock size={14} className="text-gray-500" />
            <span>Last edit: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
          {/* Card Header */}
          <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-850">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-teal-400 dark:from-purple-400 dark:via-blue-400 dark:to-teal-300 mb-2 animate-fade-in-up">
              Write a New Post
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Create and publish your next blog post with markdown formatting
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="m-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4 animate-fade-in slide-in-from-top">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-400 transition-colors focus-within:text-purple-500" />
                </div>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's your post about?"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 transform hover:border-gray-400 dark:hover:border-gray-600"
                  spellCheck="true"
                  autoComplete="off"
                />
              </div>
              {title && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 flex items-center">
                  <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded mr-1">
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Summary (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PenTool className="h-5 w-5 text-gray-400 transition-colors focus-within:text-blue-500" />
                </div>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="A brief summary that will appear as the excerpt for your post"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 transform hover:border-gray-400 dark:hover:border-gray-600"
                  rows={2}
                  spellCheck="true"
                />
              </div>
            </div>

            {/* Content Editor with TOC */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Content (Markdown)
                </label>
                <div className="mt-2 sm:mt-0 text-xs text-gray-500 dark:text-gray-500 flex items-center">
                  {content && (
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded mr-2">
                      {content.length}
                    </span>
                  )}
                  <span>Supports Markdown formatting</span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Table of Contents */}
                {toc.length > 0 && (
                  <div className={`lg:w-64 xl:w-72 flex-shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-0 opacity-0' : ''}`}>
                    <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-md animate-fade-in">
                      <div className="flex items-center justify-between gap-2 mb-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-2">
                          <List size={16} className="text-purple-600 dark:text-purple-400" />
                          <span>Table of Contents</span>
                        </div>
                        <button
                          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                          {isSidebarCollapsed ? (
                            <List size={16} className="text-purple-500 dark:text-purple-400" />
                          ) : (
                            <ArrowLeft size={16} className="text-purple-500 dark:text-purple-400" />
                          )}
                        </button>
                      </div>
                      <nav className="text-sm space-y-1 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                        {toc.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={`block py-1.5 px-2 rounded-md transition-all duration-200 ${activeTocItem === item.id ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium' : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                            onClick={(e) => {
                              e.preventDefault();
                              const element = document.getElementById(item.id);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                <div ref={editorRef} className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? '' : 'lg:ml-0'}`}>
                  <div className="w-full rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                    <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-300 dark:border-gray-700 flex items-center gap-1.5">
                      <div className="flex space-x-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-3 font-medium">
                        Markdown Editor
                      </span>
                    </div>
                    <div className="bg-white dark:bg-gray-800">
                      <MDEditor
                        value={content}
                        onChange={(val) => setContent(val ?? '')}
                        height={800}
                        preview="edit"
                        className="border-0 rounded-lg"
                        theme={editorTheme}
                        placeholder={`# Start with a heading

## Then a subheading

Write your content here using Markdown formatting.

- Create lists
- Add **bold** and *italic* text
- Include [links](https://example.com)
- Insert images
- Add code blocks
- And more!`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Categories */}
              <div>
                <div className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Categories
                </div>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {allCats.length === 0 ? (
                      <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No categories available
                        </p>
                      </div>
                    ) : (
                      allCats.map((c) => (
                        <label key={c.id} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            value={c.id}
                            checked={categories.includes(c.id)}
                            onChange={(e) => {
                              const id = Number(e.target.value);
                              setCategories((s) =>
                                e.target.checked
                                  ? [...s, id]
                                  : s.filter((x) => x !== id),
                              );
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all duration-200"
                          />
                          <span className="ml-2.5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
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
                <div className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  <Tag className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Tags
                </div>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {allTags.length === 0 ? (
                      <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No tags available
                        </p>
                      </div>
                    ) : (
                      allTags.map((t) => (
                        <label key={t.id} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            value={t.id}
                            checked={tags.includes(t.id)}
                            onChange={(e) => {
                              const id = Number(e.target.value);
                              setTags((s) =>
                                e.target.checked
                                  ? [...s, id]
                                  : s.filter((x) => x !== id),
                              );
                            }}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 transition-all duration-200"
                          />
                          <span className="ml-2.5 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0"
                  disabled={saving || loading}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Publish Post</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => nav("/")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0"
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
