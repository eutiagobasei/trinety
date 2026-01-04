CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: action_plan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_plan (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    acao text,
    origem text,
    responsavel text,
    prazo text,
    status text,
    obs text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: business_model_canvas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_model_canvas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    segmentos text,
    proposta text,
    canais text,
    relacionamento text,
    atividades text,
    recursos text,
    parceiros text,
    custos text,
    receitas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: diagnostic_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diagnostic_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    diagnostic_id uuid NOT NULL,
    block_index integer NOT NULL,
    question_index integer NOT NULL,
    answer text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: diagnostics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diagnostics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: empathy_map; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empathy_map (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    dores text,
    ganhos text,
    necessidades text,
    pensamentos text,
    sentimentos text,
    objecoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: filosofia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.filosofia (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    visao text,
    missao text,
    valores text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: indicators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.indicators (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    nome text,
    descricao text,
    meta text,
    origem text,
    mensal text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: management_routines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.management_routines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    semanal text,
    mensal text,
    trimestral text,
    anual text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: okrs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.okrs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    objetivo text,
    krs text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: swot_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.swot_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    forcas text,
    fraquezas text,
    oportunidades text,
    ameacas text,
    combinacoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: action_plan action_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_plan
    ADD CONSTRAINT action_plan_pkey PRIMARY KEY (id);


--
-- Name: business_model_canvas business_model_canvas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_model_canvas
    ADD CONSTRAINT business_model_canvas_pkey PRIMARY KEY (id);


--
-- Name: business_model_canvas business_model_canvas_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_model_canvas
    ADD CONSTRAINT business_model_canvas_session_id_key UNIQUE (session_id);


--
-- Name: diagnostic_answers diagnostic_answers_diagnostic_id_block_index_question_index_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnostic_answers
    ADD CONSTRAINT diagnostic_answers_diagnostic_id_block_index_question_index_key UNIQUE (diagnostic_id, block_index, question_index);


--
-- Name: diagnostic_answers diagnostic_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnostic_answers
    ADD CONSTRAINT diagnostic_answers_pkey PRIMARY KEY (id);


--
-- Name: diagnostics diagnostics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnostics
    ADD CONSTRAINT diagnostics_pkey PRIMARY KEY (id);


--
-- Name: diagnostics diagnostics_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnostics
    ADD CONSTRAINT diagnostics_session_id_key UNIQUE (session_id);


--
-- Name: empathy_map empathy_map_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empathy_map
    ADD CONSTRAINT empathy_map_pkey PRIMARY KEY (id);


--
-- Name: filosofia filosofia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filosofia
    ADD CONSTRAINT filosofia_pkey PRIMARY KEY (id);


--
-- Name: indicators indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.indicators
    ADD CONSTRAINT indicators_pkey PRIMARY KEY (id);


--
-- Name: management_routines management_routines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.management_routines
    ADD CONSTRAINT management_routines_pkey PRIMARY KEY (id);


--
-- Name: okrs okrs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.okrs
    ADD CONSTRAINT okrs_pkey PRIMARY KEY (id);


--
-- Name: swot_analysis swot_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swot_analysis
    ADD CONSTRAINT swot_analysis_pkey PRIMARY KEY (id);


--
-- Name: idx_business_model_canvas_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_model_canvas_session_id ON public.business_model_canvas USING btree (session_id);


--
-- Name: idx_diagnostic_answers_diagnostic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_diagnostic_answers_diagnostic_id ON public.diagnostic_answers USING btree (diagnostic_id);


--
-- Name: idx_diagnostics_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_diagnostics_session_id ON public.diagnostics USING btree (session_id);


--
-- Name: action_plan update_action_plan_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_action_plan_updated_at BEFORE UPDATE ON public.action_plan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: business_model_canvas update_business_model_canvas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_model_canvas_updated_at BEFORE UPDATE ON public.business_model_canvas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: diagnostic_answers update_diagnostic_answers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_diagnostic_answers_updated_at BEFORE UPDATE ON public.diagnostic_answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: diagnostics update_diagnostics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_diagnostics_updated_at BEFORE UPDATE ON public.diagnostics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: empathy_map update_empathy_map_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_empathy_map_updated_at BEFORE UPDATE ON public.empathy_map FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: filosofia update_filosofia_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_filosofia_updated_at BEFORE UPDATE ON public.filosofia FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: indicators update_indicators_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_indicators_updated_at BEFORE UPDATE ON public.indicators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: management_routines update_management_routines_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_management_routines_updated_at BEFORE UPDATE ON public.management_routines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: okrs update_okrs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_okrs_updated_at BEFORE UPDATE ON public.okrs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: swot_analysis update_swot_analysis_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_swot_analysis_updated_at BEFORE UPDATE ON public.swot_analysis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: diagnostic_answers diagnostic_answers_diagnostic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diagnostic_answers
    ADD CONSTRAINT diagnostic_answers_diagnostic_id_fkey FOREIGN KEY (diagnostic_id) REFERENCES public.diagnostics(id) ON DELETE CASCADE;


--
-- Name: action_plan Allow public delete access to action_plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public delete access to action_plan" ON public.action_plan FOR DELETE USING (true);


--
-- Name: indicators Allow public delete access to indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public delete access to indicators" ON public.indicators FOR DELETE USING (true);


--
-- Name: action_plan Allow public insert access to action_plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to action_plan" ON public.action_plan FOR INSERT WITH CHECK (true);


--
-- Name: business_model_canvas Allow public insert access to business_model_canvas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to business_model_canvas" ON public.business_model_canvas FOR INSERT WITH CHECK (true);


--
-- Name: diagnostic_answers Allow public insert access to diagnostic_answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to diagnostic_answers" ON public.diagnostic_answers FOR INSERT WITH CHECK (true);


--
-- Name: diagnostics Allow public insert access to diagnostics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to diagnostics" ON public.diagnostics FOR INSERT WITH CHECK (true);


--
-- Name: empathy_map Allow public insert access to empathy_map; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to empathy_map" ON public.empathy_map FOR INSERT WITH CHECK (true);


--
-- Name: filosofia Allow public insert access to filosofia; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to filosofia" ON public.filosofia FOR INSERT WITH CHECK (true);


--
-- Name: indicators Allow public insert access to indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to indicators" ON public.indicators FOR INSERT WITH CHECK (true);


--
-- Name: management_routines Allow public insert access to management_routines; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to management_routines" ON public.management_routines FOR INSERT WITH CHECK (true);


--
-- Name: okrs Allow public insert access to okrs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to okrs" ON public.okrs FOR INSERT WITH CHECK (true);


--
-- Name: swot_analysis Allow public insert access to swot_analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to swot_analysis" ON public.swot_analysis FOR INSERT WITH CHECK (true);


--
-- Name: action_plan Allow public read access to action_plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to action_plan" ON public.action_plan FOR SELECT USING (true);


--
-- Name: business_model_canvas Allow public read access to business_model_canvas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to business_model_canvas" ON public.business_model_canvas FOR SELECT USING (true);


--
-- Name: diagnostic_answers Allow public read access to diagnostic_answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to diagnostic_answers" ON public.diagnostic_answers FOR SELECT USING (true);


--
-- Name: diagnostics Allow public read access to diagnostics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to diagnostics" ON public.diagnostics FOR SELECT USING (true);


--
-- Name: empathy_map Allow public read access to empathy_map; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to empathy_map" ON public.empathy_map FOR SELECT USING (true);


--
-- Name: filosofia Allow public read access to filosofia; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to filosofia" ON public.filosofia FOR SELECT USING (true);


--
-- Name: indicators Allow public read access to indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to indicators" ON public.indicators FOR SELECT USING (true);


--
-- Name: management_routines Allow public read access to management_routines; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to management_routines" ON public.management_routines FOR SELECT USING (true);


--
-- Name: okrs Allow public read access to okrs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to okrs" ON public.okrs FOR SELECT USING (true);


--
-- Name: swot_analysis Allow public read access to swot_analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to swot_analysis" ON public.swot_analysis FOR SELECT USING (true);


--
-- Name: action_plan Allow public update access to action_plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to action_plan" ON public.action_plan FOR UPDATE USING (true);


--
-- Name: business_model_canvas Allow public update access to business_model_canvas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to business_model_canvas" ON public.business_model_canvas FOR UPDATE USING (true);


--
-- Name: diagnostic_answers Allow public update access to diagnostic_answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to diagnostic_answers" ON public.diagnostic_answers FOR UPDATE USING (true);


--
-- Name: diagnostics Allow public update access to diagnostics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to diagnostics" ON public.diagnostics FOR UPDATE USING (true);


--
-- Name: empathy_map Allow public update access to empathy_map; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to empathy_map" ON public.empathy_map FOR UPDATE USING (true);


--
-- Name: filosofia Allow public update access to filosofia; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to filosofia" ON public.filosofia FOR UPDATE USING (true);


--
-- Name: indicators Allow public update access to indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to indicators" ON public.indicators FOR UPDATE USING (true);


--
-- Name: management_routines Allow public update access to management_routines; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to management_routines" ON public.management_routines FOR UPDATE USING (true);


--
-- Name: okrs Allow public update access to okrs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to okrs" ON public.okrs FOR UPDATE USING (true);


--
-- Name: swot_analysis Allow public update access to swot_analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to swot_analysis" ON public.swot_analysis FOR UPDATE USING (true);


--
-- Name: action_plan; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.action_plan ENABLE ROW LEVEL SECURITY;

--
-- Name: business_model_canvas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_model_canvas ENABLE ROW LEVEL SECURITY;

--
-- Name: diagnostic_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.diagnostic_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: diagnostics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

--
-- Name: empathy_map; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.empathy_map ENABLE ROW LEVEL SECURITY;

--
-- Name: filosofia; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.filosofia ENABLE ROW LEVEL SECURITY;

--
-- Name: indicators; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;

--
-- Name: management_routines; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.management_routines ENABLE ROW LEVEL SECURITY;

--
-- Name: okrs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.okrs ENABLE ROW LEVEL SECURITY;

--
-- Name: swot_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.swot_analysis ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;