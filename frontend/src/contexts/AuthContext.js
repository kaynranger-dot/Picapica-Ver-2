import React, { createContext, useContext, useState } from "react";

// Create context
const AuthContext = createContext();

// ✅ Dummy provider (no backend)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Fake login/logout just for testing
  const login = (username) => setUser({ name: username });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ useAuth hook
export function useAuth() {
  return useContext(AuthContext);
}
