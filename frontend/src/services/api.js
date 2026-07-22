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
  api.get("/products", { params: { page, limit } }).then((response) => response.data);
export const createProduct = (product) =>
  api.post("/products", product).then((response) => response.data);
export const updateProduct = (id, product) =>
  api.put(`/products/${id}`, product).then((response) => response.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getCategories = () =>
  api.get("/categories").then((response) => response.data);
export const createCategory = (name) =>
  api.post("/categories", { name }).then((response) => response.data);
export const updateCategory = (id, data) =>
  api.put(`/categories/${id}`, data).then((response) => response.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getSuppliers = () =>
  api.get("/suppliers").then((response) => response.data);
export const createSupplier = (data) =>
  api.post("/suppliers", data).then((response) => response.data);
export const updateSupplier = (id, data) =>
  api.put(`/suppliers/${id}`, data).then((response) => response.data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);

export const getUsers = (page = 1, limit = 20) =>
  api.get("/users", { params: { page, limit } }).then((response) => response.data);
export const getUser = (id) =>
  api.get(`/users/${id}`).then((response) => response.data);
export const createUser = (data) =>
  api.post("/users", data).then((response) => response.data);
export const updateUser = (id, data) =>
  api.put(`/users/${id}`, data).then((response) => response.data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const toggleUserActive = (id) =>
  api.patch(`/users/${id}/toggle-active`).then((response) => response.data);
export const getRoles = () =>
  api.get("/users/roles").then((response) => response.data);

export const stockIn = (data) =>
  api.post("/inventory/stock-in", data).then((response) => response.data);
export const stockOut = (data) =>
  api.post("/inventory/stock-out", data).then((response) => response.data);
export const adjustStock = (data) =>
  api.post("/inventory/adjust", data).then((response) => response.data);
export const markDamaged = (data) =>
  api.post("/inventory/mark-damaged", data).then((response) => response.data);
export const getMovements = (params = {}) =>
  api.get("/inventory/movements", { params }).then((response) => response.data);
export const getLowStock = (threshold = 5) =>
  api.get("/inventory/low-stock", { params: { threshold } }).then((response) => response.data);
export const getInventoryValue = () =>
  api.get("/inventory/value").then((response) => response.data);

export default api;
