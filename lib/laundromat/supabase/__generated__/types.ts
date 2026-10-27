export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.0.2";
  };
  laundro_cafe: {
    Tables: {
      entry_reports: {
        Row: {
          created_at: string;
          entry_id: number;
          id: number;
          reason: string | null;
          visitor_id: string;
        };
        Insert: {
          created_at?: string;
          entry_id: number;
          id?: never;
          reason?: string | null;
          visitor_id: string;
        };
        Update: {
          created_at?: string;
          entry_id?: number;
          id?: never;
          reason?: string | null;
          visitor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entry_reports_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "notebook_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      notebook_entries: {
        Row: {
          body: string;
          created_at: string;
          drawing: Json | null;
          hidden_at: string | null;
          id: number;
          kind: string;
          line_count: number;
          line_start: number;
          notebook_id: number;
          page: number;
          report_count: number;
          script: string;
          sign_off: string | null;
        };
        Insert: {
          body: string;
          created_at?: string;
          drawing?: Json | null;
          hidden_at?: string | null;
          id?: never;
          kind?: string;
          line_count: number;
          line_start: number;
          notebook_id: number;
          page: number;
          report_count?: number;
          script: string;
          sign_off?: string | null;
        };
        Update: {
          body?: string;
          created_at?: string;
          drawing?: Json | null;
          hidden_at?: string | null;
          id?: never;
          kind?: string;
          line_count?: number;
          line_start?: number;
          notebook_id?: number;
          page?: number;
          report_count?: number;
          script?: string;
          sign_off?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notebook_entries_notebook_id_fkey";
            columns: ["notebook_id"];
            isOneToOne: false;
            referencedRelation: "notebooks";
            referencedColumns: ["id"];
          },
        ];
      };
      notebook_entry_authors: {
        Row: {
          created_at: string;
          entry_id: number;
          visitor_id: string;
        };
        Insert: {
          created_at?: string;
          entry_id: number;
          visitor_id: string;
        };
        Update: {
          created_at?: string;
          entry_id?: number;
          visitor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notebook_entry_authors_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: true;
            referencedRelation: "notebook_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      notebooks: {
        Row: {
          filled_at: string | null;
          id: number;
          lines_per_page: number;
          lines_used: number;
          number: number;
          page_count: number;
          started_at: string;
        };
        Insert: {
          filled_at?: string | null;
          id?: never;
          lines_per_page?: number;
          lines_used?: number;
          number: number;
          page_count?: number;
          started_at?: string;
        };
        Update: {
          filled_at?: string | null;
          id?: never;
          lines_per_page?: number;
          lines_used?: number;
          number?: number;
          page_count?: number;
          started_at?: string;
        };
        Relationships: [];
      };
      theme_schedules: {
        Row: {
          enabled: boolean;
          end_day: number;
          end_month: number;
          id: string;
          priority: number;
          start_day: number;
          start_month: number;
          theme_id: string;
          time_zone: string;
        };
        Insert: {
          enabled?: boolean;
          end_day: number;
          end_month: number;
          id: string;
          priority?: number;
          start_day: number;
          start_month: number;
          theme_id: string;
          time_zone?: string;
        };
        Update: {
          enabled?: boolean;
          end_day?: number;
          end_month?: number;
          id?: string;
          priority?: number;
          start_day?: number;
          start_month?: number;
          theme_id?: string;
          time_zone?: string;
        };
        Relationships: [];
      };
      tip_spends: {
        Row: {
          attempt: string;
          machine_id: string | null;
          spent_at: string;
          tip_number: number;
        };
        Insert: {
          attempt: string;
          machine_id?: string | null;
          spent_at?: string;
          tip_number: number;
        };
        Update: {
          attempt?: string;
          machine_id?: string | null;
          spent_at?: string;
          tip_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "tip_spends_tip_number_fkey";
            columns: ["tip_number"];
            isOneToOne: false;
            referencedRelation: "tips";
            referencedColumns: ["number"];
          },
        ];
      };
      tips: {
        Row: {
          amount_cents: number;
          created_at: string;
          currency: string;
          email: string | null;
          number: number;
          session_id: string;
          token_hash: string;
          uses: number;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          currency?: string;
          email?: string | null;
          number: number;
          session_id: string;
          token_hash: string;
          uses?: number;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          email?: string | null;
          number?: number;
          session_id?: string;
          token_hash?: string;
          uses?: number;
        };
        Relationships: [];
      };
      visits: {
        Row: {
          country: string | null;
          first_seen_at: string;
          last_seen_at: string;
          locale: string;
          referrer_host: string | null;
          visit_count: number;
          visited_on: string;
          visitor_id: string;
        };
        Insert: {
          country?: string | null;
          first_seen_at?: string;
          last_seen_at?: string;
          locale: string;
          referrer_host?: string | null;
          visit_count?: number;
          visited_on: string;
          visitor_id: string;
        };
        Update: {
          country?: string | null;
          first_seen_at?: string;
          last_seen_at?: string;
          locale?: string;
          referrer_host?: string | null;
          visit_count?: number;
          visited_on?: string;
          visitor_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      append_doodle: {
        Args: { p_drawing: Json; p_line_count: number; p_visitor_id: string };
        Returns: {
          body: string;
          created_at: string;
          drawing: Json | null;
          hidden_at: string | null;
          id: number;
          kind: string;
          line_count: number;
          line_start: number;
          notebook_id: number;
          page: number;
          report_count: number;
          script: string;
          sign_off: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "notebook_entries";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      append_entry: {
        Args: {
          p_body: string;
          p_line_count: number;
          p_script: string;
          p_sign_off: string;
          p_visitor_id: string;
        };
        Returns: {
          body: string;
          created_at: string;
          drawing: Json | null;
          hidden_at: string | null;
          id: number;
          kind: string;
          line_count: number;
          line_start: number;
          notebook_id: number;
          page: number;
          report_count: number;
          script: string;
          sign_off: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "notebook_entries";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      fulfill_tip: {
        Args: {
          p_amount_cents: number;
          p_email?: string;
          p_session_id: string;
          p_token_hash: string;
          p_uses?: number;
        };
        Returns: {
          amount_cents: number;
          created_at: string;
          currency: string;
          email: string | null;
          number: number;
          session_id: string;
          token_hash: string;
          uses: number;
        };
        SetofOptions: {
          from: "*";
          to: "tips";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      record_visit: {
        Args: {
          p_country?: string;
          p_locale: string;
          p_referrer_host?: string;
          p_visitor_id: string;
        };
        Returns: undefined;
      };
      spend_tip: {
        Args: { p_attempt: string; p_machine_id: string; p_token_hash: string };
        Returns: {
          outcome: string;
          spent_at: string;
          uses_left: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  laundro_cafe: {
    Enums: {},
  },
} as const;
