-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'gestor', 'usuario');

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table linked to organizations
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'usuario',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create module_permissions table for granular permissions
CREATE TABLE public.module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  module TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_manage BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (organization_id, role, module)
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Function to check module permission
CREATE OR REPLACE FUNCTION public.has_module_permission(_user_id UUID, _module TEXT, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id UUID;
  _role app_role;
  _has_permission BOOLEAN := false;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO _org_id FROM public.profiles WHERE id = _user_id;
  
  IF _org_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user's role
  SELECT role INTO _role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
  
  IF _role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Admin has all permissions
  IF _role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check specific permission
  SELECT 
    CASE 
      WHEN _permission = 'view' THEN can_view
      WHEN _permission = 'edit' THEN can_edit
      WHEN _permission = 'manage' THEN can_manage
      ELSE false
    END INTO _has_permission
  FROM public.module_permissions
  WHERE organization_id = _org_id
    AND role = _role
    AND module = _module;
  
  RETURN COALESCE(_has_permission, false);
END;
$$;

-- Function to generate unique company code
CREATE OR REPLACE FUNCTION public.generate_company_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM public.organizations WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Trigger to auto-generate company code
CREATE OR REPLACE FUNCTION public.set_company_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := public.generate_company_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_company_code
BEFORE INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.set_company_code();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (id = public.get_user_organization(auth.uid()));

CREATE POLICY "Anyone can create an organization"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update their organization"
ON public.organizations
FOR UPDATE
TO authenticated
USING (id = public.get_user_organization(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their organization"
ON public.profiles
FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()) OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their organization"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT p.id FROM public.profiles p 
    WHERE p.organization_id = public.get_user_organization(auth.uid())
  )
);

CREATE POLICY "Admins can manage roles in their organization"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') AND
  user_id IN (
    SELECT p.id FROM public.profiles p 
    WHERE p.organization_id = public.get_user_organization(auth.uid())
  )
);

CREATE POLICY "Users can insert their own initial role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies for module_permissions
CREATE POLICY "Users can view permissions for their organization"
ON public.module_permissions
FOR SELECT
TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Admins can manage permissions for their organization"
ON public.module_permissions
FOR ALL
TO authenticated
USING (
  organization_id = public.get_user_organization(auth.uid()) AND
  public.has_role(auth.uid(), 'admin')
);

-- Add organization_id to existing tables
ALTER TABLE public.business_model_canvas ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.empathy_map ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.filosofia ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.swot_analysis ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.okrs ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.indicators ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.action_plan ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.management_routines ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.diagnostics ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.diagnostic_answers ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Update RLS policies for existing tables to use organization_id
DROP POLICY IF EXISTS "Allow public read access to business_model_canvas" ON public.business_model_canvas;
DROP POLICY IF EXISTS "Allow public insert access to business_model_canvas" ON public.business_model_canvas;
DROP POLICY IF EXISTS "Allow public update access to business_model_canvas" ON public.business_model_canvas;

CREATE POLICY "Users can view canvas in their organization"
ON public.business_model_canvas FOR SELECT TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can insert canvas in their organization"
ON public.business_model_canvas FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update canvas in their organization"
ON public.business_model_canvas FOR UPDATE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can delete canvas in their organization"
ON public.business_model_canvas FOR DELETE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

-- Update empathy_map policies
DROP POLICY IF EXISTS "Allow public read access to empathy_map" ON public.empathy_map;
DROP POLICY IF EXISTS "Allow public insert access to empathy_map" ON public.empathy_map;
DROP POLICY IF EXISTS "Allow public update access to empathy_map" ON public.empathy_map;

CREATE POLICY "Users can view empathy_map in their organization"
ON public.empathy_map FOR SELECT TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can insert empathy_map in their organization"
ON public.empathy_map FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update empathy_map in their organization"
ON public.empathy_map FOR UPDATE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

-- Update filosofia policies
DROP POLICY IF EXISTS "Allow public read access to filosofia" ON public.filosofia;
DROP POLICY IF EXISTS "Allow public insert access to filosofia" ON public.filosofia;
DROP POLICY IF EXISTS "Allow public update access to filosofia" ON public.filosofia;

CREATE POLICY "Users can view filosofia in their organization"
ON public.filosofia FOR SELECT TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can insert filosofia in their organization"
ON public.filosofia FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update filosofia in their organization"
ON public.filosofia FOR UPDATE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

-- Update swot_analysis policies
DROP POLICY IF EXISTS "Allow public read access to swot_analysis" ON public.swot_analysis;
DROP POLICY IF EXISTS "Allow public insert access to swot_analysis" ON public.swot_analysis;
DROP POLICY IF EXISTS "Allow public update access to swot_analysis" ON public.swot_analysis;

CREATE POLICY "Users can view swot in their organization"
ON public.swot_analysis FOR SELECT TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can insert swot in their organization"
ON public.swot_analysis FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update swot in their organization"
ON public.swot_analysis FOR UPDATE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

-- Update okrs policies
DROP POLICY IF EXISTS "Allow public read access to okrs" ON public.okrs;
DROP POLICY IF EXISTS "Allow public insert access to okrs" ON public.okrs;
DROP POLICY IF EXISTS "Allow public update access to okrs" ON public.okrs;

CREATE POLICY "Users can view okrs in their organization"
ON public.okrs FOR SELECT TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can insert okrs in their organization"
ON public.okrs FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update okrs in their organization"
ON public.okrs FOR UPDATE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

-- Update indicators policies
DROP POLICY IF EXISTS "Allow public read access to indicators" ON public.indicators;
DROP POLICY IF EXISTS "Allow public insert access to indicators" ON public.indicators;
DROP POLICY IF EXISTS "Allow public update access to indicators" ON public.indicators;
DROP POLICY IF EXISTS "Allow public delete access to indicators" ON public.indicators;

CREATE POLICY "Users can view indicators in their organization"
ON public.indicators FOR SELECT TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can insert indicators in their organization"
ON public.indicators FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update indicators in their organization"
ON public.indicators FOR UPDATE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can delete indicators in their organization"
ON public.indicators FOR DELETE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

-- Update action_plan policies
DROP POLICY IF EXISTS "Allow public read access to action_plan" ON public.action_plan;
DROP POLICY IF EXISTS "Allow public insert access to action_plan" ON public.action_plan;
DROP POLICY IF EXISTS "Allow public update access to action_plan" ON public.action_plan;
DROP POLICY IF EXISTS "Allow public delete access to action_plan" ON public.action_plan;

CREATE POLICY "Users can view action_plan in their organization"
ON public.action_plan FOR SELECT TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can insert action_plan in their organization"
ON public.action_plan FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update action_plan in their organization"
ON public.action_plan FOR UPDATE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can delete action_plan in their organization"
ON public.action_plan FOR DELETE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

-- Update management_routines policies
DROP POLICY IF EXISTS "Allow public read access to management_routines" ON public.management_routines;
DROP POLICY IF EXISTS "Allow public insert access to management_routines" ON public.management_routines;
DROP POLICY IF EXISTS "Allow public update access to management_routines" ON public.management_routines;

CREATE POLICY "Users can view routines in their organization"
ON public.management_routines FOR SELECT TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can insert routines in their organization"
ON public.management_routines FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update routines in their organization"
ON public.management_routines FOR UPDATE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

-- Update diagnostics policies
DROP POLICY IF EXISTS "Allow public read access to diagnostics" ON public.diagnostics;
DROP POLICY IF EXISTS "Allow public insert access to diagnostics" ON public.diagnostics;
DROP POLICY IF EXISTS "Allow public update access to diagnostics" ON public.diagnostics;

CREATE POLICY "Users can view diagnostics in their organization"
ON public.diagnostics FOR SELECT TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can insert diagnostics in their organization"
ON public.diagnostics FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update diagnostics in their organization"
ON public.diagnostics FOR UPDATE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

-- Update diagnostic_answers policies
DROP POLICY IF EXISTS "Allow public read access to diagnostic_answers" ON public.diagnostic_answers;
DROP POLICY IF EXISTS "Allow public insert access to diagnostic_answers" ON public.diagnostic_answers;
DROP POLICY IF EXISTS "Allow public update access to diagnostic_answers" ON public.diagnostic_answers;

CREATE POLICY "Users can view diagnostic_answers in their organization"
ON public.diagnostic_answers FOR SELECT TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can insert diagnostic_answers in their organization"
ON public.diagnostic_answers FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update diagnostic_answers in their organization"
ON public.diagnostic_answers FOR UPDATE TO authenticated
USING (organization_id = public.get_user_organization(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_module_permissions_updated_at
BEFORE UPDATE ON public.module_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();