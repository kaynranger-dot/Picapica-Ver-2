import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AdminDashboard = () => {
  const { user, userProfile, isAdmin } = useAuth()
  const [allUsers, setAllUsers] = useState([])
  const [allImages, setAllImages] = useState([])
  const [allSessions, setAllSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard')
      return
    }
    
    fetchAdminData()
  }, [user, userProfile])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Fetch all users
      const { data: users, error: usersError } = await db.getAllUsers()
      if (usersError) throw usersError
      setAllUsers(users || [])

      // Fetch all images
      const { data: images, error: imagesError } = await db.getAllImages()
      if (imagesError) throw imagesError
      setAllImages(images || [])

      // Fetch all sessions
      const { data: sessions, error: sessionsError } = await db.getAllSessions()
      if (sessionsError) throw sessionsError
      setAllSessions(sessions || [])

    } catch (error) {
      console.error('Error fetching admin data:', error)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async (image) => {
    try {
      // Update download count
      await db.updateImageDownloadCount(image.id)
      
      // Create download link
      const link = document.createElement('a')
      link.href = image.image_data || image.image_url
      link.download = `picapica-admin-${image.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Refresh data
      fetchAdminData()
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const printImage = (image) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Photo Strip</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; }
            img { max-width: 100%; height: auto; }
            @media print {
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${image.image_data || image.image_url}" alt="Photo Strip" />
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
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

  const getStats = () => {
    const totalDownloads = allImages.reduce((sum, img) => sum + (img.download_count || 0), 0)
    const recentImages = allImages.filter(img => {
      const imageDate = new Date(img.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return imageDate > weekAgo
    }).length

    return {
      totalUsers: allUsers.length,
      totalImages: allImages.length,
      totalSessions: allSessions.length,
      totalDownloads,
      recentImages,
      adminUsers: allUsers.filter(user => user.role === 'admin').length
    }
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    )
  }

  if (!isAdmin()) {
    return (
      <div className="admin-container">
        <div className="error-message">
          Access denied. Admin privileges required.
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <button 
            onClick={() => navigate('/dashboard')}
            className="secondary-button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({allUsers.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Images ({allImages.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Sessions ({allSessions.length})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.totalUsers}</p>
                <p className="stat-detail">{stats.adminUsers} admins</p>
              </div>
              
              <div className="stat-card">
                <h3>Total Images</h3>
                <p className="stat-number">{stats.totalImages}</p>
                <p className="stat-detail">{stats.recentImages} this week</p>
              </div>
              
              <div className="stat-card">
                <h3>Total Sessions</h3>
                <p className="stat-number">{stats.totalSessions}</p>
              </div>
              
              <div className="stat-card">
                <h3>Total Downloads</h3>
                <p className="stat-number">{stats.totalDownloads}</p>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {allImages.slice(0, 10).map((image) => (
                  <div key={image.id} className="activity-item">
                    <div className="activity-info">
                      <p>
                        <strong>{image.user_profiles?.full_name || image.user_profiles?.email}</strong> 
                        {' '}created a {image.layout} photo strip
                      </p>
                      <p className="activity-date">{formatDate(image.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>All Users</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Images Created</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => {
                    const userImageCount = allImages.filter(img => img.user_id === user.user_id).length
                    return (
                      <tr key={user.id}>
                        <td>{user.full_name || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>{userImageCount}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="images-section">
            <h2>All Generated Images</h2>
            <div className="admin-images-grid">
              {allImages.map((image) => (
                <div key={image.id} className="admin-image-card">
                  <div className="image-preview">
                    {image.image_data ? (
                      <img 
                        src={image.image_data} 
                        alt="Photo strip"
                        className="strip-thumbnail"
                      />
                    ) : (
                      <div className="no-preview">No preview</div>
                    )}
                  </div>
                  
                  <div className="image-details">
                    <p><strong>User:</strong> {image.user_profiles?.full_name || image.user_profiles?.email}</p>
                    <p><strong>Layout:</strong> {image.layout}</p>
                    <p><strong>Created:</strong> {formatDate(image.created_at)}</p>
                    <p><strong>Downloads:</strong> {image.download_count || 0}</p>
                  </div>
                  
                  <div className="image-actions">
                    <button 
                      onClick={() => downloadImage(image)}
                      className="download-button"
                    >
                      📥 Download
                    </button>
                    <button 
                      onClick={() => printImage(image)}
                      className="print-button"
                    >
                      🖨️ Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="sessions-section">
            <h2>All Sessions</h2>
            <div className="sessions-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Layout</th>
                    <th>Filter</th>
                    <th>Created</th>
                    <th>Session ID</th>
                  </tr>
                </thead>
                <tbody>
                  {allSessions.map((session) => (
                    <tr key={session.session_id}>
                      <td>{session.user_profiles?.full_name || session.user_profiles?.email}</td>
                      <td>{session.layout}</td>
                      <td>{session.filter_applied}</td>
                      <td>{formatDate(session.created_at)}</td>
                      <td className="session-id">{session.session_id.slice(0, 8)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard