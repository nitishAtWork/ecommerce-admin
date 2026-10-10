import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const AuthContext = createContext(null);

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];
const SUPERADMIN_ROLE = "SUPERADMIN";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Check whether user is allowed
   * to access the admin panel.
   */
  const isAdminUser = (userData) => {
    if (!userData?.role) {
      return false;
    }

    return ADMIN_ROLES.includes(
      String(userData.role).toUpperCase()
    );
  };

  const isSuperAdminUser = (userData) => {
    if (!userData?.role) {
      return false;
    }

    return (
      String(userData.role).toUpperCase() ===
      SUPERADMIN_ROLE
    );
  };

  /*
   * Clear admin authentication
   */
  const clearAuth = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setUser(null);
  };

  /*
   * Restore authentication
   */
  useEffect(() => {
    const restoreAuth = async () => {
      const token =
        localStorage.getItem("adminToken");

      const storedUser =
        localStorage.getItem("adminUser");

      /*
       * No token = not logged in
       */
      if (!token) {
        setLoading(false);
        return;
      }

      /*
       * Restore cached user only if
       * the user has an allowed admin role.
       */
      if (storedUser) {
        try {
          const parsedUser =
            JSON.parse(storedUser);

          if (isAdminUser(parsedUser)) {
            setUser(parsedUser);
          } else {
            clearAuth();
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem("adminUser");
        }
      }

      /*
       * Verify current authentication
       */
      try {
        const response =
          await apiClient.get(
            API_ENDPOINTS.AUTH.ME
          );

        const loggedInUser =
          response.data?.user ||
          response.data?.data?.user ||
          response.data?.data;

        /*
         * Authentication succeeded but
         * user doesn't have admin access.
         */
        if (!isAdminUser(loggedInUser)) {
          clearAuth();

          throw new Error(
            "You do not have permission to access the admin panel."
          );
        }

        localStorage.setItem(
          "adminUser",
          JSON.stringify(loggedInUser)
        );

        setUser(loggedInUser);
      } catch (error) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  /*
   * Login
   */
  const login = async (
    email,
    password
  ) => {
    const response =
      await apiClient.post(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          email,
          password,
        }
      );

    const data = response.data;

    const token =
      data.token ||
      data.accessToken ||
      data.data?.token ||
      data.data?.accessToken;

    const loggedInUser =
      data.user ||
      data.data?.user;

    if (!token) {
      throw new Error(
        "Authentication token was not returned."
      );
    }

    /*
     * IMPORTANT:
     * Check role BEFORE storing the token.
     */
    if (!isAdminUser(loggedInUser)) {
      throw new Error(
        "You do not have permission to access the admin panel."
      );
    }

    localStorage.setItem(
      "adminToken",
      token
    );

    localStorage.setItem(
      "adminUser",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    return data;
  };

  /*
   * Logout
   */
  const logout = async () => {
    try {
      await apiClient.post(
        API_ENDPOINTS.AUTH.LOGOUT
      );
    } catch {
      // Ignore logout API errors
    }

    clearAuth();

    window.location.href =
      "/admin/login";
  };

  const isAuthenticated =
    Boolean(user);

  /*
   * Check user role
   */
  const hasRole = (roles = []) => {
    if (!user) {
      return false;
    }

    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    return roles.some(
      (role) =>
        String(role).toUpperCase() ===
        String(user.role).toUpperCase()
    );
  };

  /*
   * Specifically check admin access
   */
  const isAdmin = isAdminUser(user);
  const isSuperAdmin = isSuperAdminUser(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}