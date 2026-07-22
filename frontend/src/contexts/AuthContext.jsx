import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getProfile } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("inventory_token");

    const authenticate = async () => {
      if (!token) return;
      try {
        const data = await getProfile();
        if (!cancelled) setUser(data.user);
      } catch {
        localStorage.removeItem("inventory_token");
        if (!cancelled) setUser(null);
      }
    };

    authenticate().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const handleLogin = useCallback((token, userData) => {
    localStorage.setItem("inventory_token", token);
    if (userData) {
      setUser(userData);
    } else {
      getProfile()
        .then((data) => setUser(data.user))
        .catch(() => setUser(null));
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("inventory_token");
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roleNames) => {
      if (!user || !user.role) return false;
      return roleNames.includes(user.role);
    },
    [user],
  );

  const hasPermission = useCallback(
    (permission) => {
      if (!user || !user.role) return false;
      if (user.role === "Super Admin") return true;
      if (!user.permissions) return false;
      return user.permissions.includes(permission);
    },
    [user],
  );

  const value = {
    user,
    setUser,
    loading,
    handleLogin,
    handleLogout,
    hasRole,
    hasPermission,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
