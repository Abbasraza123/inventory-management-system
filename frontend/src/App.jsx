import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem("inventory_token")));

  const handleLogin = (token) => {
    localStorage.setItem("inventory_token", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("inventory_token");
    setIsAuthenticated(false);
  };

  useEffect(() => {
    window.addEventListener("inventory:unauthorized", handleLogout);
    return () => window.removeEventListener("inventory:unauthorized", handleLogout);
  }, []);

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <Layout onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
