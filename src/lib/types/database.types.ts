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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      church_access: {
        Row: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
        }
        Insert: {
          active?: boolean
          create_at?: string
          create_id: number
          description: string
          id?: number
          name: string
        }
        Update: {
          active?: boolean
          create_at?: string
          create_id?: number
          description?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      church_access_detail: {
        Row: {
          create_at: string
          description: string
          fn_name: string
          id: number
          name: string
          parent_id: number | null
          pseudo_code: string
        }
        Insert: {
          create_at?: string
          description: string
          fn_name: string
          id?: number
          name: string
          parent_id?: number | null
          pseudo_code: string
        }
        Update: {
          create_at?: string
          description?: string
          fn_name?: string
          id?: number
          name?: string
          parent_id?: number | null
          pseudo_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_access_detail_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "church_access_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      church_access_list: {
        Row: {
          access: number
          access_detail: number
          active: boolean
          create_at: string
          create_id: number
          id: number
        }
        Insert: {
          access: number
          access_detail: number
          active?: boolean
          create_at?: string
          create_id: number
          id?: number
        }
        Update: {
          access?: number
          access_detail?: number
          active?: boolean
          create_at?: string
          create_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "church_access_list_access_detail_foreign"
            columns: ["access_detail"]
            isOneToOne: false
            referencedRelation: "church_access_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_access_list_access_foreign"
            columns: ["access"]
            isOneToOne: false
            referencedRelation: "church_access"
            referencedColumns: ["id"]
          },
        ]
      }
      church_access_user: {
        Row: {
          access: number
          active: boolean
          create_at: string
          create_id: number
          id: number
          user_id: number
        }
        Insert: {
          access: number
          active?: boolean
          create_at?: string
          create_id: number
          id?: number
          user_id: number
        }
        Update: {
          access?: number
          active?: boolean
          create_at?: string
          create_id?: number
          id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "church_access_user_access_foreign"
            columns: ["access"]
            isOneToOne: false
            referencedRelation: "church_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_access_user_user_id_foreign"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_liturgy: {
        Row: {
          active: boolean
          create_at: string
          create_id: number
          id: number
          liturgy: Json
          name: string
          service: number
        }
        Insert: {
          active?: boolean
          create_at?: string
          create_id: number
          id: number
          liturgy: Json
          name: string
          service: number
        }
        Update: {
          active?: boolean
          create_at?: string
          create_id?: number
          id?: number
          liturgy?: Json
          name?: string
          service?: number
        }
        Relationships: [
          {
            foreignKeyName: "church_liturgy_service_foreign"
            columns: ["service"]
            isOneToOne: false
            referencedRelation: "church_service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_liturgy_user_foreign"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_log_activity: {
        Row: {
          action: string
          action_detail: Json | null
          create_at: string
          create_identity: string
          data_identity: Json | null
          fn_id: number
          id: number
          table_name: string
        }
        Insert: {
          action: string
          action_detail?: Json | null
          create_at?: string
          create_identity: string
          data_identity?: Json | null
          fn_id: number
          id?: number
          table_name: string
        }
        Update: {
          action?: string
          action_detail?: Json | null
          create_at?: string
          create_identity?: string
          data_identity?: Json | null
          fn_id?: number
          id?: number
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_log_activity_fn_id_fkey"
            columns: ["fn_id"]
            isOneToOne: false
            referencedRelation: "church_access_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      church_minister: {
        Row: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
        }
        Insert: {
          active?: boolean
          create_at?: string
          create_id: number
          description: string
          id?: number
          name: string
        }
        Update: {
          active?: boolean
          create_at?: string
          create_id?: number
          description?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_minister_user_foreign"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_minister_scedule: {
        Row: {
          active: boolean
          create_at: string
          create_id: number
          id: number
          service_minister: number
          service_schedule: number
          user_id: number | null
        }
        Insert: {
          active?: boolean
          create_at?: string
          create_id: number
          id?: number
          service_minister: number
          service_schedule: number
          user_id?: number | null
        }
        Update: {
          active?: boolean
          create_at?: string
          create_id?: number
          id?: number
          service_minister?: number
          service_schedule?: number
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "church_minister_scedule_service_minister_foreign"
            columns: ["service_minister"]
            isOneToOne: false
            referencedRelation: "church_service_minister"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_minister_scedule_service_schedule_foreign"
            columns: ["service_schedule"]
            isOneToOne: false
            referencedRelation: "church_service_scedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_minister_scedule_user_foreign"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_praise_and_worship: {
        Row: {
          active: boolean
          create_at: string
          create_id: number
          id: number
          service_scedule: number
        }
        Insert: {
          active?: boolean
          create_at?: string
          create_id: number
          id?: number
          service_scedule: number
        }
        Update: {
          active?: boolean
          create_at?: string
          create_id?: number
          id?: number
          service_scedule?: number
        }
        Relationships: [
          {
            foreignKeyName: "church_praise_and_worship_service_scedule_foreign"
            columns: ["service_scedule"]
            isOneToOne: false
            referencedRelation: "church_service_scedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_praise_and_worship_user_foreign"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_service: {
        Row: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
          worship_scedule_day: string
          worship_scedule_time: string
        }
        Insert: {
          active?: boolean
          create_at?: string
          create_id: number
          description: string
          id?: number
          name: string
          worship_scedule_day: string
          worship_scedule_time: string
        }
        Update: {
          active?: boolean
          create_at?: string
          create_id?: number
          description?: string
          id?: number
          name?: string
          worship_scedule_day?: string
          worship_scedule_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_service"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_service_minister: {
        Row: {
          active: boolean
          create_at: string
          create_id: number
          id: number
          minister: number
          service: number
        }
        Insert: {
          active?: boolean
          create_at?: string
          create_id: number
          id?: number
          minister: number
          service: number
        }
        Update: {
          active?: boolean
          create_at?: string
          create_id?: number
          id?: number
          minister?: number
          service?: number
        }
        Relationships: [
          {
            foreignKeyName: "church_service_minister_minister_foreign"
            columns: ["minister"]
            isOneToOne: false
            referencedRelation: "church_minister"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_service_minister_service_foreign"
            columns: ["service"]
            isOneToOne: false
            referencedRelation: "church_service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_service_minister_user_foreign"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_service_scedule: {
        Row: {
          active: boolean
          announcement: string
          attendee_count: number
          create_at: string
          create_id: number
          id: number
          link_live_record: string
          liturgy: number
          note: string | null
          offering_amount: number
          scedule: string
          service: number
          theme: string
          tithe_amount: number
        }
        Insert: {
          active?: boolean
          announcement: string
          attendee_count: number
          create_at?: string
          create_id: number
          id?: number
          link_live_record: string
          liturgy: number
          note?: string | null
          offering_amount: number
          scedule: string
          service: number
          theme: string
          tithe_amount: number
        }
        Update: {
          active?: boolean
          announcement?: string
          attendee_count?: number
          create_at?: string
          create_id?: number
          id?: number
          link_live_record?: string
          liturgy?: number
          note?: string | null
          offering_amount?: number
          scedule?: string
          service?: number
          theme?: string
          tithe_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "church_service_scedule_iturgy_foreign"
            columns: ["liturgy"]
            isOneToOne: false
            referencedRelation: "church_liturgy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_service_scedule_service_foreign"
            columns: ["service"]
            isOneToOne: false
            referencedRelation: "church_service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_service_scedule_user_foreign"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_service_training_schedule: {
        Row: {
          active: boolean
          create_at: string
          create_id: number
          description: string | null
          id: number
          name: string
          schedule: string
          service_schedule: number
        }
        Insert: {
          active?: boolean
          create_at?: string
          create_id: number
          description?: string | null
          id: number
          name: string
          schedule: string
          service_schedule: number
        }
        Update: {
          active?: boolean
          create_at?: string
          create_id?: number
          description?: string | null
          id?: number
          name?: string
          schedule?: string
          service_schedule?: number
        }
        Relationships: [
          {
            foreignKeyName: "church_service_training_schedule_id_foreign"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "church_service_scedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_service_training_schedule_user_foreign"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_song: {
        Row: {
          active: boolean
          category: string
          create_at: string
          create_id: number
          id: number
          song: Json
        }
        Insert: {
          active?: boolean
          category: string
          create_at?: string
          create_id: number
          id?: number
          song: Json
        }
        Update: {
          active?: boolean
          category?: string
          create_at?: string
          create_id?: number
          id?: number
          song?: Json
        }
        Relationships: [
          {
            foreignKeyName: "church_song_user_foreign"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_song_liturgy: {
        Row: {
          active: boolean
          create_at: string
          create_id: number
          id: number
          name: number
        }
        Insert: {
          active: boolean
          create_at: string
          create_id: number
          id?: number
          name: number
        }
        Update: {
          active?: boolean
          create_at?: string
          create_id?: number
          id?: number
          name?: number
        }
        Relationships: [
          {
            foreignKeyName: "church_song_liturgy_user_foreign"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_song_play_list: {
        Row: {
          active: boolean
          create_at: string
          create_id: number
          id: number
          praise_worship: number
          song: number
          type_liturgy: number
        }
        Insert: {
          active: boolean
          create_at: string
          create_id: number
          id?: number
          praise_worship: number
          song: number
          type_liturgy: number
        }
        Update: {
          active?: boolean
          create_at?: string
          create_id?: number
          id?: number
          praise_worship?: number
          song?: number
          type_liturgy?: number
        }
        Relationships: [
          {
            foreignKeyName: "church_song_play_list_praise_worship_foreign"
            columns: ["praise_worship"]
            isOneToOne: false
            referencedRelation: "church_praise_and_worship"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_song_play_list_song_foreign"
            columns: ["song"]
            isOneToOne: false
            referencedRelation: "church_song"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_song_play_list_type_liturgy_foreign"
            columns: ["type_liturgy"]
            isOneToOne: false
            referencedRelation: "church_song_liturgy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_song_play_list_user_foreign"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_teaching_material: {
        Row: {
          active: boolean
          create_at: string
          create_for: number
          create_id: number
          id: number
          service_scedule: number
          teaching_material: Json
        }
        Insert: {
          active?: boolean
          create_at?: string
          create_for: number
          create_id: number
          id?: number
          service_scedule: number
          teaching_material: Json
        }
        Update: {
          active?: boolean
          create_at?: string
          create_for?: number
          create_id?: number
          id?: number
          service_scedule?: number
          teaching_material?: Json
        }
        Relationships: [
          {
            foreignKeyName: "church_teaching_material_service_scedule_foreign"
            columns: ["service_scedule"]
            isOneToOne: false
            referencedRelation: "church_service_scedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_teaching_material_user_foreign"
            columns: ["create_id"]
            isOneToOne: false
            referencedRelation: "church_user"
            referencedColumns: ["id"]
          },
        ]
      }
      church_user: {
        Row: {
          active: boolean
          addres: string | null
          call_sign: string | null
          create_at: string
          create_id: number
          date_birt: string | null
          full_name: string
          guest: boolean
          guest_desctiption: string | null
          guest_from: string | null
          id: number
          id_user: string
          nij: string
          phone_number: string | null
          photo_url: string | null
          place_birt: string | null
          sosial_media: string | null
          wa: boolean
        }
        Insert: {
          active?: boolean
          addres?: string | null
          call_sign?: string | null
          create_at?: string
          create_id: number
          date_birt?: string | null
          full_name: string
          guest?: boolean
          guest_desctiption?: string | null
          guest_from?: string | null
          id?: number
          id_user: string
          nij: string
          phone_number?: string | null
          photo_url?: string | null
          place_birt?: string | null
          sosial_media?: string | null
          wa?: boolean
        }
        Update: {
          active?: boolean
          addres?: string | null
          call_sign?: string | null
          create_at?: string
          create_id?: number
          date_birt?: string | null
          full_name?: string
          guest?: boolean
          guest_desctiption?: string | null
          guest_from?: string | null
          id?: number
          id_user?: string
          nij?: string
          phone_number?: string | null
          photo_url?: string | null
          place_birt?: string | null
          sosial_media?: string | null
          wa?: boolean
        }
        Relationships: []
      }
      church_user_account: {
        Row: {
          create_at: string | null
          create_id: number
          email: string | null
          id: number
          uid: string | null
          user_id: number
        }
        Insert: {
          create_at?: string | null
          create_id: number
          email?: string | null
          id?: number
          uid?: string | null
          user_id: number
        }
        Update: {
          create_at?: string | null
          create_id?: number
          email?: string | null
          id?: number
          uid?: string | null
          user_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      access_delete: {
        Args: { p_create_identity: number; p_id: number }
        Returns: undefined
      }
      access_detail_get: {
        Args: {
          p_create_identity: number
          p_from: number
          p_search: string
          p_to: number
        }
        Returns: {
          create_at: string
          description: string
          fn_name: string
          id: number
          name: string
          parent_id: number | null
          pseudo_code: string
        }[]
        SetofOptions: {
          from: "*"
          to: "church_access_detail"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      access_detail_get_cb: {
        Args: { p_create_identity: number }
        Returns: {
          id: number
          name: string
        }[]
      }
      access_diactive: {
        Args: { p_active: boolean; p_create_identity: number; p_id: number }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
        }
        SetofOptions: {
          from: "*"
          to: "church_access"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      access_get: {
        Args: {
          p_active: boolean
          p_create_identity: number
          p_from: number
          p_search: string
          p_to: number
        }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
        }[]
        SetofOptions: {
          from: "*"
          to: "church_access"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      access_get_cb: {
        Args: { p_create_identity: number }
        Returns: {
          id: number
          name: string
        }[]
      }
      access_list_delete: {
        Args: {
          p_access: number
          p_access_detail: number[]
          p_create_identity: number
        }
        Returns: undefined
      }
      access_list_get: {
        Args: {
          p_create_identity: number
          p_from: number
          p_search: string
          p_to: number
        }
        Returns: {
          result: Json
        }[]
      }
      access_list_post: {
        Args: {
          p_access: number
          p_access_detail: number[]
          p_create_identity: number
        }
        Returns: undefined
      }
      access_patch: {
        Args: { p_create_identity: number; p_id: number; p_payload: Json }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
        }
        SetofOptions: {
          from: "*"
          to: "church_access"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      access_post: {
        Args: { p_create_identity: number; p_payload: Json }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
        }
        SetofOptions: {
          from: "*"
          to: "church_access"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      access_user_delete: {
        Args: { p_access: number[]; p_create_identity: number; p_user: number }
        Returns: undefined
      }
      access_user_get: {
        Args: {
          p_create_identity: number
          p_from: number
          p_search: string
          p_to: number
        }
        Returns: {
          result: Json
        }[]
      }
      access_user_post: {
        Args: { p_access: number[]; p_create_identity: number; p_user: number }
        Returns: undefined
      }
      minister_delete: {
        Args: { p_create_identity: number; p_id: number }
        Returns: undefined
      }
      minister_diactive: {
        Args: { p_active: boolean; p_create_identity: number; p_id: number }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
        }
        SetofOptions: {
          from: "*"
          to: "church_minister"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      minister_get: {
        Args: {
          p_active: boolean
          p_create_identity: number
          p_from: number
          p_search: string
          p_to: number
        }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
        }[]
        SetofOptions: {
          from: "*"
          to: "church_minister"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      minister_get_cb: {
        Args: { p_create_identity: number }
        Returns: {
          id: number
          name: string
        }[]
      }
      minister_patch: {
        Args: { p_create_identity: number; p_id: number; p_payload: Json }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
        }
        SetofOptions: {
          from: "*"
          to: "church_minister"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      minister_post: {
        Args: { p_create_identity: number; p_payload: Json }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
        }
        SetofOptions: {
          from: "*"
          to: "church_minister"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      service_delete: {
        Args: { p_create_identity: number; p_id: number }
        Returns: undefined
      }
      service_diactive: {
        Args: { p_active: boolean; p_create_identity: number; p_id: number }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
          worship_scedule_day: string
          worship_scedule_time: string
        }
        SetofOptions: {
          from: "*"
          to: "church_service"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      service_get: {
        Args: {
          p_active: boolean
          p_create_identity: number
          p_from: number
          p_search: string
          p_to: number
        }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
          worship_scedule_day: string
          worship_scedule_time: string
        }[]
        SetofOptions: {
          from: "*"
          to: "church_service"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      service_get_cb: {
        Args: { p_create_identity: number }
        Returns: {
          id: number
          name: string
          worship_scedule_day: string
          worship_scedule_time: string
        }[]
      }
      service_patch: {
        Args: { p_create_identity: number; p_id: number; p_payload: Json }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
          worship_scedule_day: string
          worship_scedule_time: string
        }
        SetofOptions: {
          from: "*"
          to: "church_service"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      service_post: {
        Args: { p_create_identity: number; p_payload: Json }
        Returns: {
          active: boolean
          create_at: string
          create_id: number
          description: string
          id: number
          name: string
          worship_scedule_day: string
          worship_scedule_time: string
        }
        SetofOptions: {
          from: "*"
          to: "church_service"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      whoami: {
        Args: never
        Returns: {
          member_id: number
          nij: string
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
  public: {
    Enums: {},
  },
} as const
