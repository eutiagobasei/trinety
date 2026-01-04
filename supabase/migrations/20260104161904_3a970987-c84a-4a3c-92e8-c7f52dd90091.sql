-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view org members" ON user_organizations;
DROP POLICY IF EXISTS "Owners can manage org memberships" ON user_organizations;

-- Create function to get user's organization IDs (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_organization_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.user_organizations
  WHERE user_id = _user_id
$$;

-- Create function to check if user is organization owner (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_organization_owner(_user_id uuid, _org_id uuid)
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
      AND is_owner = true
  )
$$;

-- Recreate policies using SECURITY DEFINER functions (no recursion)
CREATE POLICY "Users can view org members"
ON user_organizations FOR SELECT
TO authenticated
USING (
  organization_id IN (SELECT public.get_user_organization_ids(auth.uid()))
);

CREATE POLICY "Owners can manage org memberships"
ON user_organizations FOR ALL
TO authenticated
USING (
  public.is_organization_owner(auth.uid(), organization_id)
);