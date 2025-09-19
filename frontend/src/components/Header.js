import React from "react";
import { Link } from "react-router-dom";

const Header = () => (
  <header style={{ width: '100%', background: '#fff', borderBottom: '1.5px solid #eee', marginBottom: 24, padding: '12px 0', boxShadow: '0 2px 8px #0001', position: 'sticky', top: 0, zIndex: 100 }}>
    <nav style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#222', fontWeight: 600, fontSize: '1.1rem' }}>Home</Link>
      <Link to="/post" style={{ textDecoration: 'none', color: '#222', fontWeight: 600, fontSize: '1.1rem' }}>Post</Link>
      <Link to="/contact" style={{ textDecoration: 'none', color: '#222', fontWeight: 600, fontSize: '1.1rem' }}>Contact</Link>
      <Link to="/login" style={{ textDecoration: 'none', color: '#222', fontWeight: 600, fontSize: '1.1rem' }}>Login</Link>
      <Link to="/register" style={{ textDecoration: 'none', color: '#222', fontWeight: 600, fontSize: '1.1rem' }}>Register</Link>
    </nav>
  </header>
);

export default Header;
