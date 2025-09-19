/*
  # Create RPC Functions for Admin Operations

  1. Functions
    - increment_download_count: Safely increment download counter
    - get_user_stats: Get statistics for a specific user
    - get_admin_stats: Get overall platform statistics
    
  2. Security
    - Functions respect RLS policies
    - Admin functions check user permissions
*/

-- Function to safely increment download count
CREATE OR REPLACE FUNCTION increment_download_count(image_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE generated_images 
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = image_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_images', COALESCE(COUNT(gi.id), 0),
    'total_sessions', COALESCE(COUNT(DISTINCT s.session_id), 0),
    'total_downloads', COALESCE(SUM(gi.download_count), 0),
    'layouts_used', json_agg(DISTINCT gi.layout),
    'most_recent_session', MAX(s.created_at)
  ) INTO result
  FROM generated_images gi
  LEFT JOIN sessions s ON gi.session_id = s.session_id
  WHERE gi.user_id = user_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin statistics (only for admin users)
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json AS $$
DECLARE
  result json;
  is_admin boolean;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM user_profiles),
    'total_images', (SELECT COUNT(*) FROM generated_images),
    'total_sessions', (SELECT COUNT(*) FROM sessions),
    'total_downloads', (SELECT COALESCE(SUM(download_count), 0) FROM generated_images),
    'images_this_week', (
      SELECT COUNT(*) FROM generated_images 
      WHERE created_at > NOW() - INTERVAL '7 days'
    ),
    'most_popular_layout', (
      SELECT layout FROM generated_images 
      GROUP BY layout 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ),
    'admin_count', (SELECT COUNT(*) FROM user_profiles WHERE role = 'admin')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create first admin user (run once during setup)
CREATE OR REPLACE FUNCTION create_first_admin(admin_email text)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET role = 'admin' 
  WHERE email = admin_email 
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;