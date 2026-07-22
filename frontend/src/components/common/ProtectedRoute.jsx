import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function ProtectedRoute({ children, requiredRole, requiredPermission }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/access-denied" replace />;
  }

  if (requiredPermission) {
    if (user?.role !== "Super Admin" && !user?.permissions?.includes(requiredPermission)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
