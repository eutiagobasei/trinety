import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiagnosticAnswer {
  block_index: number;
  question_index: number;
  answer: string;
}

interface DiagnosticData {
  sobreNegocio: string[];
  clienteIdeal: string[];
  propostaValor: string[];
  canaisRelacionamento: string[];
  experienciaCliente: string[];
  produtosReceita: string[];
  operacaoProcessos: string[];
  forcasInternas: string[];
  gargalosFraguezas: string[];
  visaoFuturo: string[];
}

const BLOCK_NAMES = [
  'sobreNegocio',
  'clienteIdeal',
  'propostaValor',
  'canaisRelacionamento',
  'experienciaCliente',
  'produtosReceita',
  'operacaoProcessos',
  'forcasInternas',
  'gargalosFraguezas',
  'visaoFuturo'
];

function organizeDiagnosticData(answers: DiagnosticAnswer[]): DiagnosticData {
  const data: DiagnosticData = {
    sobreNegocio: [],
    clienteIdeal: [],
    propostaValor: [],
    canaisRelacionamento: [],
    experienciaCliente: [],
    produtosReceita: [],
    operacaoProcessos: [],
    forcasInternas: [],
    gargalosFraguezas: [],
    visaoFuturo: []
  };

  answers.forEach(answer => {
    const blockName = BLOCK_NAMES[answer.block_index] as keyof DiagnosticData;
    if (blockName && data[blockName]) {
      data[blockName].push(answer.answer);
    }
  });

  return data;
}

async function callLovableAI(prompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  console.log('Calling Lovable AI with prompt length:', prompt.length);

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `Você é um consultor de planejamento estratégico experiente. Responda sempre em português brasileiro. 
Suas respostas devem ser práticas, objetivas e baseadas nas informações fornecidas pelo usuário.
Formate suas respostas com bullets (•) para facilitar a leitura.
Não invente informações - baseie-se apenas nos dados fornecidos.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI error:', response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error('session_id is required');
    }

    console.log('Starting strategic plan generation for session:', session_id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch diagnostic data
    const { data: diagnostic, error: diagnosticError } = await supabase
      .from('diagnostics')
      .select('id')
      .eq('session_id', session_id)
      .maybeSingle();

    if (diagnosticError || !diagnostic) {
      console.error('Diagnostic fetch error:', diagnosticError);
      throw new Error('Diagnóstico não encontrado');
    }

    const { data: answers, error: answersError } = await supabase
      .from('diagnostic_answers')
      .select('block_index, question_index, answer')
      .eq('diagnostic_id', diagnostic.id)
      .order('block_index')
      .order('question_index');

    if (answersError) {
      console.error('Answers fetch error:', answersError);
      throw new Error('Erro ao buscar respostas do diagnóstico');
    }

    console.log('Found', answers?.length || 0, 'diagnostic answers');

    const diagnosticData = organizeDiagnosticData(answers || []);
    
    const contextoDiagnostico = `
## Sobre o Negócio
${diagnosticData.sobreNegocio.join('\n')}

## Cliente Ideal
${diagnosticData.clienteIdeal.join('\n')}

## Proposta de Valor
${diagnosticData.propostaValor.join('\n')}

## Canais e Relacionamento
${diagnosticData.canaisRelacionamento.join('\n')}

## Experiência do Cliente
${diagnosticData.experienciaCliente.join('\n')}

## Produtos e Receita
${diagnosticData.produtosReceita.join('\n')}

## Operação e Processos
${diagnosticData.operacaoProcessos.join('\n')}

## Forças Internas
${diagnosticData.forcasInternas.join('\n')}

## Gargalos e Fraquezas
${diagnosticData.gargalosFraguezas.join('\n')}

## Visão de Futuro (2026)
${diagnosticData.visaoFuturo.join('\n')}
`;

    console.log('Generating Business Model Canvas...');
    const canvasPrompt = `Com base nas seguintes informações do diagnóstico estratégico:
${contextoDiagnostico}

Gere o Business Model Canvas completo com os 9 blocos. Para cada bloco, forneça de 3 a 5 itens relevantes em formato de bullets.

Responda EXATAMENTE neste formato JSON (sem markdown, apenas o JSON puro):
{
  "segmentos": "• Item 1\\n• Item 2\\n• Item 3",
  "proposta": "• Item 1\\n• Item 2\\n• Item 3",
  "canais": "• Item 1\\n• Item 2\\n• Item 3",
  "relacionamento": "• Item 1\\n• Item 2\\n• Item 3",
  "receitas": "• Item 1\\n• Item 2\\n• Item 3",
  "recursos": "• Item 1\\n• Item 2\\n• Item 3",
  "atividades": "• Item 1\\n• Item 2\\n• Item 3",
  "parceiros": "• Item 1\\n• Item 2\\n• Item 3",
  "custos": "• Item 1\\n• Item 2\\n• Item 3"
}`;

    const canvasResponse = await callLovableAI(canvasPrompt);
    let canvasData;
    try {
      const jsonMatch = canvasResponse.match(/\{[\s\S]*\}/);
      canvasData = JSON.parse(jsonMatch ? jsonMatch[0] : canvasResponse);
    } catch (e) {
      console.error('Canvas parse error:', e, canvasResponse);
      canvasData = {
        segmentos: canvasResponse,
        proposta: '',
        canais: '',
        relacionamento: '',
        receitas: '',
        recursos: '',
        atividades: '',
        parceiros: '',
        custos: ''
      };
    }

    console.log('Generating Empathy Map...');
    const empathyPrompt = `Com base nas seguintes informações do diagnóstico estratégico:
${contextoDiagnostico}

Gere o Mapa de Empatia do cliente ideal. Para cada seção, forneça de 3 a 5 itens relevantes em formato de bullets.

Responda EXATAMENTE neste formato JSON (sem markdown, apenas o JSON puro):
{
  "pensamentos": "• O que o cliente pensa\\n• Suas preocupações\\n• Seus desejos",
  "sentimentos": "• Como se sente\\n• Emoções principais\\n• Estado emocional",
  "dores": "• Frustrações\\n• Medos\\n• Obstáculos",
  "ganhos": "• O que deseja alcançar\\n• Benefícios esperados\\n• Sonhos",
  "necessidades": "• O que precisa\\n• Requisitos essenciais\\n• Expectativas",
  "objecoes": "• Barreiras para compra\\n• Dúvidas\\n• Resistências"
}`;

    const empathyResponse = await callLovableAI(empathyPrompt);
    let empathyData;
    try {
      const jsonMatch = empathyResponse.match(/\{[\s\S]*\}/);
      empathyData = JSON.parse(jsonMatch ? jsonMatch[0] : empathyResponse);
    } catch (e) {
      console.error('Empathy parse error:', e, empathyResponse);
      empathyData = {
        pensamentos: empathyResponse,
        sentimentos: '',
        dores: '',
        ganhos: '',
        necessidades: '',
        objecoes: ''
      };
    }

    console.log('Generating SWOT Analysis...');
    const swotPrompt = `Com base nas seguintes informações do diagnóstico estratégico:
${contextoDiagnostico}

Gere a Análise SWOT completa. Para cada seção, forneça de 4 a 6 itens relevantes em formato de bullets.

Responda EXATAMENTE neste formato JSON (sem markdown, apenas o JSON puro):
{
  "forcas": "• Força 1\\n• Força 2\\n• Força 3\\n• Força 4",
  "fraquezas": "• Fraqueza 1\\n• Fraqueza 2\\n• Fraqueza 3\\n• Fraqueza 4",
  "oportunidades": "• Oportunidade 1\\n• Oportunidade 2\\n• Oportunidade 3\\n• Oportunidade 4",
  "ameacas": "• Ameaça 1\\n• Ameaça 2\\n• Ameaça 3\\n• Ameaça 4",
  "combinacoes": "• FO: Usar força X para aproveitar oportunidade Y\\n• FA: Usar força X para mitigar ameaça Y\\n• DO: Superar fraqueza X para aproveitar oportunidade Y\\n• DA: Minimizar fraqueza X para evitar ameaça Y"
}`;

    const swotResponse = await callLovableAI(swotPrompt);
    let swotData;
    try {
      const jsonMatch = swotResponse.match(/\{[\s\S]*\}/);
      swotData = JSON.parse(jsonMatch ? jsonMatch[0] : swotResponse);
    } catch (e) {
      console.error('SWOT parse error:', e, swotResponse);
      swotData = {
        forcas: swotResponse,
        fraquezas: '',
        oportunidades: '',
        ameacas: '',
        combinacoes: ''
      };
    }

    console.log('Generating Philosophy...');
    const filosofiaPrompt = `Com base nas seguintes informações do diagnóstico estratégico:
${contextoDiagnostico}

Gere a Filosofia Empresarial (Missão, Visão e Valores).

Responda EXATAMENTE neste formato JSON (sem markdown, apenas o JSON puro):
{
  "missao": "Uma declaração clara de missão em 1-2 frases que define o propósito da empresa",
  "visao": "Uma declaração de visão para 2026 em 1-2 frases que define onde a empresa quer chegar",
  "valores": "• Valor 1: breve descrição\\n• Valor 2: breve descrição\\n• Valor 3: breve descrição\\n• Valor 4: breve descrição\\n• Valor 5: breve descrição"
}`;

    const filosofiaResponse = await callLovableAI(filosofiaPrompt);
    let filosofiaData;
    try {
      const jsonMatch = filosofiaResponse.match(/\{[\s\S]*\}/);
      filosofiaData = JSON.parse(jsonMatch ? jsonMatch[0] : filosofiaResponse);
    } catch (e) {
      console.error('Filosofia parse error:', e, filosofiaResponse);
      filosofiaData = {
        missao: filosofiaResponse,
        visao: '',
        valores: ''
      };
    }

    console.log('Generating OKRs...');
    const okrsPrompt = `Com base nas seguintes informações do diagnóstico estratégico:
${contextoDiagnostico}

Gere 3-4 OKRs (Objectives and Key Results) para 2026.

Responda EXATAMENTE neste formato JSON (sem markdown, apenas o JSON puro):
{
  "objetivo": "OBJETIVO PRINCIPAL PARA 2026:\\nUma declaração clara do objetivo estratégico principal",
  "krs": "KR1: Métrica específica e mensurável\\nKR2: Métrica específica e mensurável\\nKR3: Métrica específica e mensurável\\n\\nOBJETIVO 2:\\nDescrição do segundo objetivo\\n\\nKR1: Métrica específica\\nKR2: Métrica específica\\nKR3: Métrica específica"
}`;

    const okrsResponse = await callLovableAI(okrsPrompt);
    let okrsData;
    try {
      const jsonMatch = okrsResponse.match(/\{[\s\S]*\}/);
      okrsData = JSON.parse(jsonMatch ? jsonMatch[0] : okrsResponse);
    } catch (e) {
      console.error('OKRs parse error:', e, okrsResponse);
      okrsData = {
        objetivo: okrsResponse,
        krs: ''
      };
    }

    console.log('Generating Indicators (KPIs)...');
    const indicatorsPrompt = `Com base nas seguintes informações do diagnóstico estratégico:
${contextoDiagnostico}

Gere 5-7 Indicadores de Performance (KPIs) estratégicos para 2026.

Responda EXATAMENTE neste formato JSON (sem markdown, apenas o JSON puro):
{
  "indicators": [
    {
      "nome": "Nome do Indicador 1",
      "descricao": "Descrição clara do que mede",
      "meta": "Meta anual específica",
      "origem": "SWOT ou OKR relacionado"
    },
    {
      "nome": "Nome do Indicador 2",
      "descricao": "Descrição clara do que mede",
      "meta": "Meta anual específica",
      "origem": "SWOT ou OKR relacionado"
    }
  ]
}`;

    const indicatorsResponse = await callLovableAI(indicatorsPrompt);
    let indicatorsData: { indicators: Array<{ nome: string; descricao: string; meta: string; origem: string }> };
    try {
      const jsonMatch = indicatorsResponse.match(/\{[\s\S]*\}/);
      indicatorsData = JSON.parse(jsonMatch ? jsonMatch[0] : indicatorsResponse);
    } catch (e) {
      console.error('Indicators parse error:', e, indicatorsResponse);
      indicatorsData = {
        indicators: [
          { nome: 'Indicador não gerado', descricao: indicatorsResponse, meta: '', origem: '' }
        ]
      };
    }

    console.log('Generating Action Plan...');
    const actionPlanPrompt = `Com base nas seguintes informações do diagnóstico estratégico:
${contextoDiagnostico}

Gere um Plano de Ação com 6-10 ações estratégicas para 2026.

Responda EXATAMENTE neste formato JSON (sem markdown, apenas o JSON puro):
{
  "actions": [
    {
      "acao": "Descrição clara da ação a ser executada",
      "responsavel": "Cargo ou área responsável",
      "prazo": "Prazo em meses ou data",
      "status": "Não iniciado",
      "origem": "SWOT, OKR ou Canvas relacionado",
      "obs": ""
    },
    {
      "acao": "Descrição clara da ação 2",
      "responsavel": "Cargo ou área responsável",
      "prazo": "Prazo em meses ou data",
      "status": "Não iniciado",
      "origem": "SWOT, OKR ou Canvas relacionado",
      "obs": ""
    }
  ]
}`;

    const actionPlanResponse = await callLovableAI(actionPlanPrompt);
    let actionPlanData: { actions: Array<{ acao: string; responsavel: string; prazo: string; status: string; origem: string; obs: string }> };
    try {
      const jsonMatch = actionPlanResponse.match(/\{[\s\S]*\}/);
      actionPlanData = JSON.parse(jsonMatch ? jsonMatch[0] : actionPlanResponse);
    } catch (e) {
      console.error('Action Plan parse error:', e, actionPlanResponse);
      actionPlanData = {
        actions: [
          { acao: 'Ação não gerada', responsavel: '', prazo: '', status: 'Não iniciado', origem: '', obs: actionPlanResponse }
        ]
      };
    }

    console.log('Generating Management Routines...');
    const routinesPrompt = `Com base nas seguintes informações do diagnóstico estratégico:
${contextoDiagnostico}

E considerando os OKRs e Plano de Ação gerados, crie Rotinas de Gestão para garantir a execução do planejamento estratégico.

Responda EXATAMENTE neste formato JSON (sem markdown, apenas o JSON puro):
{
  "semanal": "• Reunião de alinhamento da equipe (30min)\\n• Revisão de tarefas prioritárias\\n• Check-in de indicadores críticos\\n• Resolução de bloqueios",
  "mensal": "• Análise de indicadores de performance\\n• Revisão do progresso dos OKRs\\n• Reunião de resultados com gestores\\n• Ajustes no plano de ação",
  "trimestral": "• Revisão estratégica completa\\n• Análise de tendências de mercado\\n• Avaliação de desempenho da equipe\\n• Planejamento do próximo trimestre",
  "anual": "• Revisão do planejamento estratégico\\n• Definição de novos OKRs\\n• Análise de cenário competitivo\\n• Celebração de conquistas e reconhecimento"
}`;

    const routinesResponse = await callLovableAI(routinesPrompt);
    let routinesData;
    try {
      const jsonMatch = routinesResponse.match(/\{[\s\S]*\}/);
      routinesData = JSON.parse(jsonMatch ? jsonMatch[0] : routinesResponse);
    } catch (e) {
      console.error('Routines parse error:', e, routinesResponse);
      routinesData = {
        semanal: routinesResponse,
        mensal: '',
        trimestral: '',
        anual: ''
      };
    }

    // Save all generated content
    console.log('Saving Business Model Canvas...');
    await supabase
      .from('business_model_canvas')
      .upsert({
        session_id,
        ...canvasData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id' });

    console.log('Saving Empathy Map...');
    await supabase
      .from('empathy_map')
      .upsert({
        session_id,
        ...empathyData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id' });

    console.log('Saving SWOT Analysis...');
    await supabase
      .from('swot_analysis')
      .upsert({
        session_id,
        ...swotData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id' });

    console.log('Saving Philosophy...');
    await supabase
      .from('filosofia')
      .upsert({
        session_id,
        ...filosofiaData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id' });

    console.log('Saving OKRs...');
    await supabase
      .from('okrs')
      .upsert({
        session_id,
        ...okrsData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id' });

    console.log('Saving Management Routines...');
    await supabase
      .from('management_routines')
      .upsert({
        session_id,
        ...routinesData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id' });

    console.log('Saving Indicators...');
    // Delete existing indicators for this session before inserting new ones
    await supabase
      .from('indicators')
      .delete()
      .eq('session_id', session_id);
    
    // Insert new indicators
    if (indicatorsData.indicators && indicatorsData.indicators.length > 0) {
      const indicatorsToInsert = indicatorsData.indicators.map(ind => ({
        session_id,
        nome: ind.nome,
        descricao: ind.descricao,
        meta: ind.meta,
        origem: ind.origem,
        mensal: ''
      }));
      await supabase.from('indicators').insert(indicatorsToInsert);
    }

    console.log('Saving Action Plan...');
    // Delete existing actions for this session before inserting new ones
    await supabase
      .from('action_plan')
      .delete()
      .eq('session_id', session_id);
    
    // Insert new actions
    if (actionPlanData.actions && actionPlanData.actions.length > 0) {
      const actionsToInsert = actionPlanData.actions.map(action => ({
        session_id,
        acao: action.acao,
        responsavel: action.responsavel,
        prazo: action.prazo,
        status: action.status || 'Não iniciado',
        origem: action.origem,
        obs: action.obs || ''
      }));
      await supabase.from('action_plan').insert(actionsToInsert);
    }

    console.log('Strategic plan generation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Planejamento estratégico gerado com sucesso!' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-strategic-plan:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
