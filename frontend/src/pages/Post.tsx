import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams, Link } from "react-router-dom";
import remarkGfm from "remark-gfm";

import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import type { Post as TPost, Comment } from "../types";

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState<TPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (postId: string | undefined) => {
    if (!postId) return;
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        api.fetchPost(postId),
        api.fetchComments(postId),
      ]);
      setPost(p);
      setComments(c || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(id);
  }, [id]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !commentText) return;
    try {
      await api.postComment(id, commentText);
      setCommentText("");
      const fresh = await api.fetchComments(id);
      setComments(fresh || []);
    } catch (err: any) {
      alert(err?.message || String(err));
    }
  }

  const nav = useNavigate();
  const { user } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  const canEdit = user && post.author && user.ID === (post.author as any).id;

  async function onDelete() {
    if (!post?.ID) return;
    if (!confirm("Delete this post?")) return;
    try {
      await api.deletePost(post.ID);
      nav("/");
    } catch (err) {
      alert(String(err));
    }
  }

  return (
    <article>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <div className="text-muted mb-4 text-sm">
            By {post.author?.username || "unknown"}
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Link
              to={`/posts/${post.ID}/edit`}
              className="rounded border px-3 py-1"
            >
              Edit
            </Link>
          )}
          {canEdit && (
            <button
              onClick={onDelete}
              className="rounded bg-red-600 px-3 py-1 text-white"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content || ""}
        </ReactMarkdown>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
        <form onSubmit={submitComment} className="mt-3 space-y-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full border p-2"
            rows={4}
          />
          <div>
            <button className="rounded bg-slate-700 px-3 py-1 text-white">
              Post comment
            </button>
          </div>
        </form>
        <div className="mt-4 space-y-2">
          {comments.map((c) => (
            <div key={c.ID} className="rounded border p-2">
              <div className="text-muted text-xs">{c.created_at}</div>
              <div>{c.content}</div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
