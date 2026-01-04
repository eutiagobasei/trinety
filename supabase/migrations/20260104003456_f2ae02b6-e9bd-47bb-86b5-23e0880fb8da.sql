-- Fix search_path for generate_company_code function
CREATE OR REPLACE FUNCTION public.generate_company_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix search_path for set_company_code function
CREATE OR REPLACE FUNCTION public.set_company_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := public.generate_company_code();
  END IF;
  RETURN NEW;
END;
$$;