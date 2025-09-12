import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);  // store full user object or null

  useEffect(() => {
    // Example: read user data from localStorage or API on mount
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setIsAuthenticated(storedAuth);
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  function login(userData) {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  }

  function logout() {
    localStorage.setItem("isAuthenticated", "false");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
