import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";

const Home = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/welcome");
  };

  return (
    <div className="background-gradient h-screen flex  flex-col justify-center items-center text-center">
      <div className="home-container">
        <h1 className="text-5xl font-bold text-pink-600 mb-4">picapica</h1>
        <p className="text-lg text-gray-700 mb-6">
          Welcome to Agnes' photobooth! This is your personal photobooth at home.
        </p>      
          
        <img src="/photobooth-strip.png" alt="photobooth strip" className="photobooth-strip"/>
        
        <div className="home-buttons">
          <button 
            onClick={handleGetStarted} 
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
          >
            START
          </button>
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
