-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view org members" ON user_organizations;
DROP POLICY IF EXISTS "Owners can manage org memberships" ON user_organizations;

-- Recreate has_org_access function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.has_org_access(_user_id uuid, _org_id uuid)
RETURNS boolean
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

-- Create new policies without infinite recursion
-- Users can view members of organizations they belong to
CREATE POLICY "Users can view org members"
ON user_organizations FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT uo.organization_id 
    FROM user_organizations uo 
    WHERE uo.user_id = auth.uid()
  )
);

-- Owners can manage memberships in their organizations
CREATE POLICY "Owners can manage org memberships"
ON user_organizations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_organizations uo
    WHERE uo.user_id = auth.uid()
      AND uo.organization_id = user_organizations.organization_id
      AND uo.is_owner = true
  )
);