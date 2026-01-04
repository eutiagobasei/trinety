-- 1. Create user_organizations table for many-to-many relationship
CREATE TABLE public.user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'usuario',
  is_owner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

-- 2. Add active_organization_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN active_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 3. Enable RLS on user_organizations
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check org access
CREATE OR REPLACE FUNCTION public.has_org_access(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- 5. Create function to get user's role in an organization
CREATE OR REPLACE FUNCTION public.get_user_org_role(_user_id UUID, _org_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_organizations
  WHERE user_id = _user_id
    AND organization_id = _org_id
$$;

-- 6. Create function to get active organization
CREATE OR REPLACE FUNCTION public.get_active_organization(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT active_organization_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- 7. Update has_role function to check role in active organization
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations uo
    JOIN public.profiles p ON p.active_organization_id = uo.organization_id
    WHERE uo.user_id = _user_id
      AND p.id = _user_id
      AND uo.role = _role
  )
$$;

-- 8. Update get_user_organization to return active org
CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT active_organization_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- 9. RLS policies for user_organizations
-- Users can view their own organization memberships
CREATE POLICY "Users can view their org memberships"
ON public.user_organizations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can view members of orgs they belong to
CREATE POLICY "Users can view org members"
ON public.user_organizations
FOR SELECT
TO authenticated
USING (has_org_access(auth.uid(), organization_id));

-- Users can insert their own membership (when creating or joining)
CREATE POLICY "Users can create their own membership"
ON public.user_organizations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Owners can manage memberships in their organizations
CREATE POLICY "Owners can manage org memberships"
ON public.user_organizations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_organizations
    WHERE user_id = auth.uid()
      AND organization_id = user_organizations.organization_id
      AND is_owner = true
  )
);

-- Users can delete their own membership (leave org)
CREATE POLICY "Users can leave organizations"
ON public.user_organizations
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND is_owner = false);

-- 10. Fix organizations INSERT policy to be PERMISSIVE
DROP POLICY IF EXISTS "Anyone can create an organization" ON public.organizations;

CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 11. Update organizations SELECT policy to allow users to see orgs they belong to
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;

CREATE POLICY "Users can view organizations they belong to"
ON public.organizations
FOR SELECT
TO authenticated
USING (has_org_access(auth.uid(), id));

-- 12. Update trigger for updated_at
CREATE TRIGGER update_user_organizations_updated_at
BEFORE UPDATE ON public.user_organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Migrate existing data from profiles.organization_id and user_roles to user_organizations
INSERT INTO public.user_organizations (user_id, organization_id, role, is_owner)
SELECT 
  p.id as user_id,
  p.organization_id,
  COALESCE(ur.role, 'usuario'::app_role) as role,
  (ur.role = 'admin') as is_owner
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
WHERE p.organization_id IS NOT NULL
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- 14. Set active_organization_id from existing organization_id
UPDATE public.profiles
SET active_organization_id = organization_id
WHERE organization_id IS NOT NULL;