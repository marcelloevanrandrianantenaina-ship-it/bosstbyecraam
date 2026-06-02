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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          sort_order: number
          starts_at: string | null
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          starts_at?: string | null
          title: string
          type?: string
        }
        Update: {
          content?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          starts_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      balance_transfers: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          recipient_client_id: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          recipient_client_id: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          recipient_client_id?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          id: string
          link: string
          notes: string | null
          progress: number
          quantity: number
          service_id: string
          service_name: string
          status: Database["public"]["Enums"]["order_status"]
          total_price: number
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link: string
          notes?: string | null
          progress?: number
          quantity: number
          service_id: string
          service_name: string
          status?: Database["public"]["Enums"]["order_status"]
          total_price: number
          unit_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string
          notes?: string | null
          progress?: number
          quantity?: number
          service_id?: string
          service_name?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_price?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_settings: {
        Row: {
          auto_update_enabled: boolean
          global_margin_pct: number
          id: number
          mode: string
          updated_at: string
        }
        Insert: {
          auto_update_enabled?: boolean
          global_margin_pct?: number
          id?: number
          mode?: string
          updated_at?: string
        }
        Update: {
          auto_update_enabled?: boolean
          global_margin_pct?: number
          id?: number
          mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number
          client_id: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          client_id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          client_id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recharges: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          method: string
          processed_at: string | null
          reference: string | null
          sender_number: string | null
          status: Database["public"]["Enums"]["recharge_status"]
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          method?: string
          processed_at?: string | null
          reference?: string | null
          sender_number?: string | null
          status?: Database["public"]["Enums"]["recharge_status"]
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          method?: string
          processed_at?: string | null
          reference?: string | null
          sender_number?: string | null
          status?: Database["public"]["Enums"]["recharge_status"]
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          badge: Database["public"]["Enums"]["service_badge"]
          created_at: string
          description: string | null
          estimated_time: string | null
          id: string
          is_active: boolean
          margin_pct: number
          max_quantity: number
          min_quantity: number
          name: string
          platform: Database["public"]["Enums"]["service_platform"]
          price_per_1k: number
          sort_order: number
          supplier_price_per_1k: number
          updated_at: string
        }
        Insert: {
          badge?: Database["public"]["Enums"]["service_badge"]
          created_at?: string
          description?: string | null
          estimated_time?: string | null
          id?: string
          is_active?: boolean
          margin_pct?: number
          max_quantity?: number
          min_quantity?: number
          name: string
          platform: Database["public"]["Enums"]["service_platform"]
          price_per_1k?: number
          sort_order?: number
          supplier_price_per_1k?: number
          updated_at?: string
        }
        Update: {
          badge?: Database["public"]["Enums"]["service_badge"]
          created_at?: string
          description?: string | null
          estimated_time?: string | null
          id?: string
          is_active?: boolean
          margin_pct?: number
          max_quantity?: number
          min_quantity?: number
          name?: string
          platform?: Database["public"]["Enums"]["service_platform"]
          price_per_1k?: number
          sort_order?: number
          supplier_price_per_1k?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          facebook_url: string | null
          footer_text: string
          id: number
          instagram_url: string | null
          logo_url: string | null
          min_recharge: number
          mvola_instructions: string | null
          mvola_number: string
          mvola_owner: string
          primary_color: string
          site_name: string
          slogan: string
          tiktok_url: string | null
          updated_at: string
          updated_by: string | null
          welcome_message: string | null
          whatsapp_intl: string
          whatsapp_number: string
        }
        Insert: {
          facebook_url?: string | null
          footer_text?: string
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          min_recharge?: number
          mvola_instructions?: string | null
          mvola_number?: string
          mvola_owner?: string
          primary_color?: string
          site_name?: string
          slogan?: string
          tiktok_url?: string | null
          updated_at?: string
          updated_by?: string | null
          welcome_message?: string | null
          whatsapp_intl?: string
          whatsapp_number?: string
        }
        Update: {
          facebook_url?: string | null
          footer_text?: string
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          min_recharge?: number
          mvola_instructions?: string | null
          mvola_number?: string
          mvola_owner?: string
          primary_color?: string
          site_name?: string
          slogan?: string
          tiktok_url?: string | null
          updated_at?: string
          updated_by?: string | null
          welcome_message?: string | null
          whatsapp_intl?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_recharge: {
        Args: { _recharge_id: string }
        Returns: {
          message: string
          new_balance: number
          ok: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      reject_recharge: {
        Args: { _note?: string; _recharge_id: string }
        Returns: {
          message: string
          ok: boolean
        }[]
      }
      transfer_balance: {
        Args: { _amount: number; _note?: string; _recipient_client_id: string }
        Returns: {
          message: string
          new_balance: number
          ok: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "sub_admin" | "user"
      order_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "refunded"
      recharge_status: "pending" | "approved" | "rejected"
      service_badge: "none" | "top" | "new" | "fast"
      service_platform: "facebook" | "tiktok" | "instagram"
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
      app_role: ["admin", "sub_admin", "user"],
      order_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "refunded",
      ],
      recharge_status: ["pending", "approved", "rejected"],
      service_badge: ["none", "top", "new", "fast"],
      service_platform: ["facebook", "tiktok", "instagram"],
    },
  },
} as const
