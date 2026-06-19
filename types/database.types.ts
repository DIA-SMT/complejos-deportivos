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
                    app_name: string | null
                    assistant_name: string | null
                    created_at: string | null
                    description: string | null
                    footer_line_1: string | null
                    footer_line_2: string | null
                    id: string
                    latitude: number | null
                    logo_url: string | null
                    longitude: number | null
                    map_marker_icon: string | null
                    name: string
                    updated_at: string | null
                }
                Insert: {
                    address?: string | null
                    app_name?: string | null
                    assistant_name?: string | null
                    created_at?: string | null
                    description?: string | null
                    footer_line_1?: string | null
                    footer_line_2?: string | null
                    id?: string
                    latitude?: number | null
                    logo_url?: string | null
                    longitude?: number | null
                    map_marker_icon?: string | null
                    name: string
                    updated_at?: string | null
                }
                Update: {
                    address?: string | null
                    app_name?: string | null
                    assistant_name?: string | null
                    created_at?: string | null
                    description?: string | null
                    footer_line_1?: string | null
                    footer_line_2?: string | null
                    id?: string
                    latitude?: number | null
                    logo_url?: string | null
                    longitude?: number | null
                    map_marker_icon?: string | null
                    name?: string
                    updated_at?: string | null
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
            citizens: {
                Row: {
                    created_at: string
                    email: string | null
                    full_name: string
                    id: string
                    phone: string
                }
                Insert: {
                    created_at?: string
                    email?: string | null
                    full_name: string
                    id?: string
                    phone: string
                }
                Update: {
                    created_at?: string
                    email?: string | null
                    full_name?: string
                    id?: string
                    phone?: string
                }
                Relationships: []
            }

            courts: {
                Row: {
                    complex_id: string | null
                    created_at: string | null
                    id: string
                    icon_url: string | null
                    name: string
                    sport_id: string | null
                    type: string | null
                }
                Insert: {
                    complex_id?: string | null
                    created_at?: string | null
                    id?: string
                    icon_url?: string | null
                    name: string
                    sport_id?: string | null
                    type?: string | null
                }
                Update: {
                    complex_id?: string | null
                    created_at?: string | null
                    id?: string
                    icon_url?: string | null
                    name?: string
                    sport_id?: string | null
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
                    complex_id: string | null
                    created_at: string
                    description: string | null
                    id: string
                    name: string
                    quantity: number
                }
                Insert: {
                    complex_id?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    name: string
                    quantity?: number
                }
                Update: {
                    complex_id?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    name?: string
                    quantity?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "inventory_complex_id_fkey"
                        columns: ["complex_id"]
                        isOneToOne: false
                        referencedRelation: "complexes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "courts_sport_id_fkey"
                        columns: ["sport_id"]
                        isOneToOne: false
                        referencedRelation: "sports"
                        referencedColumns: ["id"]
                    },
                ]
            }
            member_credentials: {
                Row: {
                    code: string
                    complex_id: string
                    created_at: string
                    enabled_activities: string[]
                    expires_at: string
                    id: string
                    issued_at: string
                    member_id: string
                    membership_type: string
                    status: string
                    updated_at: string
                }
                Insert: {
                    code: string
                    complex_id: string
                    created_at?: string
                    enabled_activities?: string[]
                    expires_at: string
                    id?: string
                    issued_at?: string
                    member_id: string
                    membership_type?: string
                    status?: string
                    updated_at?: string
                }
                Update: {
                    code?: string
                    complex_id?: string
                    created_at?: string
                    enabled_activities?: string[]
                    expires_at?: string
                    id?: string
                    issued_at?: string
                    member_id?: string
                    membership_type?: string
                    status?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "member_credentials_complex_id_fkey"
                        columns: ["complex_id"]
                        isOneToOne: false
                        referencedRelation: "complexes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "member_credentials_member_id_fkey"
                        columns: ["member_id"]
                        isOneToOne: false
                        referencedRelation: "members"
                        referencedColumns: ["id"]
                    },
                ]
            }
            members: {
                Row: {
                    complex_id: string
                    created_at: string
                    dni: string
                    email: string | null
                    first_name: string
                    id: string
                    last_name: string
                    notes: string | null
                    phone: string | null
                    photo_url: string | null
                    status: string
                    updated_at: string
                    user_id: string | null
                }
                Insert: {
                    complex_id: string
                    created_at?: string
                    dni: string
                    email?: string | null
                    first_name: string
                    id?: string
                    last_name: string
                    notes?: string | null
                    phone?: string | null
                    photo_url?: string | null
                    status?: string
                    updated_at?: string
                    user_id?: string | null
                }
                Update: {
                    complex_id?: string
                    created_at?: string
                    dni?: string
                    email?: string | null
                    first_name?: string
                    id?: string
                    last_name?: string
                    notes?: string | null
                    phone?: string | null
                    photo_url?: string | null
                    status?: string
                    updated_at?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "members_complex_id_fkey"
                        columns: ["complex_id"]
                        isOneToOne: false
                        referencedRelation: "complexes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            membership_requests: {
                Row: {
                    complex_id: string
                    created_at: string
                    dni: string
                    email: string
                    first_name: string
                    id: string
                    last_name: string
                    notes: string | null
                    phone: string | null
                    requested_activities: string[]
                    requested_membership_type: string
                    status: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    complex_id: string
                    created_at?: string
                    dni: string
                    email: string
                    first_name: string
                    id?: string
                    last_name: string
                    notes?: string | null
                    phone?: string | null
                    requested_activities?: string[]
                    requested_membership_type?: string
                    status?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    complex_id?: string
                    created_at?: string
                    dni?: string
                    email?: string
                    first_name?: string
                    id?: string
                    last_name?: string
                    notes?: string | null
                    phone?: string | null
                    requested_activities?: string[]
                    requested_membership_type?: string
                    status?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "membership_requests_complex_id_fkey"
                        columns: ["complex_id"]
                        isOneToOne: false
                        referencedRelation: "complexes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            professor_schedules: {
                Row: {
                    complex_id: string | null
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
                    complex_id?: string | null
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
                    complex_id?: string | null
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
                        foreignKeyName: "professor_schedules_complex_id_fkey"
                        columns: ["complex_id"]
                        isOneToOne: false
                        referencedRelation: "complexes"
                        referencedColumns: ["id"]
                    },
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
                    complex_id: string | null
                    created_at: string | null
                    email: string | null
                    full_name: string
                    id: string
                    specialty: string | null
                    status: string | null
                }
                Insert: {
                    complex_id?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name: string
                    id?: string
                    specialty?: string | null
                    status?: string | null
                }
                Update: {
                    complex_id?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string
                    id?: string
                    specialty?: string | null
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "professors_complex_id_fkey"
                        columns: ["complex_id"]
                        isOneToOne: false
                        referencedRelation: "complexes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            reservation_requests: {
                Row: {
                    citizen_id: string
                    complex_id: string | null
                    court_id: string | null
                    created_at: string
                    id: string
                    notes: string | null
                    preferred_date: string
                    preferred_time: string
                    sport: string
                    sport_id: string | null
                    status: string
                    updated_at: string
                    user_id: string | null
                }
                Insert: {
                    citizen_id: string
                    complex_id?: string | null
                    court_id?: string | null
                    created_at?: string
                    id?: string
                    notes?: string | null
                    preferred_date: string
                    preferred_time: string
                    sport: string
                    sport_id?: string | null
                    status?: string
                    updated_at?: string
                    user_id?: string | null
                }
                Update: {
                    citizen_id?: string
                    complex_id?: string | null
                    court_id?: string | null
                    created_at?: string
                    id?: string
                    notes?: string | null
                    preferred_date?: string
                    preferred_time?: string
                    sport?: string
                    sport_id?: string | null
                    status?: string
                    updated_at?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "reservation_requests_citizen_id_fkey"
                        columns: ["citizen_id"]
                        isOneToOne: false
                        referencedRelation: "citizens"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reservation_requests_complex_id_fkey"
                        columns: ["complex_id"]
                        isOneToOne: false
                        referencedRelation: "complexes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reservation_requests_court_id_fkey"
                        columns: ["court_id"]
                        isOneToOne: false
                        referencedRelation: "courts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reservation_requests_sport_id_fkey"
                        columns: ["sport_id"]
                        isOneToOne: false
                        referencedRelation: "sports"
                        referencedColumns: ["id"]
                    },
                ]
            }
            shifts: {
                Row: {
                    complex_id: string | null
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
                    complex_id?: string | null
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
                    complex_id?: string | null
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
                        foreignKeyName: "shifts_complex_id_fkey"
                        columns: ["complex_id"]
                        isOneToOne: false
                        referencedRelation: "complexes"
                        referencedColumns: ["id"]
                    },
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
            sports: {
                Row: {
                    created_at: string
                    id: string
                    icon_url: string | null
                    name: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    icon_url?: string | null
                    name: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    icon_url?: string | null
                    name?: string
                }
                Relationships: []
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
            approve_membership_request: {
                Args: {
                    p_expires_at: string
                    p_request_id: string
                }
                Returns: string
            }
            create_public_reservation_request: {
                Args: {
                    p_full_name: string
                    p_phone: string
                    p_email: string | null
                    p_complex_id: string | null
                    p_sport_id: string
                    p_court_id: string | null
                    p_preferred_date: string
                    p_preferred_time: string
                    p_notes: string | null
                }
                Returns: string
            }
            get_public_credential_validation: {
                Args: {
                    p_code: string
                }
                Returns: {
                    code: string
                    complex_id: string
                    complex_logo_url: string | null
                    complex_name: string
                    enabled_activities: string[]
                    expires_at: string
                    first_name: string
                    id: string
                    issued_at: string
                    last_name: string
                    masked_dni: string
                    member_id: string
                    member_status: string
                    membership_type: string
                    status: string
                }[]
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


