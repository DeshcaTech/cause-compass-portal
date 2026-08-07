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
      admin_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          invited_by_email: string | null
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          invited_by_email?: string | null
          revoked_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          invited_by_email?: string | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token_hash?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          details: Json | null
          event_name: string
          id: string
          page_path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_name: string
          id?: string
          page_path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_name?: string
          id?: string
          page_path?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_url: string | null
          is_featured: boolean
          is_pinned: boolean
          is_published: boolean
          notified_at: string | null
          published_at: string
          summary: string | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_pinned?: boolean
          is_published?: boolean
          notified_at?: string | null
          published_at?: string
          summary?: string | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_pinned?: boolean
          is_published?: boolean
          notified_at?: string | null
          published_at?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
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
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          changed_fields: Json | null
          created_at: string
          id: string
          record_id: string | null
          summary: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          changed_fields?: Json | null
          created_at?: string
          id?: string
          record_id?: string | null
          summary?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          changed_fields?: Json | null
          created_at?: string
          id?: string
          record_id?: string | null
          summary?: string | null
          table_name?: string
        }
        Relationships: []
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
      brand_settings: {
        Row: {
          accent_color: string
          body_font: string
          created_at: string
          heading_font: string
          id: number
          logo_url: string | null
          og_image_url: string | null
          primary_color: string
          show_logo_footer: boolean
          show_logo_header: boolean
          updated_at: string
          use_logo_favicon: boolean
        }
        Insert: {
          accent_color?: string
          body_font?: string
          created_at?: string
          heading_font?: string
          id?: number
          logo_url?: string | null
          og_image_url?: string | null
          primary_color?: string
          show_logo_footer?: boolean
          show_logo_header?: boolean
          updated_at?: string
          use_logo_favicon?: boolean
        }
        Update: {
          accent_color?: string
          body_font?: string
          created_at?: string
          heading_font?: string
          id?: number
          logo_url?: string | null
          og_image_url?: string | null
          primary_color?: string
          show_logo_footer?: boolean
          show_logo_header?: boolean
          updated_at?: string
          use_logo_favicon?: boolean
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
          status_notified_at: string | null
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
          status_notified_at?: string | null
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
          status_notified_at?: string | null
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
      content_translations: {
        Row: {
          created_at: string
          id: string
          lang: string
          source_hash: string
          source_text: string
          translated_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          lang: string
          source_hash: string
          source_text: string
          translated_text: string
        }
        Update: {
          created_at?: string
          id?: string
          lang?: string
          source_hash?: string
          source_text?: string
          translated_text?: string
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
      event_rsvps: {
        Row: {
          created_at: string
          edit_token: string
          email: string
          event_id: string
          full_name: string
          guests: number
          id: string
          membership_number: string | null
          note: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          edit_token?: string
          email: string
          event_id: string
          full_name: string
          guests?: number
          id?: string
          membership_number?: string | null
          note?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          edit_token?: string
          email?: string
          event_id?: string
          full_name?: string
          guests?: number
          id?: string
          membership_number?: string | null
          note?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
          fee: number
          id: string
          image_url: string | null
          location: string | null
          notify_email: string | null
          notify_whatsapp: string | null
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
          fee?: number
          id?: string
          image_url?: string | null
          location?: string | null
          notify_email?: string | null
          notify_whatsapp?: string | null
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
          fee?: number
          id?: string
          image_url?: string | null
          location?: string | null
          notify_email?: string | null
          notify_whatsapp?: string | null
          organiser?: string | null
          start_at?: string
          ticket_url?: string | null
          title?: string
        }
        Relationships: []
      }
      footer_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          photo_url: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_url: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_url?: string
          sort_order?: number
          updated_at?: string
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
      job_applications: {
        Row: {
          created_at: string
          cv_url: string | null
          email: string
          full_name: string
          id: string
          job_id: string
          membership_number: string | null
          message: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          cv_url?: string | null
          email: string
          full_name: string
          id?: string
          job_id: string
          membership_number?: string | null
          message?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          cv_url?: string | null
          email?: string
          full_name?: string
          id?: string
          job_id?: string
          membership_number?: string | null
          message?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          apply_url: string | null
          approval_status: string
          category: string
          closes_at: string | null
          company: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean
          job_type: string
          location: string | null
          notify_email: string | null
          notify_whatsapp: string | null
          reviewed_at: string | null
          salary_range: string | null
          short_description: string | null
          title: string
        }
        Insert: {
          apply_url?: string | null
          approval_status?: string
          category?: string
          closes_at?: string | null
          company: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          job_type?: string
          location?: string | null
          notify_email?: string | null
          notify_whatsapp?: string | null
          reviewed_at?: string | null
          salary_range?: string | null
          short_description?: string | null
          title: string
        }
        Update: {
          apply_url?: string | null
          approval_status?: string
          category?: string
          closes_at?: string | null
          company?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          job_type?: string
          location?: string | null
          notify_email?: string | null
          notify_whatsapp?: string | null
          reviewed_at?: string | null
          salary_range?: string | null
          short_description?: string | null
          title?: string
        }
        Relationships: []
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
      news_subscribers: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          membership_number: string | null
          unsubscribe_token: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          membership_number?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          membership_number?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          updated_at?: string
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
          whatsapp: string | null
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
          whatsapp?: string | null
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
          whatsapp?: string | null
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
          is_self: boolean
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
          is_self?: boolean
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
          is_self?: boolean
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
      site_settings: {
        Row: {
          about_body_1: string
          about_body_2: string
          about_eyebrow: string
          about_title: string
          android_app_url: string | null
          contact_address: string
          contact_email: string
          contact_phone: string
          contact_whatsapp: string | null
          created_at: string
          developer_whatsapp: string | null
          facebook_url: string | null
          footer_blurb: string
          hero_eyebrow: string
          hero_intro: string
          hero_title_line1: string
          hero_title_line2: string
          id: number
          instagram_url: string | null
          ios_app_url: string | null
          membership_fee_family: number
          membership_fee_individual: number
          membership_fee_student: number
          membership_free: boolean
          org_name: string
          show_contact_whatsapp: boolean
          tiktok_url: string | null
          updated_at: string
          whatsapp_message: string | null
          x_url: string | null
          youtube_url: string | null
        }
        Insert: {
          about_body_1?: string
          about_body_2?: string
          about_eyebrow?: string
          about_title?: string
          android_app_url?: string | null
          contact_address?: string
          contact_email?: string
          contact_phone?: string
          contact_whatsapp?: string | null
          created_at?: string
          developer_whatsapp?: string | null
          facebook_url?: string | null
          footer_blurb?: string
          hero_eyebrow?: string
          hero_intro?: string
          hero_title_line1?: string
          hero_title_line2?: string
          id?: number
          instagram_url?: string | null
          ios_app_url?: string | null
          membership_fee_family?: number
          membership_fee_individual?: number
          membership_fee_student?: number
          membership_free?: boolean
          org_name?: string
          show_contact_whatsapp?: boolean
          tiktok_url?: string | null
          updated_at?: string
          whatsapp_message?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          about_body_1?: string
          about_body_2?: string
          about_eyebrow?: string
          about_title?: string
          android_app_url?: string | null
          contact_address?: string
          contact_email?: string
          contact_phone?: string
          contact_whatsapp?: string | null
          created_at?: string
          developer_whatsapp?: string | null
          facebook_url?: string | null
          footer_blurb?: string
          hero_eyebrow?: string
          hero_intro?: string
          hero_title_line1?: string
          hero_title_line2?: string
          id?: number
          instagram_url?: string | null
          ios_app_url?: string | null
          membership_fee_family?: number
          membership_fee_individual?: number
          membership_fee_student?: number
          membership_free?: boolean
          org_name?: string
          show_contact_whatsapp?: boolean
          tiktok_url?: string | null
          updated_at?: string
          whatsapp_message?: string | null
          x_url?: string | null
          youtube_url?: string | null
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
          opens_at: string | null
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
          opens_at?: string | null
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
          opens_at?: string | null
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
      village_groups: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          group_category: string
          id: string
          image_url: string | null
          is_published: boolean
          meeting_info: string | null
          name: string
          region: string
          short_description: string | null
          sort_order: number
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          group_category?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          meeting_info?: string | null
          name: string
          region?: string
          short_description?: string | null
          sort_order?: number
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          group_category?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          meeting_info?: string | null
          name?: string
          region?: string
          short_description?: string | null
          sort_order?: number
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
      admin_level: { Args: { _user_id: string }; Returns: number }
      can_edit_content: { Args: { _user_id: string }; Returns: boolean }
      can_manage: {
        Args: { _area: string; _user_id: string }
        Returns: boolean
      }
      get_home_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
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
      app_role:
        | "admin"
        | "member"
        | "board_manager"
        | "president_manager"
        | "fundraising_manager"
        | "event_manager"
        | "admin_l2"
        | "admin_l3"
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
      app_role: [
        "admin",
        "member",
        "board_manager",
        "president_manager",
        "fundraising_manager",
        "event_manager",
        "admin_l2",
        "admin_l3",
      ],
      campaign_status: ["active", "past"],
      event_type: ["ccgms", "other"],
      family_relation: ["partner", "dependent"],
      membership_type: ["individual", "student", "family"],
    },
  },
} as const
