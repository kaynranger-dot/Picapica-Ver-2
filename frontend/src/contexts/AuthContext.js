// src/contexts/AuthContext.js
import React, { createContext, useContext, useState } from "react";

// 1️⃣ Create context
const AuthContext = createContext();

// 2️⃣ Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (username) => setUser({ name: username });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3️⃣ Hook to use auth anywhere
export function useAuth() {
  return useContext(AuthContext);
}
