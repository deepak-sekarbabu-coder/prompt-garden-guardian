-- Create demo users (these would normally be created through Supabase Auth)
-- Since we can't directly insert into auth.users through migrations,
-- we'll create a function to set up demo data after manual user creation

-- Insert demo profiles with specific user IDs that we'll create manually
-- Demo Admin: admin@demo.com (you can sign up with this email and password: demo123!)
-- Demo User: user@demo.com (you can sign up with this email and password: demo123!)

-- Function to update user roles after they sign up
CREATE OR REPLACE FUNCTION public.setup_demo_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
  regular_user_id uuid;
BEGIN
  -- Get user IDs by email (after they've signed up)
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@demo.com' LIMIT 1;
  SELECT id INTO regular_user_id FROM auth.users WHERE email = 'user@demo.com' LIMIT 1;
  
  -- Update admin user role if they exist
  IF admin_user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE user_id = admin_user_id;
  END IF;
  
  -- Regular user will already have 'read_only' role by default
  -- but we can ensure it's set correctly
  IF regular_user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET role = 'read_only' 
    WHERE user_id = regular_user_id;
  END IF;
END;
$$;