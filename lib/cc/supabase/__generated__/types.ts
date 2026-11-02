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
    PostgrestVersion: "12.0.2"
  }
  command_center: {
    Tables: {
      campaigns: {
        Row: {
          created_at: string
          id: string
          link: string | null
          name: string
          notes: string | null
          plan: Json
          starts_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          name: string
          notes?: string | null
          plan?: Json
          starts_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          name?: string
          notes?: string | null
          plan?: Json
          starts_at?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          access_token: string
          expires_at: string | null
          provider: string
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          access_token: string
          expires_at?: string | null
          provider: string
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          access_token?: string
          expires_at?: string | null
          provider?: string
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      keyword_counts: {
        Row: {
          count: number
          day: string
          fetched_at: string
          keyword_id: string
          source: string
        }
        Insert: {
          count: number
          day: string
          fetched_at?: string
          keyword_id: string
          source?: string
        }
        Update: {
          count?: number
          day?: string
          fetched_at?: string
          keyword_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_counts_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          term: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          term: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          term?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          body: string
          campaign_id: string
          created_at: string
          id: string
        }
        Insert: {
          body: string
          campaign_id: string
          created_at?: string
          id?: string
        }
        Update: {
          body?: string
          campaign_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      post_metrics: {
        Row: {
          captured_at: string
          checkpoint: string
          clicks: number | null
          comments: number | null
          id: number
          likes: number | null
          post_id: string
          rank: number | null
          saves: number | null
          shares: number | null
          upvotes: number | null
          views: number | null
        }
        Insert: {
          captured_at?: string
          checkpoint: string
          clicks?: number | null
          comments?: number | null
          id?: never
          likes?: number | null
          post_id: string
          rank?: number | null
          saves?: number | null
          shares?: number | null
          upvotes?: number | null
          views?: number | null
        }
        Update: {
          captured_at?: string
          checkpoint?: string
          clicks?: number | null
          comments?: number | null
          id?: never
          likes?: number | null
          post_id?: string
          rank?: number | null
          saves?: number | null
          shares?: number | null
          upvotes?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          assets: Json
          auto_publish: boolean
          body: string
          campaign_id: string
          created_at: string
          hashtags: string[]
          id: string
          kind: string
          link: string | null
          parent_post_id: string | null
          platform_post_id: string | null
          platform: string
          posted_at: string | null
          publish_claimed_at: string | null
          publish_error: string | null
          scheduled_at: string | null
          scheduled_by: string
          status: string
          target: string | null
          title: string | null
          updated_at: string
          url: string | null
          variant: string
          variant_group: string | null
          wave: number | null
        }
        Insert: {
          assets?: Json
          auto_publish?: boolean
          body?: string
          campaign_id: string
          created_at?: string
          hashtags?: string[]
          id?: string
          kind?: string
          link?: string | null
          parent_post_id?: string | null
          platform_post_id?: string | null
          platform: string
          posted_at?: string | null
          publish_claimed_at?: string | null
          publish_error?: string | null
          scheduled_at?: string | null
          scheduled_by?: string
          status?: string
          target?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
          variant?: string
          variant_group?: string | null
          wave?: number | null
        }
        Update: {
          assets?: Json
          auto_publish?: boolean
          body?: string
          campaign_id?: string
          created_at?: string
          hashtags?: string[]
          id?: string
          kind?: string
          link?: string | null
          parent_post_id?: string | null
          platform_post_id?: string | null
          platform?: string
          posted_at?: string | null
          publish_claimed_at?: string | null
          publish_error?: string | null
          scheduled_at?: string | null
          scheduled_by?: string
          status?: string
          target?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
          variant?: string
          variant_group?: string | null
          wave?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          checkpoint: string | null
          done_at: string | null
          fire_at: string
          id: number
          kind: string
          post_id: string
          sent_at: string | null
          telegram_message_id: number | null
        }
        Insert: {
          checkpoint?: string | null
          done_at?: string | null
          fire_at: string
          id?: never
          kind: string
          post_id: string
          sent_at?: string | null
          telegram_message_id?: number | null
        }
        Update: {
          checkpoint?: string | null
          done_at?: string | null
          fire_at?: string
          id?: never
          kind?: string
          post_id?: string
          sent_at?: string | null
          telegram_message_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_updates: {
        Row: {
          received_at: string
          update_id: number
        }
        Insert: {
          received_at?: string
          update_id: number
        }
        Update: {
          received_at?: string
          update_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reschedule_post: {
        Args: {
          p_post_id: string
          p_scheduled_at: string
          p_scheduled_by?: string
        }
        Returns: {
          assets: Json
          body: string
          campaign_id: string
          created_at: string
          hashtags: string[]
          id: string
          kind: string
          link: string | null
          parent_post_id: string | null
          platform: string
          posted_at: string | null
          scheduled_at: string | null
          scheduled_by: string
          status: string
          target: string | null
          title: string | null
          updated_at: string
          url: string | null
          variant: string
          variant_group: string | null
          wave: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "posts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  command_center: {
    Enums: {},
  },
} as const
