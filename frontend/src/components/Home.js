import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";

const Home = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/welcome");
    }
  };
  return (
    <div className="background-gradient h-screen flex  flex-col justify-center items-center text-center">
      <div className="home-container">
        <h1 className="text-5xl font-bold text-pink-600 mb-4">picapica</h1>
        <p className="text-lg text-gray-700 mb-6">
          {user 
            ? `Welcome back, ${userProfile?.full_name || user.email}!` 
            : "Welcome to Agnes' photobooth! This is your personal photobooth at home."
          }
        </p>      
          
        <img src="/photobooth-strip.png" alt="photobooth strip" className="photobooth-strip"/>
        
        <div className="home-buttons">
          <button 
            onClick={handleGetStarted} 
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
          >
            {user ? "Go to Dashboard" : "START"}
          </button>
          
          {!user && (
            <div className="auth-buttons" style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => navigate("/login")}
                className="bg-transparent border-2 border-pink-500 text-pink-500 px-4 py-2 rounded-lg hover:bg-pink-500 hover:text-white transition"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate("/register")}
                className="bg-transparent border-2 border-pink-500 text-pink-500 px-4 py-2 rounded-lg hover:bg-pink-500 hover:text-white transition"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        <footer className="mt-8 text-sm text-gray-600">
          made by{" "}
          <a
            href="https://agneswei.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: "pink", textDecoration: "none" }}>agneswei</a>
        </footer>
      </div>
    </div>
    );
  };

export default Home;
