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
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            complexes: {
                Row: {
                    address: string | null
                    created_at: string | null
                    id: string
                    name: string
                }
                Insert: {
                    address?: string | null
                    created_at?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    address?: string | null
                    created_at?: string | null
                    id?: string
                    name?: string
                }
                Relationships: []
            }
            class_reviews: {
                Row: {
                    id: string
                    schedule_id: string
                    date: string
                    attendance: number | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    schedule_id: string
                    date: string
                    attendance?: number | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    schedule_id?: string
                    date?: string
                    attendance?: number | null
                    notes?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "class_reviews_schedule_id_fkey"
                        columns: ["schedule_id"]
                        isOneToOne: false
                        referencedRelation: "professor_schedules"
                        referencedColumns: ["id"]
                    }
                ]
            }

            courts: {
                Row: {
                    complex_id: string | null
                    created_at: string | null
                    id: string
                    name: string
                    type: string | null
                }
                Insert: {
                    complex_id?: string | null
                    created_at?: string | null
                    id?: string
                    name: string
                    type?: string | null
                }
                Update: {
                    complex_id?: string | null
                    created_at?: string | null
                    id?: string
                    name?: string
                    type?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "courts_complex_id_fkey"
                        columns: ["complex_id"]
                        isOneToOne: false
                        referencedRelation: "complexes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            inventory: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    name: string
                    quantity: number
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name: string
                    quantity?: number
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    name?: string
                    quantity?: number
                }
                Relationships: []
            }
            professor_schedules: {
                Row: {
                    court_id: string | null
                    created_at: string | null
                    day_of_week: string
                    description: string | null
                    end_time: string
                    id: string
                    professor_id: string
                    sport: string
                    start_time: string
                }
                Insert: {
                    court_id?: string | null
                    created_at?: string | null
                    day_of_week: string
                    description?: string | null
                    end_time: string
                    id?: string
                    professor_id: string
                    sport: string
                    start_time: string
                }
                Update: {
                    court_id?: string | null
                    created_at?: string | null
                    day_of_week?: string
                    description?: string | null
                    end_time?: string
                    id?: string
                    professor_id?: string
                    sport?: string
                    start_time?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "professor_schedules_court_id_fkey"
                        columns: ["court_id"]
                        isOneToOne: false
                        referencedRelation: "courts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "professor_schedules_professor_id_fkey"
                        columns: ["professor_id"]
                        isOneToOne: false
                        referencedRelation: "professors"
                        referencedColumns: ["id"]
                    },
                ]
            }
            professors: {
                Row: {
                    created_at: string | null
                    email: string | null
                    full_name: string
                    id: string
                    specialty: string | null
                    status: string | null
                }
                Insert: {
                    created_at?: string | null
                    email?: string | null
                    full_name: string
                    id?: string
                    specialty?: string | null
                    status?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string | null
                    full_name?: string
                    id?: string
                    specialty?: string | null
                    status?: string | null
                }
                Relationships: []
            }
            shifts: {
                Row: {
                    court_id: string | null
                    created_at: string | null
                    date: string
                    end_time: string
                    id: string
                    price: number | null
                    professor_id: string | null
                    start_time: string
                    status: string | null
                }
                Insert: {
                    court_id?: string | null
                    created_at?: string | null
                    date: string
                    end_time: string
                    id?: string
                    price?: number | null
                    professor_id?: string | null
                    start_time: string
                    status?: string | null
                }
                Update: {
                    court_id?: string | null
                    created_at?: string | null
                    date?: string
                    end_time?: string
                    id?: string
                    price?: number | null
                    professor_id?: string | null
                    start_time?: string
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "shifts_court_id_fkey"
                        columns: ["court_id"]
                        isOneToOne: false
                        referencedRelation: "courts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "shifts_professor_id_fkey"
                        columns: ["professor_id"]
                        isOneToOne: false
                        referencedRelation: "professors"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_profiles: {
                Row: {
                    id: string
                    email: string
                    role: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: string
                    created_at?: string
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



type PublicSchema = Database[Extract<keyof Database, "public">]
type DatabaseSchemaName = Exclude<keyof Database, "__InternalSupabase">

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: DatabaseSchemaName },
    TableName extends PublicTableNameOrOptions extends { schema: DatabaseSchemaName }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: DatabaseSchemaName }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: DatabaseSchemaName },
    TableName extends PublicTableNameOrOptions extends { schema: DatabaseSchemaName }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: DatabaseSchemaName }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: DatabaseSchemaName },
    TableName extends PublicTableNameOrOptions extends { schema: DatabaseSchemaName }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: DatabaseSchemaName }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: DatabaseSchemaName },
    EnumName extends PublicEnumNameOrOptions extends { schema: DatabaseSchemaName }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: DatabaseSchemaName }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: DatabaseSchemaName },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: DatabaseSchemaName
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: DatabaseSchemaName }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never


