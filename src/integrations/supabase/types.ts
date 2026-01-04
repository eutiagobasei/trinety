export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      action_plan: {
        Row: {
          acao: string | null
          created_at: string
          id: string
          obs: string | null
          origem: string | null
          prazo: string | null
          responsavel: string | null
          session_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          acao?: string | null
          created_at?: string
          id?: string
          obs?: string | null
          origem?: string | null
          prazo?: string | null
          responsavel?: string | null
          session_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          acao?: string | null
          created_at?: string
          id?: string
          obs?: string | null
          origem?: string | null
          prazo?: string | null
          responsavel?: string | null
          session_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      business_model_canvas: {
        Row: {
          atividades: string | null
          canais: string | null
          created_at: string
          custos: string | null
          id: string
          parceiros: string | null
          proposta: string | null
          receitas: string | null
          recursos: string | null
          relacionamento: string | null
          segmentos: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          atividades?: string | null
          canais?: string | null
          created_at?: string
          custos?: string | null
          id?: string
          parceiros?: string | null
          proposta?: string | null
          receitas?: string | null
          recursos?: string | null
          relacionamento?: string | null
          segmentos?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          atividades?: string | null
          canais?: string | null
          created_at?: string
          custos?: string | null
          id?: string
          parceiros?: string | null
          proposta?: string | null
          receitas?: string | null
          recursos?: string | null
          relacionamento?: string | null
          segmentos?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      diagnostic_answers: {
        Row: {
          answer: string
          block_index: number
          created_at: string
          diagnostic_id: string
          id: string
          question_index: number
          updated_at: string
        }
        Insert: {
          answer: string
          block_index: number
          created_at?: string
          diagnostic_id: string
          id?: string
          question_index: number
          updated_at?: string
        }
        Update: {
          answer?: string
          block_index?: number
          created_at?: string
          diagnostic_id?: string
          id?: string
          question_index?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_answers_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          session_id: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      empathy_map: {
        Row: {
          created_at: string
          dores: string | null
          ganhos: string | null
          id: string
          necessidades: string | null
          objecoes: string | null
          pensamentos: string | null
          sentimentos: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dores?: string | null
          ganhos?: string | null
          id?: string
          necessidades?: string | null
          objecoes?: string | null
          pensamentos?: string | null
          sentimentos?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dores?: string | null
          ganhos?: string | null
          id?: string
          necessidades?: string | null
          objecoes?: string | null
          pensamentos?: string | null
          sentimentos?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      filosofia: {
        Row: {
          created_at: string
          id: string
          missao: string | null
          session_id: string
          updated_at: string
          valores: string | null
          visao: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          missao?: string | null
          session_id: string
          updated_at?: string
          valores?: string | null
          visao?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          missao?: string | null
          session_id?: string
          updated_at?: string
          valores?: string | null
          visao?: string | null
        }
        Relationships: []
      }
      indicators: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          mensal: string | null
          meta: string | null
          nome: string | null
          origem: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          mensal?: string | null
          meta?: string | null
          nome?: string | null
          origem?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          mensal?: string | null
          meta?: string | null
          nome?: string | null
          origem?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      management_routines: {
        Row: {
          anual: string | null
          created_at: string
          id: string
          mensal: string | null
          semanal: string | null
          session_id: string
          trimestral: string | null
          updated_at: string
        }
        Insert: {
          anual?: string | null
          created_at?: string
          id?: string
          mensal?: string | null
          semanal?: string | null
          session_id: string
          trimestral?: string | null
          updated_at?: string
        }
        Update: {
          anual?: string | null
          created_at?: string
          id?: string
          mensal?: string | null
          semanal?: string | null
          session_id?: string
          trimestral?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      okrs: {
        Row: {
          created_at: string
          id: string
          krs: string | null
          objetivo: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          krs?: string | null
          objetivo?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          krs?: string | null
          objetivo?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      swot_analysis: {
        Row: {
          ameacas: string | null
          combinacoes: string | null
          created_at: string
          forcas: string | null
          fraquezas: string | null
          id: string
          oportunidades: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          ameacas?: string | null
          combinacoes?: string | null
          created_at?: string
          forcas?: string | null
          fraquezas?: string | null
          id?: string
          oportunidades?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          ameacas?: string | null
          combinacoes?: string | null
          created_at?: string
          forcas?: string | null
          fraquezas?: string | null
          id?: string
          oportunidades?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
