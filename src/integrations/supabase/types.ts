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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      asset_requests: {
        Row: {
          asset_id: string | null
          created_at: string
          email: string
          end_date: string
          full_name: string
          id: string
          membership_number: string | null
          phone: string
          purpose: string | null
          quantity: number
          start_date: string
          status: string
          user_id: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          email: string
          end_date: string
          full_name: string
          id?: string
          membership_number?: string | null
          phone: string
          purpose?: string | null
          quantity?: number
          start_date: string
          status?: string
          user_id?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          email?: string
          end_date?: string
          full_name?: string
          id?: string
          membership_number?: string | null
          phone?: string
          purpose?: string | null
          quantity?: number
          start_date?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_requests_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "community_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      board_members: {
        Row: {
          bio: string | null
          created_at: string
          full_name: string
          id: string
          is_current: boolean
          photo_url: string | null
          role_title: string
          sort_order: number
          term_label: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_current?: boolean
          photo_url?: string | null
          role_title: string
          sort_order?: number
          term_label: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_current?: boolean
          photo_url?: string | null
          role_title?: string
          sort_order?: number
          term_label?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          goal_amount: number
          id: string
          image_url: string | null
          raised_amount: number
          status: Database["public"]["Enums"]["campaign_status"]
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          goal_amount?: number
          id?: string
          image_url?: string | null
          raised_amount?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          goal_amount?: number
          id?: string
          image_url?: string | null
          raised_amount?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      community_assets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          member_price: number | null
          name: string
          non_member_price: number | null
          quantity: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          member_price?: number | null
          name: string
          non_member_price?: number | null
          quantity?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          member_price?: number | null
          name?: string
          non_member_price?: number | null
          quantity?: number
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_type: string | null
          file_url: string
          id: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string
          donor_name: string | null
          email: string | null
          id: string
          is_anonymous: boolean
          membership_number: string | null
          message: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string
          donor_name?: string | null
          email?: string | null
          id?: string
          is_anonymous?: boolean
          membership_number?: string | null
          message?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string
          donor_name?: string | null
          email?: string | null
          id?: string
          is_anonymous?: boolean
          membership_number?: string | null
          message?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          end_at: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          image_url: string | null
          location: string | null
          organiser: string | null
          start_at: string
          ticket_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          image_url?: string | null
          location?: string | null
          organiser?: string | null
          start_at: string
          ticket_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          image_url?: string | null
          location?: string | null
          organiser?: string | null
          start_at?: string
          ticket_url?: string | null
          title?: string
        }
        Relationships: []
      }
      galleries: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          event_date: string | null
          event_id: string | null
          id: string
          is_default: boolean
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_id?: string | null
          id?: string
          is_default?: boolean
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_id?: string | null
          id?: string
          is_default?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "galleries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_photos: {
        Row: {
          caption: string | null
          gallery_id: string
          id: string
          photo_url: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          gallery_id: string
          id?: string
          photo_url: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          gallery_id?: string
          id?: string
          photo_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_family_members: {
        Row: {
          birth_month: number
          birth_year: number
          created_at: string
          full_name: string
          id: string
          membership_id: string
          phone: string | null
          relation: Database["public"]["Enums"]["family_relation"]
        }
        Insert: {
          birth_month: number
          birth_year: number
          created_at?: string
          full_name: string
          id?: string
          membership_id: string
          phone?: string | null
          relation: Database["public"]["Enums"]["family_relation"]
        }
        Update: {
          birth_month?: number
          birth_year?: number
          created_at?: string
          full_name?: string
          id?: string
          membership_id?: string
          phone?: string | null
          relation?: Database["public"]["Enums"]["family_relation"]
        }
        Relationships: [
          {
            foreignKeyName: "membership_family_members_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          address: string
          amount_paid: number | null
          birth_month: number
          birth_year: number
          created_at: string
          email: string
          full_name: string
          id: string
          membership_number: string
          membership_type: Database["public"]["Enums"]["membership_type"]
          phone: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          amount_paid?: number | null
          birth_month: number
          birth_year: number
          created_at?: string
          email: string
          full_name: string
          id?: string
          membership_number?: string
          membership_type: Database["public"]["Enums"]["membership_type"]
          phone: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          amount_paid?: number | null
          birth_month?: number
          birth_year?: number
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          membership_number?: string
          membership_type?: Database["public"]["Enums"]["membership_type"]
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          address: string | null
          business_name: string
          category: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_published: boolean
          logo_url: string | null
          owner_name: string | null
          phone: string | null
          short_description: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          category?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_published?: boolean
          logo_url?: string | null
          owner_name?: string | null
          phone?: string | null
          short_description?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_published?: boolean
          logo_url?: string | null
          owner_name?: string | null
          phone?: string | null
          short_description?: string | null
          website?: string | null
        }
        Relationships: []
      }
      president_message: {
        Row: {
          id: string
          is_published: boolean
          message: string
          photo_url: string | null
          president_name: string
          title: string
          updated_at: string
        }
        Insert: {
          id?: string
          is_published?: boolean
          message: string
          photo_url?: string | null
          president_name: string
          title?: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_published?: boolean
          message?: string
          photo_url?: string | null
          president_name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          consent: boolean
          created_at: string
          details: string | null
          id: string
          membership_number: string | null
          person_contact: string | null
          person_name: string
          referrer_email: string
          referrer_name: string
          referrer_phone: string | null
          status: string
          support_type: string
        }
        Insert: {
          consent?: boolean
          created_at?: string
          details?: string | null
          id?: string
          membership_number?: string | null
          person_contact?: string | null
          person_name: string
          referrer_email: string
          referrer_name: string
          referrer_phone?: string | null
          status?: string
          support_type: string
        }
        Update: {
          consent?: boolean
          created_at?: string
          details?: string | null
          id?: string
          membership_number?: string | null
          person_contact?: string | null
          person_name?: string
          referrer_email?: string
          referrer_name?: string
          referrer_phone?: string | null
          status?: string
          support_type?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          answers: Json
          created_at: string
          id: string
          membership_number: string | null
          survey_id: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          membership_number?: string | null
          survey_id: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          membership_number?: string | null
          survey_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          closes_at: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          questions: Json
          title: string
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          questions?: Json
          title: string
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          questions?: Json
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          areas: string[]
          availability: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          membership_number: string | null
          message: string | null
          phone: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          areas?: string[]
          availability?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          membership_number?: string | null
          message?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          areas?: string[]
          availability?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          membership_number?: string | null
          message?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_membership: {
        Args: {
          _address: string
          _amount?: number
          _birth_month: number
          _birth_year: number
          _email: string
          _family?: Json
          _full_name: string
          _membership_type: Database["public"]["Enums"]["membership_type"]
          _phone: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "member"
      campaign_status: "active" | "past"
      event_type: "ccgms" | "other"
      family_relation: "partner" | "dependent"
      membership_type: "individual" | "student" | "family"
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
    Enums: {
      app_role: ["admin", "member"],
      campaign_status: ["active", "past"],
      event_type: ["ccgms", "other"],
      family_relation: ["partner", "dependent"],
      membership_type: ["individual", "student", "family"],
    },
  },
} as const
