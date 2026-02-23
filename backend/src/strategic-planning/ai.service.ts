import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async generateContent(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateBusinessCanvas(diagnosticAnswers: string): Promise<Record<string, string>> {
    const prompt = `Com base nas seguintes respostas do diagnóstico empresarial, gere um Business Model Canvas completo em português brasileiro.

${diagnosticAnswers}

Retorne APENAS um JSON válido com as seguintes chaves (cada valor deve ser um texto detalhado):
{
  "segmentos": "Segmentos de clientes...",
  "proposta": "Proposta de valor...",
  "canais": "Canais de distribuição...",
  "relacionamento": "Relacionamento com clientes...",
  "atividades": "Atividades-chave...",
  "recursos": "Recursos-chave...",
  "parceiros": "Parcerias-chave...",
  "custos": "Estrutura de custos...",
  "receitas": "Fontes de receita..."
}`;

    const content = await this.generateContent(prompt);
    return this.parseJson(content);
  }

  async generateEmpathyMap(diagnosticAnswers: string): Promise<Record<string, string>> {
    const prompt = `Com base nas seguintes respostas do diagnóstico empresarial, gere um Mapa de Empatia do cliente ideal em português brasileiro.

${diagnosticAnswers}

Retorne APENAS um JSON válido com as seguintes chaves:
{
  "pensamentos": "O que o cliente pensa...",
  "sentimentos": "O que o cliente sente...",
  "dores": "Quais são as dores do cliente...",
  "ganhos": "Quais ganhos o cliente busca...",
  "necessidades": "Quais são as necessidades...",
  "objecoes": "Quais são as objeções comuns..."
}`;

    const content = await this.generateContent(prompt);
    return this.parseJson(content);
  }

  async generateSwot(diagnosticAnswers: string): Promise<Record<string, string>> {
    const prompt = `Com base nas seguintes respostas do diagnóstico empresarial, gere uma análise SWOT completa em português brasileiro.

${diagnosticAnswers}

Retorne APENAS um JSON válido com as seguintes chaves:
{
  "forcas": "Forças (pontos fortes internos)...",
  "fraquezas": "Fraquezas (pontos fracos internos)...",
  "oportunidades": "Oportunidades (fatores externos positivos)...",
  "ameacas": "Ameaças (fatores externos negativos)...",
  "combinacoes": "Estratégias combinadas (SO, WO, ST, WT)..."
}`;

    const content = await this.generateContent(prompt);
    return this.parseJson(content);
  }

  async generateFilosofia(diagnosticAnswers: string): Promise<Record<string, string>> {
    const prompt = `Com base nas seguintes respostas do diagnóstico empresarial, gere a Filosofia Empresarial em português brasileiro.

${diagnosticAnswers}

Retorne APENAS um JSON válido com as seguintes chaves:
{
  "missao": "Missão da empresa (razão de existir)...",
  "visao": "Visão da empresa (onde quer chegar)...",
  "valores": "Valores da empresa (princípios que guiam)..."
}`;

    const content = await this.generateContent(prompt);
    return this.parseJson(content);
  }

  async generateOkrs(diagnosticAnswers: string): Promise<{ objetivo: string; krs: string }[]> {
    const prompt = `Com base nas seguintes respostas do diagnóstico empresarial, gere 3-5 OKRs (Objectives and Key Results) estratégicos em português brasileiro.

${diagnosticAnswers}

Retorne APENAS um JSON válido no formato array:
[
  {
    "objetivo": "Objetivo estratégico 1...",
    "krs": "KR1: ...; KR2: ...; KR3: ..."
  }
]`;

    const content = await this.generateContent(prompt);
    return this.parseJson(content);
  }

  async generateIndicators(diagnosticAnswers: string): Promise<Array<Record<string, string>>> {
    const prompt = `Com base nas seguintes respostas do diagnóstico empresarial, gere 5-7 indicadores (KPIs) estratégicos em português brasileiro.

${diagnosticAnswers}

Retorne APENAS um JSON válido no formato array:
[
  {
    "nome": "Nome do indicador",
    "descricao": "Descrição do que mede",
    "meta": "Meta a ser alcançada",
    "origem": "Origem dos dados"
  }
]`;

    const content = await this.generateContent(prompt);
    return this.parseJson(content);
  }

  async generateActionPlan(diagnosticAnswers: string): Promise<Array<Record<string, string>>> {
    const prompt = `Com base nas seguintes respostas do diagnóstico empresarial, gere 6-10 ações estratégicas em português brasileiro.

${diagnosticAnswers}

Retorne APENAS um JSON válido no formato array:
[
  {
    "acao": "Descrição da ação",
    "origem": "OKR ou objetivo relacionado",
    "responsavel": "Cargo ou área responsável",
    "prazo": "Prazo sugerido (ex: 30 dias, Q1 2026)",
    "status": "Não iniciado"
  }
]`;

    const content = await this.generateContent(prompt);
    return this.parseJson(content);
  }

  async generateRoutines(diagnosticAnswers: string): Promise<Record<string, string>> {
    const prompt = `Com base nas seguintes respostas do diagnóstico empresarial, gere rotinas de gestão em português brasileiro.

${diagnosticAnswers}

Retorne APENAS um JSON válido com as seguintes chaves:
{
  "semanal": "Rotinas semanais recomendadas...",
  "mensal": "Rotinas mensais recomendadas...",
  "trimestral": "Rotinas trimestrais recomendadas...",
  "anual": "Rotinas anuais recomendadas..."
}`;

    const content = await this.generateContent(prompt);
    return this.parseJson(content);
  }

  private parseJson(content: string): any {
    const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Não foi possível extrair JSON da resposta');
  }
}
