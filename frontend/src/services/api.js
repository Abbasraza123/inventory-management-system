import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("inventory_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getHealth = () => api.get("/health").then((response) => response.data);

export const login = (credentials) =>
  api.post("/auth/login", credentials).then((response) => response.data);

export const getProfile = () => api.get("/auth/me").then((response) => response.data);

export const getDashboardSummary = () =>
  api.get("/dashboard").then((response) => response.data);

export const getProducts = () =>
  api.get("/products").then((response) => response.data);

export const createProduct = (product) =>
  api.post("/products", product).then((response) => response.data);

export const updateProduct = (id, product) =>
  api.put(`/products/${id}`, product).then((response) => response.data);

export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getCategories = () =>
  api.get("/categories").then((response) => response.data);

export const getSuppliers = () =>
  api.get("/suppliers").then((response) => response.data);

export default api;
