import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
       * Restore cached user immediately
       */
      if (storedUser) {
        try {
          setUser(
            JSON.parse(storedUser)
          );
        } catch {
          localStorage.removeItem(
            "adminUser"
          );
        }
      }

      /*
       * Verify current authentication.
       *
       * If access token is expired,
       * apiClient automatically calls
       * /auth/refresh and retries /auth/me.
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

        if (loggedInUser) {
          localStorage.setItem(
            "adminUser",
            JSON.stringify(loggedInUser)
          );

          setUser(loggedInUser);
        }
      } catch {
        localStorage.removeItem(
          "adminToken"
        );

        localStorage.removeItem(
          "adminUser"
        );

        setUser(null);
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

    localStorage.setItem(
      "adminToken",
      token
    );

    if (loggedInUser) {
      localStorage.setItem(
        "adminUser",
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);
    }

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

    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminUser"
    );

    setUser(null);

    window.location.href =
      "/admin/login";
  };

  const isAuthenticated =
    Boolean(user);

  const hasRole = (roles = []) => {
    if (!user) {
      return false;
    }

    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

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