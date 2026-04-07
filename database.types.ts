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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          admin_id: number
          created_at: string
          email: string
          is_active: boolean
          name: string
          password_hash: string
          permissions: string[]
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
        }
        Insert: {
          admin_id?: never
          created_at?: string
          email: string
          is_active?: boolean
          name: string
          password_hash: string
          permissions?: string[]
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Update: {
          admin_id?: never
          created_at?: string
          email?: string
          is_active?: boolean
          name?: string
          password_hash?: string
          permissions?: string[]
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          banner_id: number
          button_text: string | null
          created_at: string
          ended_at: string | null
          image_mobile_url: string | null
          image_url: string
          is_active: boolean
          link_url: string | null
          sort_order: number
          started_at: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          banner_id?: never
          button_text?: string | null
          created_at?: string
          ended_at?: string | null
          image_mobile_url?: string | null
          image_url: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          started_at?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          banner_id?: never
          button_text?: string | null
          created_at?: string
          ended_at?: string | null
          image_mobile_url?: string | null
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          started_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brand_cert_items: {
        Row: {
          created_at: string
          description: string | null
          id: number
          image_url: string | null
          is_active: boolean
          sort_order: number
          title: string
          type: Database["public"]["Enums"]["cert_item_type"]
          updated_at: string
          year: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          title: string
          type?: Database["public"]["Enums"]["cert_item_type"]
          updated_at?: string
          year?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: never
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          title?: string
          type?: Database["public"]["Enums"]["cert_item_type"]
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      catalogs: {
        Row: {
          catalog_id: number
          created_at: string
          description: string | null
          file_size: string | null
          file_url: string
          is_active: boolean
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          catalog_id?: never
          created_at?: string
          description?: string | null
          file_size?: string | null
          file_url: string
          is_active?: boolean
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          catalog_id?: never
          created_at?: string
          description?: string | null
          file_size?: string | null
          file_url?: string
          is_active?: boolean
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          admin_memo: string | null
          company: string | null
          contact_id: number
          content: string
          created_at: string
          email: string
          inquiry_type: string
          lookup_password: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["contact_status"]
          title: string
          updated_at: string
        }
        Insert: {
          admin_memo?: string | null
          company?: string | null
          contact_id?: never
          content: string
          created_at?: string
          email: string
          inquiry_type?: string
          lookup_password?: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          title: string
          updated_at?: string
        }
        Update: {
          admin_memo?: string | null
          company?: string | null
          contact_id?: never
          content?: string
          created_at?: string
          email?: string
          inquiry_type?: string
          lookup_password?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          badge: Database["public"]["Enums"]["event_badge"] | null
          content: string
          created_at: string
          ended_at: string | null
          event_id: number
          is_active: boolean
          started_at: string | null
          summary: string | null
          thumbnail_url: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
          view_count: string | null
        }
        Insert: {
          badge?: Database["public"]["Enums"]["event_badge"] | null
          content: string
          created_at?: string
          ended_at?: string | null
          event_id?: never
          is_active?: boolean
          started_at?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          title: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          view_count?: string | null
        }
        Update: {
          badge?: Database["public"]["Enums"]["event_badge"] | null
          content?: string
          created_at?: string
          ended_at?: string | null
          event_id?: never
          is_active?: boolean
          started_at?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          view_count?: string | null
        }
        Relationships: []
      }
      factory_tour_applications: {
        Row: {
          admin_memo: string | null
          applicant_name: string
          created_at: string
          email: string | null
          message: string | null
          organization: string | null
          participants: number
          phone: string
          purpose: string
          requested_date: string
          status: Database["public"]["Enums"]["factory_tour_status"]
          tour_id: number
          updated_at: string
        }
        Insert: {
          admin_memo?: string | null
          applicant_name: string
          created_at?: string
          email?: string | null
          message?: string | null
          organization?: string | null
          participants: number
          phone: string
          purpose: string
          requested_date: string
          status?: Database["public"]["Enums"]["factory_tour_status"]
          tour_id?: never
          updated_at?: string
        }
        Update: {
          admin_memo?: string | null
          applicant_name?: string
          created_at?: string
          email?: string | null
          message?: string | null
          organization?: string | null
          participants?: number
          phone?: string
          purpose?: string
          requested_date?: string
          status?: Database["public"]["Enums"]["factory_tour_status"]
          tour_id?: never
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: Database["public"]["Enums"]["faq_category"]
          created_at: string
          faq_id: number
          is_active: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category: Database["public"]["Enums"]["faq_category"]
          created_at?: string
          faq_id?: never
          is_active?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: Database["public"]["Enums"]["faq_category"]
          created_at?: string
          faq_id?: never
          is_active?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      grade_certificates: {
        Row: {
          author: string
          cert_id: number
          cert_type: Database["public"]["Enums"]["cert_type"]
          content: string
          created_at: string
          file_name: string | null
          file_url: string | null
          is_active: boolean
          tab: Database["public"]["Enums"]["cert_tab"]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author?: string
          cert_id?: never
          cert_type?: Database["public"]["Enums"]["cert_type"]
          content?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          is_active?: boolean
          tab?: Database["public"]["Enums"]["cert_tab"]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author?: string
          cert_id?: never
          cert_type?: Database["public"]["Enums"]["cert_type"]
          content?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          is_active?: boolean
          tab?: Database["public"]["Enums"]["cert_tab"]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          admin_memo: string | null
          company: string | null
          content: string
          created_at: string
          email: string
          inquiry_id: number
          name: string
          phone: string
          status: Database["public"]["Enums"]["inquiry_status"]
          title: string
          type: Database["public"]["Enums"]["inquiry_type"]
          updated_at: string
        }
        Insert: {
          admin_memo?: string | null
          company?: string | null
          content: string
          created_at?: string
          email: string
          inquiry_id?: never
          name: string
          phone: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          title: string
          type: Database["public"]["Enums"]["inquiry_type"]
          updated_at?: string
        }
        Update: {
          admin_memo?: string | null
          company?: string | null
          content?: string
          created_at?: string
          email?: string
          inquiry_id?: never
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          title?: string
          type?: Database["public"]["Enums"]["inquiry_type"]
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          address: string | null
          admin_memo: string | null
          applicant_name: string
          application_id: number
          birth_date: string | null
          cover_letter: string | null
          created_at: string
          email: string
          job_id: number
          phone: string
          portfolio_url: string | null
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_memo?: string | null
          applicant_name: string
          application_id?: never
          birth_date?: string | null
          cover_letter?: string | null
          created_at?: string
          email: string
          job_id: number
          phone: string
          portfolio_url?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_memo?: string | null
          applicant_name?: string
          application_id?: never
          birth_date?: string | null
          cover_letter?: string | null
          created_at?: string
          email?: string
          job_id?: number
          phone?: string
          portfolio_url?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_job_postings_job_id_fk"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["job_id"]
          },
        ]
      }
      job_postings: {
        Row: {
          benefits: string | null
          created_at: string
          deadline: string | null
          department: string
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          headcount: number | null
          is_active: boolean
          job_id: number
          job_type: Database["public"]["Enums"]["job_type"]
          location: string
          requirements: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          created_at?: string
          deadline?: string | null
          department: string
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          headcount?: number | null
          is_active?: boolean
          job_id?: never
          job_type: Database["public"]["Enums"]["job_type"]
          location: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          created_at?: string
          deadline?: string | null
          department?: string
          description?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          headcount?: number | null
          is_active?: boolean
          job_id?: never
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          content: string
          created_at: string
          is_active: boolean
          news_id: number
          published_at: string | null
          source: string | null
          source_url: string | null
          summary: string | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          is_active?: boolean
          news_id?: never
          published_at?: string | null
          source?: string | null
          source_url?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          is_active?: boolean
          news_id?: never
          published_at?: string | null
          source?: string | null
          source_url?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          author: string
          category: Database["public"]["Enums"]["notice_category"]
          content: string
          created_at: string
          is_active: boolean
          is_pinned: boolean
          notice_id: number
          tags: string[]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author?: string
          category?: Database["public"]["Enums"]["notice_category"]
          content?: string
          created_at?: string
          is_active?: boolean
          is_pinned?: boolean
          notice_id?: never
          tags?: string[]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author?: string
          category?: Database["public"]["Enums"]["notice_category"]
          content?: string
          created_at?: string
          is_active?: boolean
          is_pinned?: boolean
          notice_id?: never
          tags?: string[]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      page_banners: {
        Row: {
          created_at: string
          image_url: string | null
          is_active: boolean
          link_text: string | null
          link_url: string | null
          page_banner_id: number
          page_key: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          image_url?: string | null
          is_active?: boolean
          link_text?: string | null
          link_url?: string | null
          page_banner_id?: never
          page_key: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          image_url?: string | null
          is_active?: boolean
          link_text?: string | null
          link_url?: string | null
          page_banner_id?: never
          page_key?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          approved_at: string
          created_at: string
          metadata: Json
          order_id: string
          order_name: string
          payment_id: number
          payment_key: string
          raw_data: Json
          receipt_url: string
          requested_at: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at: string
          created_at?: string
          metadata: Json
          order_id: string
          order_name: string
          payment_id?: never
          payment_key: string
          raw_data: Json
          receipt_url: string
          requested_at: string
          status: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string
          created_at?: string
          metadata?: Json
          order_id?: string
          order_name?: string
          payment_id?: never
          payment_key?: string
          raw_data?: Json
          receipt_url?: string
          requested_at?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      popups: {
        Row: {
          content: string | null
          created_at: string
          ended_at: string | null
          height: number | null
          image_url: string | null
          is_active: boolean
          link_url: string | null
          popup_id: number
          started_at: string | null
          title: string
          updated_at: string
          width: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          ended_at?: string | null
          height?: number | null
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          popup_id?: never
          started_at?: string | null
          title: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string
          ended_at?: string | null
          height?: number | null
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          popup_id?: never
          started_at?: string | null
          title?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          category_id: number
          created_at: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id?: never
          created_at?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: never
          created_at?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: Database["public"]["Enums"]["product_badge"] | null
          category: string[]
          certifications: string[] | null
          created_at: string
          description: string
          detail: string | null
          expiry_info: string | null
          image_url: string | null
          image_urls: string[] | null
          ingredients: string | null
          is_active: boolean
          is_b2b: boolean
          name: string
          origin: string | null
          original_price: number | null
          price: number | null
          product_id: number
          shop_url: string | null
          sort_order: number
          storage_method: string | null
          tags: string[] | null
          updated_at: string
          volume: string | null
        }
        Insert: {
          badge?: Database["public"]["Enums"]["product_badge"] | null
          category?: string[]
          certifications?: string[] | null
          created_at?: string
          description: string
          detail?: string | null
          expiry_info?: string | null
          image_url?: string | null
          image_urls?: string[] | null
          ingredients?: string | null
          is_active?: boolean
          is_b2b?: boolean
          name: string
          origin?: string | null
          original_price?: number | null
          price?: number | null
          product_id?: never
          shop_url?: string | null
          sort_order?: number
          storage_method?: string | null
          tags?: string[] | null
          updated_at?: string
          volume?: string | null
        }
        Update: {
          badge?: Database["public"]["Enums"]["product_badge"] | null
          category?: string[]
          certifications?: string[] | null
          created_at?: string
          description?: string
          detail?: string | null
          expiry_info?: string | null
          image_url?: string | null
          image_urls?: string[] | null
          ingredients?: string | null
          is_active?: boolean
          is_b2b?: boolean
          name?: string
          origin?: string | null
          original_price?: number | null
          price?: number | null
          product_id?: never
          shop_url?: string | null
          sort_order?: number
          storage_method?: string | null
          tags?: string[] | null
          updated_at?: string
          volume?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          marketing_consent: boolean
          name: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          marketing_consent?: boolean
          name: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          marketing_consent?: boolean
          name?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipe_categories: {
        Row: {
          category_id: number
          created_at: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id?: never
          created_at?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: never
          created_at?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          category: string
          cooking_time: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          image_urls: string[] | null
          ingredients: string | null
          is_active: boolean
          nutrition: string | null
          recipe_id: number
          servings: string | null
          sort_order: number
          steps: string | null
          tags: string[] | null
          thumbnail_url: string | null
          tips: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          cooking_time?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          image_urls?: string[] | null
          ingredients?: string | null
          is_active?: boolean
          nutrition?: string | null
          recipe_id?: never
          servings?: string | null
          sort_order?: number
          steps?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          tips?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          cooking_time?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          image_urls?: string[] | null
          ingredients?: string | null
          is_active?: boolean
          nutrition?: string | null
          recipe_id?: never
          servings?: string | null
          sort_order?: number
          steps?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          tips?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
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
      admin_role: "super" | "admin"
      application_status: "submitted" | "reviewing" | "accepted" | "rejected"
      cert_item_type: "award" | "cert"
      cert_tab: "current" | "archive"
      cert_type: "포장란" | "액란" | "기타"
      contact_status: "pending" | "completed"
      event_badge: "hot" | "new" | "ending_soon" | "important"
      event_type: "event" | "notice"
      experience_level: "entry" | "experienced" | "senior" | "all"
      factory_tour_status: "pending" | "approved" | "rejected"
      faq_category: "product" | "delivery" | "b2b" | "quality" | "general"
      inquiry_status: "pending" | "completed"
      inquiry_type: "b2b" | "bulk" | "franchise" | "export" | "general"
      job_status: "open" | "closed" | "draft"
      job_type: "full_time" | "part_time" | "contract" | "intern"
      notice_category: "공지" | "안내" | "이벤트"
      product_badge: "best" | "new" | "b2b" | "sale"
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
      admin_role: ["super", "admin"],
      application_status: ["submitted", "reviewing", "accepted", "rejected"],
      cert_item_type: ["award", "cert"],
      cert_tab: ["current", "archive"],
      cert_type: ["포장란", "액란", "기타"],
      contact_status: ["pending", "completed"],
      event_badge: ["hot", "new", "ending_soon", "important"],
      event_type: ["event", "notice"],
      experience_level: ["entry", "experienced", "senior", "all"],
      factory_tour_status: ["pending", "approved", "rejected"],
      faq_category: ["product", "delivery", "b2b", "quality", "general"],
      inquiry_status: ["pending", "completed"],
      inquiry_type: ["b2b", "bulk", "franchise", "export", "general"],
      job_status: ["open", "closed", "draft"],
      job_type: ["full_time", "part_time", "contract", "intern"],
      notice_category: ["공지", "안내", "이벤트"],
      product_badge: ["best", "new", "b2b", "sale"],
    },
  },
} as const
