export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'startup' | 'investor' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'startup' | 'investor' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'startup' | 'investor' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      startup_profiles: {
        Row: {
          id: string
          user_id: string
          company_name: string | null
          website: string | null
          pitch_deck_url: string | null
          description: string | null
          sector: string | null
          stage: string | null
          readiness_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name?: string | null
          website?: string | null
          pitch_deck_url?: string | null
          description?: string | null
          sector?: string | null
          stage?: string | null
          readiness_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string | null
          website?: string | null
          pitch_deck_url?: string | null
          description?: string | null
          sector?: string | null
          stage?: string | null
          readiness_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      investor_profiles: {
        Row: {
          id: string
          user_id: string
          organization_name: string | null
          website: string | null
          investor_deck_url: string | null
          description: string | null
          focus_sectors: string[] | null
          focus_stages: string[] | null
          ticket_size_min: number | null
          ticket_size_max: number | null
          geography: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_name?: string | null
          website?: string | null
          investor_deck_url?: string | null
          description?: string | null
          focus_sectors?: string[] | null
          focus_stages?: string[] | null
          ticket_size_min?: number | null
          ticket_size_max?: number | null
          geography?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_name?: string | null
          website?: string | null
          investor_deck_url?: string | null
          description?: string | null
          focus_sectors?: string[] | null
          focus_stages?: string[] | null
          ticket_size_min?: number | null
          ticket_size_max?: number | null
          geography?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'startup' | 'investor' | 'admin'
    }
  }
}
