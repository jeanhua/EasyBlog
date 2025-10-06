import MDEditor from "@uiw/react-md-editor";
import {
  Calendar,
  Edit2,
  MessageSquare,
  Send,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import api from "../lib/api";
import type { Comment, Post as TPost } from "../types";

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState<TPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    load(id);
  }, [id]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !commentText || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.postComment(id, commentText);
      setCommentText("");
      const fresh = await api.fetchComments(id);
      setComments(fresh || []);
    } catch (err: any) {
      alert(err?.message || String(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const nav = useNavigate();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6 py-12">
        <div
          className="animate-pulse-soft h-12 rounded-md bg-gray-200 dark:bg-gray-700"
          style={{ width: "60%" }}
        ></div>
        <div
          className="animate-pulse-soft h-6 rounded-md bg-gray-200 dark:bg-gray-700"
          style={{ width: "30%" }}
        ></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse-soft h-4 rounded-md bg-gray-200 dark:bg-gray-700"
              style={{ width: `${80 + i * 5}%` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-gray-400 dark:text-gray-600">
          <MessageSquare size={48} />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Post not found
        </h3>
        <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/"
          className="transition-smooth rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const canEdit = user && post.author && user.ID === (post.author as any).ID;

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
    <article className="animate-fade-in space-y-6">
      {/* Post Header */}
      <div className="border-b pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mb-3 bg-clip-text text-3xl font-bold md:text-4xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <User size={16} />
                <span>{post.author?.username || "unknown"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {canEdit && (
              <Link
                to={`/posts/${post.ID}/edit`}
                className="transition-smooth flex items-center gap-1.5 rounded border px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </Link>
            )}
            {canEdit && (
              <button
                onClick={onDelete}
                className="transition-smooth flex items-center gap-1.5 rounded border border-red-600 bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="prose dark:prose-invert transition-smooth max-w-none">
        <MDEditor.Markdown source={post.content || ""} />
      </div>

      {/* Comments Section */}
      <section className="mt-8 border-t pt-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <MessageSquare size={20} />
          Comments ({comments.length})
        </h2>

        {/* Comment Form */}
        <form
          onSubmit={submitComment}
          className="transition-smooth mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
        >
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="transition-smooth w-full rounded-md border bg-white p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-900"
            rows={4}
            placeholder="Add a comment..."
            disabled={!user}
          />
          {!user && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              You need to be logged in to comment.
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="transition-smooth flex items-center gap-1.5 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!user || !commentText || isSubmitting}
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send size={16} />
                  <span>Post Comment</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="mt-6 space-y-4">
            {comments.map((c, index) => (
              <div
                key={c.ID}
                className="transition-smooth animate-fade-in rounded-lg border p-4"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm dark:bg-gray-700">
                      {c.author?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="font-medium">
                      {c.author?.username || "unknown"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(c.created_at)}
                  </div>
                </div>
                <div className="text-gray-800 dark:text-gray-200">
                  {c.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </section>
    </article>
  );
}
