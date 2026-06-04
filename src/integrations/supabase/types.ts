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
      blog_posts: {
        Row: {
          body: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string | null
          slug: string
          sort_order: number
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug: string
          sort_order?: number
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          slug?: string
          sort_order?: number
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          last_restocked_at: string | null
          low_stock_threshold: number
          notes: string | null
          product_name: string
          product_slug: string
          stock_kg: number
          supplier: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          low_stock_threshold?: number
          notes?: string | null
          product_name: string
          product_slug: string
          stock_kg?: number
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          low_stock_threshold?: number
          notes?: string | null
          product_name?: string
          product_slug?: string
          stock_kg?: number
          supplier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          assigned_rider_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_fee: number
          id: string
          items: Json
          location: Json | null
          notes: string | null
          order_number: string
          order_type: string
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
          zone: Json | null
        }
        Insert: {
          assigned_rider_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_fee?: number
          id?: string
          items: Json
          location?: Json | null
          notes?: string | null
          order_number: string
          order_type: string
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
          zone?: Json | null
        }
        Update: {
          assigned_rider_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_fee?: number
          id?: string
          items?: Json
          location?: Json | null
          notes?: string | null
          order_number?: string
          order_type?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          zone?: Json | null
        }
        Relationships: []
      }
      rider_profiles: {
        Row: {
          approved_at: string | null
          created_at: string
          full_name: string
          id: string
          is_approved: boolean
          national_id: string | null
          phone: string
          updated_at: string
          user_id: string
          vehicle: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_approved?: boolean
          national_id?: string | null
          phone: string
          updated_at?: string
          user_id: string
          vehicle?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_approved?: boolean
          national_id?: string | null
          phone?: string
          updated_at?: string
          user_id?: string
          vehicle?: string | null
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          change_kg: number
          created_at: string
          created_by: string | null
          id: string
          inventory_id: string
          note: string | null
          reason: string
        }
        Insert: {
          change_kg: number
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_id: string
          note?: string | null
          reason: string
        }
        Update: {
          change_kg?: number
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_id?: string
          note?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "rider"
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
      app_role: ["admin", "user", "rider"],
    },
  },
} as const
