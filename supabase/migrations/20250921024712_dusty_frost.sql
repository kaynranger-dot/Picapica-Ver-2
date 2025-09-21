/*
  # Add Test Users for Demo

  1. Test Users
    - Admin user: admin@picapica.com / admin123
    - Regular user: user@picapica.com / user123
  
  2. Security
    - These are demo accounts for testing
    - In production, remove these accounts
*/

-- Create test admin user profile
INSERT INTO user_profiles (
  id,
  user_id, 
  email, 
  full_name, 
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@picapica.com',
  'Admin User',
  'admin'
) ON CONFLICT (user_id) DO NOTHING;

-- Create test regular user profile  
INSERT INTO user_profiles (
  id,
  user_id,
  email,
  full_name,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000002'::uuid,
  'user@picapica.com', 
  'Regular User',
  'user'
) ON CONFLICT (user_id) DO NOTHING;

-- Add some sample sessions for demo
INSERT INTO sessions (
  session_id,
  user_id,
  layout,
  filter_applied,
  metadata
) VALUES 
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001'::uuid,
  '3x2',
  'none',
  '{"demo": true}'::jsonb
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000002'::uuid,
  '4x2', 
  'sepia',
  '{"demo": true}'::jsonb
) ON CONFLICT (session_id) DO NOTHING;