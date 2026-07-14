import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("inventory_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A stored token can become stale if it expires or its user is removed.
    // Tell the app to end the session instead of leaving protected pages empty.
    if (error.response?.status === 401 && localStorage.getItem("inventory_token")) {
      localStorage.removeItem("inventory_token");
      window.dispatchEvent(new Event("inventory:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export const getHealth = () => api.get("/health").then((response) => response.data);

export const login = (credentials) =>
  api.post("/auth/login", credentials).then((response) => response.data);

export const register = (payload) =>
  api.post("/auth/register", payload).then((response) => response.data);

export const getProfile = () => api.get("/auth/me").then((response) => response.data);

export const getDashboardSummary = () =>
  api.get("/dashboard").then((response) => response.data);

export const getProducts = (page = 1, limit = 10) =>
  api
    .get("/products", {
      params: { page, limit },
    })
    .then((response) => response.data);


export const createProduct = (product) =>
  api.post("/products", product).then((response) => response.data);

export const updateProduct = (id, product) =>
  api.put(`/products/${id}`, product).then((response) => response.data);

export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getCategories = () =>
  api.get("/categories").then((response) => response.data);

export const createCategory = (name) =>
  api.post("/categories", { name }).then((response) => response.data);

export const getSuppliers = () =>
  api.get("/suppliers").then((response) => response.data);

export const createSupplier = (data) =>
  api.post("/suppliers", data).then((response) => response.data);

export default api;
