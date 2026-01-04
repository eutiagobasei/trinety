-- Create plans table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  max_organizations INTEGER NOT NULL,
  max_users_per_org INTEGER NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for plans
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Plans are readable by everyone (public pricing)
CREATE POLICY "Plans are viewable by everyone"
ON public.plans FOR SELECT
USING (is_active = true);

-- Insert default plans
INSERT INTO public.plans (name, slug, max_organizations, max_users_per_org, price_monthly, features) VALUES
('Starter', 'starter', 1, 5, 0, '["1 empresa", "5 usuários", "Todas as ferramentas"]'),
('Pro', 'pro', 3, 15, 99, '["3 empresas", "15 usuários por empresa", "Suporte prioritário"]'),
('Enterprise', 'enterprise', 10, 50, 299, '["10 empresas", "50 usuários por empresa", "Suporte dedicado", "API access"]');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('trialing', 'active', 'canceled', 'expired'))
);

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
USING (user_id = auth.uid());

-- Users can create their own subscription
CREATE POLICY "Users can create their own subscription"
ON public.subscriptions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
ON public.subscriptions FOR UPDATE
USING (user_id = auth.uid());

-- Create organization_invites table
CREATE TABLE public.organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT,
  token TEXT UNIQUE NOT NULL,
  role app_role NOT NULL DEFAULT 'usuario',
  invited_by UUID NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for invites
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Anyone can view invite by token (for accepting)
CREATE POLICY "Anyone can view invite by token"
ON public.organization_invites FOR SELECT
USING (true);

-- Org members can create invites
CREATE POLICY "Org admins can create invites"
ON public.organization_invites FOR INSERT
WITH CHECK (
  has_org_access(auth.uid(), organization_id) AND 
  (get_user_org_role(auth.uid(), organization_id) IN ('admin', 'gestor'))
);

-- Org admins can update invites
CREATE POLICY "Org admins can update invites"
ON public.organization_invites FOR UPDATE
USING (
  has_org_access(auth.uid(), organization_id) AND 
  (get_user_org_role(auth.uid(), organization_id) IN ('admin', 'gestor'))
);

-- Org admins can delete invites
CREATE POLICY "Org admins can delete invites"
ON public.organization_invites FOR DELETE
USING (
  has_org_access(auth.uid(), organization_id) AND 
  (get_user_org_role(auth.uid(), organization_id) IN ('admin', 'gestor'))
);

-- Function to generate invite token
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    new_token := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 12));
    SELECT EXISTS(SELECT 1 FROM public.organization_invites WHERE token = new_token) INTO token_exists;
    EXIT WHEN NOT token_exists;
  END LOOP;
  RETURN new_token;
END;
$$;

-- Function to get user's subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(_user_id uuid)
RETURNS TABLE (
  id UUID,
  plan_id UUID,
  plan_name TEXT,
  plan_slug TEXT,
  max_organizations INTEGER,
  max_users_per_org INTEGER,
  status TEXT,
  trial_ends_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.plan_id,
    p.name as plan_name,
    p.slug as plan_slug,
    p.max_organizations,
    p.max_users_per_org,
    s.status,
    s.trial_ends_at
  FROM public.subscriptions s
  JOIN public.plans p ON p.id = s.plan_id
  WHERE s.user_id = _user_id
  ORDER BY s.created_at DESC
  LIMIT 1
$$;

-- Function to count user's owned organizations
CREATE OR REPLACE FUNCTION public.count_user_organizations(_user_id uuid)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.user_organizations
  WHERE user_id = _user_id AND is_owner = true
$$;

-- Function to count organization members
CREATE OR REPLACE FUNCTION public.count_organization_members(_org_id uuid)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.user_organizations
  WHERE organization_id = _org_id
$$;

-- Trigger for updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on plans
CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();