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
      batches: {
        Row: {
          id: string
          batch_id: string
          product_name: string
          manufacturer_wallet: string
          current_owner_wallet: string
          mfg_date: string
          exp_date: string
          status: number
          ipfs_hash: string | null
          batch_pda: string
          init_tx_signature: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          product_name: string
          manufacturer_wallet: string
          current_owner_wallet: string
          mfg_date: string
          exp_date: string
          status: number
          ipfs_hash?: string | null
          batch_pda: string
          init_tx_signature: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          product_name?: string
          manufacturer_wallet?: string
          current_owner_wallet?: string
          mfg_date?: string
          exp_date?: string
          status?: number
          ipfs_hash?: string | null
          batch_pda?: string
          init_tx_signature?: string
          created_at?: string
          updated_at?: string
        }
      }
      batch_transfers: {
        Row: {
          id: string
          batch_id: string
          from_wallet: string
          to_wallet: string
          tx_signature: string
          transfer_date: string
        }
        Insert: {
          id?: string
          batch_id: string
          from_wallet: string
          to_wallet: string
          tx_signature: string
          transfer_date?: string
        }
        Update: {
          id?: string
          batch_id?: string
          from_wallet?: string
          to_wallet?: string
          tx_signature?: string
          transfer_date?: string
        }
      }
      batch_flags: {
        Row: {
          id: string
          batch_id: string
          flagged_by_wallet: string
          reason: string
          tx_signature: string
          flagged_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          flagged_by_wallet: string
          reason: string
          tx_signature: string
          flagged_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          flagged_by_wallet?: string
          reason?: string
          tx_signature?: string
          flagged_at?: string
        }
      }
      qr_codes: {
        Row: {
          id: string
          tx_signature: string
          batch_id: string
          medicine_name: string
          owner_address: string
          is_consumed: boolean
          consumed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tx_signature: string
          batch_id: string
          medicine_name: string
          owner_address: string
          is_consumed?: boolean
          consumed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tx_signature?: string
          batch_id?: string
          medicine_name?: string
          owner_address?: string
          is_consumed?: boolean
          consumed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_events: {
        Row: {
          id: string
          event_type: string
          batch_id: string | null
          user_wallet: string
          transaction_signature: string | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          timestamp: string
          severity: string
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          batch_id?: string | null
          user_wallet: string
          transaction_signature?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
          severity?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          batch_id?: string | null
          user_wallet?: string
          transaction_signature?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
          severity?: string
          created_at?: string
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
      [_ in never]: never
    }
  }
}