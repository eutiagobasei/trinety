-- Create system_admins table for super admin access
CREATE TABLE public.system_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.system_admins ENABLE ROW LEVEL SECURITY;

-- Only system admins can view this table
CREATE POLICY "Only system admins can view system_admins"
ON public.system_admins FOR SELECT
USING (user_id = auth.uid());

-- Create function to check if user is system admin
CREATE OR REPLACE FUNCTION public.is_system_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.system_admins
    WHERE user_id = _user_id
  )
$$;

-- Insert tiago@hsfg.com.br as super admin
INSERT INTO public.system_admins (user_id) 
VALUES ('3c8edfc9-e029-4702-8459-3c0b7968e9f8');

-- Update organizations policy to allow super admin full access
CREATE POLICY "Super admins can view all organizations"
ON public.organizations FOR SELECT
USING (is_system_admin(auth.uid()));

CREATE POLICY "Super admins can update all organizations"
ON public.organizations FOR UPDATE
USING (is_system_admin(auth.uid()));

CREATE POLICY "Super admins can delete organizations"
ON public.organizations FOR DELETE
USING (is_system_admin(auth.uid()));

-- Update profiles policy for super admin
CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_system_admin(auth.uid()));

CREATE POLICY "Super admins can update all profiles"
ON public.profiles FOR UPDATE
USING (is_system_admin(auth.uid()));

-- Update subscriptions policy for super admin
CREATE POLICY "Super admins can view all subscriptions"
ON public.subscriptions FOR SELECT
USING (is_system_admin(auth.uid()));

CREATE POLICY "Super admins can update all subscriptions"
ON public.subscriptions FOR UPDATE
USING (is_system_admin(auth.uid()));

CREATE POLICY "Super admins can insert subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (is_system_admin(auth.uid()));

-- Update user_organizations for super admin
CREATE POLICY "Super admins can view all user_organizations"
ON public.user_organizations FOR SELECT
USING (is_system_admin(auth.uid()));

CREATE POLICY "Super admins can manage all user_organizations"
ON public.user_organizations FOR ALL
USING (is_system_admin(auth.uid()));

-- Update plans policy for super admin management
CREATE POLICY "Super admins can manage plans"
ON public.plans FOR ALL
USING (is_system_admin(auth.uid()));