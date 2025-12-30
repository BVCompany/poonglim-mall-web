/**
 * Database Type Definitions
 * 
 * This file contains TypeScript type definitions for the Supabase database schema.
 * These types are used to provide type safety when interacting with the database.
 * 
 * NOTE: Currently using placeholder types as Supabase is not yet configured.
 * TODO: Generate actual types using `npx supabase gen types typescript` when Supabase is set up.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string;
    };
  };
}

