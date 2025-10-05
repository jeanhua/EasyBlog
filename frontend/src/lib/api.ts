import type { Post, Comment } from "../types";

const BASE = import.meta.env.VITE_API_BASE ?? "/api";
const TOKEN_KEY = "easyblog_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  opts.headers = { ...(opts.headers || {}), ...headers };
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(text || res.statusText);
  try {
    return JSON.parse(text) as T;
  } catch {
    // empty body
    return {} as unknown as T;
  }
}

export async function fetchPosts(page = 0, size = 10, q?: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (q) params.set("q", q);
  return request<{ total: number; items: Post[] }>(
    `/posts?${params.toString()}`,
  );
}

export async function fetchPost(id: string | number) {
  return request<Post>(`/posts/${id}`);
}

export async function fetchComments(postId: string | number) {
  // backend returns { items: Comment[] }
  const res = await request<{ items: Comment[] }>(`/posts/${postId}/comments`);
  return res.items || [];
}

export async function postComment(postId: number | string, content: string) {
  return request<Comment>(`/comments`, {
    method: "POST",
    body: JSON.stringify({ post_id: Number(postId), content }),
  });
}

// categories & tags
export async function fetchCategories(page = 0, size = 50) {
  const res = await request<{
    data: { id: number; name: string; description?: string }[];
    total: number;
  }>(`/categories?page=${page}&size=${size}`);
  return res.data || [];
}

export async function fetchTags(page = 0, size = 50) {
  const res = await request<{
    data: { id: number; name: string }[];
    total: number;
  }>(`/tags?page=${page}&size=${size}`);
  return res.data || [];
}

// friends
export async function fetchFriends(page = 0, size = 50) {
  const res = await request<{ data: any[]; total: number }>(
    `/friends?page=${page}&size=${size}`,
  );
  return res.data || [];
}

// posts management
export async function createPost(payload: any) {
  return request(`/posts`, { method: "POST", body: JSON.stringify(payload) });
}

export async function fetchPostsByCategory(id: string | number) {
  return request<any[]>(`/posts/category/${id}`);
}

export async function fetchPostsByTag(id: string | number) {
  return request<any[]>(`/posts/tag/${id}`);
}

export async function updatePost(id: string | number, payload: any) {
  return request(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePost(id: string | number) {
  return request(`/posts/${id}`, { method: "DELETE" });
}

// friends management
export async function createFriend(payload: any) {
  return request(`/friends`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateFriend(id: string | number, payload: any) {
  return request(`/friends/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteFriend(id: string | number) {
  return request(`/friends/${id}`, { method: "DELETE" });
}

// auth
export async function login(email: string, passwordSha256Hex: string) {
  const res = await request<{ token: string }>(`/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password: passwordSha256Hex }),
  });
  if (res && (res as any).token) {
    setToken((res as any).token);
  }
  return res;
}

export async function register(
  username: string,
  email: string,
  passwordSha256Hex: string,
) {
  return request<{ id: number; username: string; email: string }>(
    `/auth/register`,
    {
      method: "POST",
      body: JSON.stringify({ username, email, password: passwordSha256Hex }),
    },
  );
}

export async function getConfig(key: string) {
  return request<{ data: { key: string; value: string } }>(
    `/config?key=${encodeURIComponent(key)}`,
  );
}

export async function profile() {
  return request<{ id: number; username: string; email: string; role: string; avatar: string }>(
    `/auth/profile`,
  );
}

export function logout() {
  setToken(null);
}

export function getStoredToken() {
  return getToken();
}

// helper: compute sha256 hex
export async function sha256Hex(text: string) {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default {
  fetchPosts,
  fetchPost,
  fetchComments,
  postComment,
  login,
  register,
  getConfig,
  profile,
  logout,
  getStoredToken,
  sha256Hex,
  fetchCategories,
  fetchTags,
  fetchFriends,
  createPost,
  fetchPostsByCategory,
  fetchPostsByTag,
  updatePost,
  deletePost,
  createFriend,
  updateFriend,
  deleteFriend,
};
