import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTestCredentials, setShowTestCredentials] = useState(false)
  
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/'

  const useTestCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@picapica.com')
      setPassword('admin123')
    } else {
      setEmail('user@picapica.com')
      setPassword('user123')
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setError('')
      setLoading(true)
      
      const { data, error } = await signIn(email, password)
      
      if (error) {
        setError(error.message)
        return
      }

      // Redirect to intended page or home
      navigate(from, { replace: true })
    } catch (error) {
      setError('Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign In to Picapica</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="test-credentials" style={{ marginBottom: '20px', padding: '15px', background: '#f0f8ff', borderRadius: '8px', border: '1px solid #b3d9ff' }}>
          <button 
            type="button"
            onClick={() => setShowTestCredentials(!showTestCredentials)}
            style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {showTestCredentials ? 'Hide' : 'Show'} Test Credentials
          </button>
          
          {showTestCredentials && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#333' }}>
                <strong>Admin Account:</strong>
                <button 
                  type="button"
                  onClick={() => useTestCredentials('admin')}
                  style={{ marginLeft: '10px', padding: '4px 8px', background: '#ff69b4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Use Admin Login
                </button>
              </p>
              <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#333' }}>
                <strong>Regular User:</strong>
                <button 
                  type="button"
                  onClick={() => useTestCredentials('user')}
                  style={{ marginLeft: '10px', padding: '4px 8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Use User Login
                </button>
              </p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Don't have an account?{' '}
            <Link to="/register" state={{ from: location.state?.from }}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login