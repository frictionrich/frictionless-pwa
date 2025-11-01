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
          // AI Analysis Fields
          industry: string | null
          headquarters: string | null
          funding_ask: string | null
          business_model: string | null
          value_proposition: string | null
          target_market: string | null
          competitive_landscape: any[] | null
          key_differentiators: any[] | null
          key_challenges: any[] | null
          team_size: number | null
          team_members: any[] | null
          mrr: number | null
          revenue: number | null
          burn_rate: number | null
          runway_months: number | null
          total_raised: number | null
          valuation: number | null
          traction: string | null
          product_status: string | null
          geography_focus: string[] | null
          use_of_funds: string | null
          market_size: string | null
          market_growth: string | null
          recommendations: any[] | null
          strategic_insights: any[] | null
          readiness_assessment: any | null
          ai_analyzed_at: string | null
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
          // AI Analysis Fields
          industry?: string | null
          headquarters?: string | null
          funding_ask?: string | null
          business_model?: string | null
          value_proposition?: string | null
          target_market?: string | null
          competitive_landscape?: any[] | null
          key_differentiators?: any[] | null
          key_challenges?: any[] | null
          team_size?: number | null
          team_members?: any[] | null
          mrr?: number | null
          revenue?: number | null
          burn_rate?: number | null
          runway_months?: number | null
          total_raised?: number | null
          valuation?: number | null
          traction?: string | null
          product_status?: string | null
          geography_focus?: string[] | null
          use_of_funds?: string | null
          market_size?: string | null
          market_growth?: string | null
          recommendations?: any[] | null
          strategic_insights?: any[] | null
          readiness_assessment?: any | null
          ai_analyzed_at?: string | null
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
          // AI Analysis Fields
          industry?: string | null
          headquarters?: string | null
          funding_ask?: string | null
          business_model?: string | null
          value_proposition?: string | null
          target_market?: string | null
          competitive_landscape?: any[] | null
          key_differentiators?: any[] | null
          key_challenges?: any[] | null
          team_size?: number | null
          team_members?: any[] | null
          mrr?: number | null
          revenue?: number | null
          burn_rate?: number | null
          runway_months?: number | null
          total_raised?: number | null
          valuation?: number | null
          traction?: string | null
          product_status?: string | null
          geography_focus?: string[] | null
          use_of_funds?: string | null
          market_size?: string | null
          market_growth?: string | null
          recommendations?: any[] | null
          strategic_insights?: any[] | null
          readiness_assessment?: any | null
          ai_analyzed_at?: string | null
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
      matches: {
        Row: {
          id: string
          startup_id: string
          investor_id: string
          match_percentage: number
          status: 'pending' | 'connected' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          investor_id: string
          match_percentage: number
          status?: 'pending' | 'connected' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          investor_id?: string
          match_percentage?: number
          status?: 'pending' | 'connected' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      readiness_assessments: {
        Row: {
          id: string
          startup_id: string
          pitch_deck_path: string
          overall_score: number | null
          formation: number | null
          business_plan: number | null
          pitch: number | null
          product_readiness: number | null
          technology_maturity: number | null
          go_to_market_readiness: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          pitch_deck_path: string
          overall_score?: number | null
          formation?: number | null
          business_plan?: number | null
          pitch?: number | null
          product_readiness?: number | null
          technology_maturity?: number | null
          go_to_market_readiness?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          pitch_deck_path?: string
          overall_score?: number | null
          formation?: number | null
          business_plan?: number | null
          pitch?: number | null
          product_readiness?: number | null
          technology_maturity?: number | null
          go_to_market_readiness?: number | null
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
      match_status: 'pending' | 'connected' | 'rejected'
    }
  }
}
