const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_KEY = "sleeve.token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. network-level failure)
  }

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong talking to the server.");
  }
  return data;
}

export const api = {
  signup: (email, username, password) =>
    request("/auth/signup", { method: "POST", body: { email, username, password } }),
  login: (identifier, password) =>
    request("/auth/login", { method: "POST", body: { identifier, password } }),
  verifyEmail: (token) => request("/auth/verify", { method: "POST", body: { token } }),
  resendVerification: (identifier) =>
    request("/auth/resend-verification", { method: "POST", body: { identifier } }),
  me: () => request("/auth/me"),

  listItems: () => request("/items"),
  createItem: (item) => request("/items", { method: "POST", body: item }),
  updateItem: (id, item) => request(`/items/${id}`, { method: "PUT", body: item }),
  deleteItem: (id) => request(`/items/${id}`, { method: "DELETE" }),
  setItemShare: (id, isPublic) => request(`/items/${id}/share`, { method: "PUT", body: { isPublic } }),

  listWishlist: () => request("/wishlist"),
  createWishlistItem: (item) => request("/wishlist", { method: "POST", body: item }),
  updateWishlistItem: (id, item) => request(`/wishlist/${id}`, { method: "PUT", body: item }),
  deleteWishlistItem: (id) => request(`/wishlist/${id}`, { method: "DELETE" }),

  getPublicShare: (shareId) => request(`/share/${shareId}`),
};
