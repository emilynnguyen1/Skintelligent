const API_PREFIX = "/api";
let unauthorizedHandler = null;

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === "function" ? handler : null;
}

function buildUrl(path, params = {}) {
  const url = new URL(`${API_PREFIX}${path}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    url.searchParams.set(key, String(value));
  });
  return `${url.pathname}${url.search}`;
}

async function request(path, { method = "GET", params, body } = {}) {
  const response = await fetch(buildUrl(path, params), {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/login")) {
      unauthorizedHandler?.();
    }
    const message =
      payload?.detail ||
      payload?.message ||
      (typeof payload === "string" && payload) ||
      "Request failed.";
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

export const api = {
  getAuthConfig: () => request("/auth/config"),
  getSessionUser: () => request("/auth/me"),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  signup: (payload) => request("/auth/register", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST" }),
  getMe: () => request("/me"),
  updateMe: (payload) => request("/me", { method: "PATCH", body: payload }),
  getProfile: () => request("/me/profile"),
  upsertProfile: (payload) => request("/me/profile", { method: "PUT", body: payload }),
  getRecommendations: ({ limit = 6, useCached = true } = {}) =>
    request("/me/recommendations", { params: { limit, use_cached: useCached } }),
  generateRecommendations: ({ limit = 6 } = {}) =>
    request("/me/recommendations/generate", { method: "POST", params: { limit } }),
  getSavedProducts: () => request("/me/saved-products"),
  saveProduct: (productId) =>
    request("/me/saved-products", { method: "POST", body: { product_id: productId } }),
  removeSavedProduct: (productId) =>
    request(`/me/saved-products/${productId}`, { method: "DELETE" }),
  searchProducts: (params = {}) => request("/me/products", { params }),
  getProductAnalysis: (productId) => request(`/me/products/${productId}/analysis`),
};
