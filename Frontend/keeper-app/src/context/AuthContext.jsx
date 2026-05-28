import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session automatically on page refresh
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Axios interceptor will automatically attach the Authorization Header from localStorage
        const res = await API.get("/auth/me");
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.log("No active session found");
        localStorage.removeItem("token"); // Clean up token if session/token expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // Standard Email/Password Login
  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      
      // ✅ FIX: Save token to localStorage for HTTP Header Authorization
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      
      setUser(res.data.user);
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      throw err;
    }
  };

  // Standard Email/Password Registration
  const register = async (name, email, password) => {
    try {
      const res = await API.post("/auth/register", { name, email, password });
      
      // ✅ FIX: Save token to localStorage for HTTP Header Authorization
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      
      setUser(res.data.user);
    } catch (err) {
      console.error("Registration Error:", err.response?.data || err.message);
      throw err;
    }
  };

  // Google Authentication Login
  const loginWithGoogle = async (response) => {
    try {
      const res = await API.post("/auth/google", {
        credential: response.credential,
      });
      
      // ✅ FIX: Save token to localStorage for HTTP Header Authorization
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      
      setUser(res.data.user);
    } catch (err) {
      console.error("Google Login Backend Error:", err.response?.data || err.message);
      throw err;
    }
  };

  // Logout User
  const logout = async () => {
    try {
      // API call to instruct the backend to clear the secure cookie
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout API Error:", err);
    } finally {
      // ✅ FIX: Clear token from localStorage on logout
      localStorage.removeItem("token");
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);