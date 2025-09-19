import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'

const Dashboard = () => {
  const { user, userProfile, signOut } = useAuth()
  const [userImages, setUserImages] = useState([])
  const [userSessions, setUserSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's images
      const { data: images, error: imagesError } = await db.getUserImages(user.id)
      if (imagesError) {
        throw imagesError
      }
      setUserImages(images || [])

      // Fetch user's sessions
      const { data: sessions, error: sessionsError } = await db.getUserSessions(user.id)
      if (sessionsError) {
        throw sessionsError
      }
      setUserSessions(sessions || [])

    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load your data')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const downloadImage = async (image) => {
    try {
      // Update download count
      await db.updateImageDownloadCount(image.id)
      
      // Create download link
      const link = document.createElement('a')
      link.href = image.image_data || image.image_url
      link.download = `picapica-${image.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Refresh data to show updated download count
      fetchUserData()
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>Welcome, {userProfile?.full_name || user?.email}!</h1>
          <p className="user-email">{user?.email}</p>
          {userProfile?.role === 'admin' && (
            <span className="admin-badge">Admin</span>
          )}
        </div>
        
        <div className="dashboard-actions">
          <button 
            onClick={() => navigate('/photobooth')}
            className="primary-button"
          >
            Create New Photo Strip
          </button>
          
          {userProfile?.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')}
              className="admin-button"
            >
              Admin Dashboard
            </button>
          )}
          
          <button 
            onClick={handleSignOut}
            className="secondary-button"
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-content">
        <div className="stats-section">
          <div className="stat-card">
            <h3>Total Photo Strips</h3>
            <p className="stat-number">{userImages.length}</p>
          </div>
          
          <div className="stat-card">
            <h3>Total Sessions</h3>
            <p className="stat-number">{userSessions.length}</p>
          </div>
          
          <div className="stat-card">
            <h3>Total Downloads</h3>
            <p className="stat-number">
              {userImages.reduce((sum, img) => sum + (img.download_count || 0), 0)}
            </p>
          </div>
        </div>

        <div className="images-section">
          <h2>Your Photo Strips</h2>
          
          {userImages.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any photo strips yet!</p>
              <button 
                onClick={() => navigate('/photobooth')}
                className="primary-button"
              >
                Create Your First Photo Strip
              </button>
            </div>
          ) : (
            <div className="images-grid">
              {userImages.map((image) => (
                <div key={image.id} className="image-card">
                  <div className="image-preview">
                    {image.image_data ? (
                      <img 
                        src={image.image_data} 
                        alt="Photo strip"
                        className="strip-thumbnail"
                      />
                    ) : (
                      <div className="no-preview">No preview available</div>
                    )}
                  </div>
                  
                  <div className="image-info">
                    <p className="image-layout">Layout: {image.layout}</p>
                    <p className="image-date">{formatDate(image.created_at)}</p>
                    <p className="download-count">
                      Downloads: {image.download_count || 0}
                    </p>
                  </div>
                  
                  <div className="image-actions">
                    <button 
                      onClick={() => downloadImage(image)}
                      className="download-button"
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sessions-section">
          <h2>Recent Sessions</h2>
          
          {userSessions.length === 0 ? (
            <p>No sessions yet.</p>
          ) : (
            <div className="sessions-list">
              {userSessions.slice(0, 10).map((session) => (
                <div key={session.session_id} className="session-card">
                  <div className="session-info">
                    <p><strong>Layout:</strong> {session.layout}</p>
                    <p><strong>Filter:</strong> {session.filter_applied}</p>
                    <p><strong>Date:</strong> {formatDate(session.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard