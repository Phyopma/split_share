import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize - check if user is logged in
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!token;
  }, [token]);

  const handleAuthError = useCallback(async () => {
    await logout();
  }, []);

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      const { user: userData, token: authToken } = response.data.data;

      setUser(userData);
      setToken(authToken);

      await AsyncStorage.setItem("token", authToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      return { success: true };
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const { user: userData, token: authToken } = response.data.data;

      setUser(userData);
      setToken(authToken);

      await AsyncStorage.setItem("token", authToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      delete axios.defaults.headers.common["Authorization"];

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: "Logout failed" };
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated,
    handleAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
