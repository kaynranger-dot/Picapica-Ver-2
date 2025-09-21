import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user, login, logout } = useAuth();

  return (
    <div>
      <h1>🏠 Home Page</h1>
      {user ? (
        <>
          <p>Welcome back, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <p>You are not logged in.</p>
          <button onClick={() => login("DemoUser")}>Login</button>
        </>
      )}
    </div>
  );
}
