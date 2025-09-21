/*
  # Add increment function for download counts

  1. Functions
    - increment_download_count: Safely increment download count
  
  2. Security
    - Function is accessible to authenticated users
*/

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(image_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE generated_images 
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = image_id;
END;
$$;