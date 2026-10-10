import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SuperProtectedRoute() {
  const {
    isAuthenticated,
    loading,
    isSuperAdmin,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-500">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default SuperProtectedRoute;