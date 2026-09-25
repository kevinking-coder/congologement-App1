/**
 * Database types — GENERATED from supabase/migrations. Do not edit by hand.
 *
 * Regenerated whenever a migration is added, so this always matches what is actually in the
 * database. Anything written here by hand is lost on the next migration.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id?: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          titre: string;
          description: string;
          prix_usd: number;
          commune: string;
          adresse: string;
          verified: boolean;
          doc_type: string;
          contact_name: string;
          contact_phone: string;
          photo_1: string | null;
          photo_2: string | null;
          photo_3: string | null;
          property_type: string | null;
          bedrooms: number | null;
          bathrooms: number | null;
          surface_m2: number | null;
          furnished: boolean | null;
          land_dimensions: string | null;
          land_usage: string | null;
          stars: number | null;
          price_per_night_usd: number | null;
          available_rooms: number | null;
          amenities: string | null;
          created_at: string;
          max_adults: number | null;
          children_allowed: boolean;
          max_children: number | null;
          province: string;
          latitude: number | null;
          longitude: number | null;
          deposit_months_min: number | null;
          deposit_months_max: number | null;
          deposit_months_required: number | null;
          photo_4: string | null;
          photo_5: string | null;
          photo_6: string | null;
          photo_7: string | null;
          photo_8: string | null;
          photo_9: string | null;
          photo_10: string | null;
        };
        Insert: {
          id: string;
          user_id?: string;
          category: string;
          titre: string;
          description?: string;
          prix_usd?: number;
          commune?: string;
          adresse?: string;
          verified?: boolean;
          doc_type?: string;
          contact_name?: string;
          contact_phone?: string;
          photo_1?: string | null;
          photo_2?: string | null;
          photo_3?: string | null;
          property_type?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          surface_m2?: number | null;
          furnished?: boolean | null;
          land_dimensions?: string | null;
          land_usage?: string | null;
          stars?: number | null;
          price_per_night_usd?: number | null;
          available_rooms?: number | null;
          amenities?: string | null;
          created_at?: string;
          max_adults?: number | null;
          children_allowed?: boolean;
          max_children?: number | null;
          province?: string;
          latitude?: number | null;
          longitude?: number | null;
          deposit_months_min?: number | null;
          deposit_months_max?: number | null;
          deposit_months_required?: number | null;
          photo_4?: string | null;
          photo_5?: string | null;
          photo_6?: string | null;
          photo_7?: string | null;
          photo_8?: string | null;
          photo_9?: string | null;
          photo_10?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          titre?: string;
          description?: string;
          prix_usd?: number;
          commune?: string;
          adresse?: string;
          verified?: boolean;
          doc_type?: string;
          contact_name?: string;
          contact_phone?: string;
          photo_1?: string | null;
          photo_2?: string | null;
          photo_3?: string | null;
          property_type?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          surface_m2?: number | null;
          furnished?: boolean | null;
          land_dimensions?: string | null;
          land_usage?: string | null;
          stars?: number | null;
          price_per_night_usd?: number | null;
          available_rooms?: number | null;
          amenities?: string | null;
          created_at?: string;
          max_adults?: number | null;
          children_allowed?: boolean;
          max_children?: number | null;
          province?: string;
          latitude?: number | null;
          longitude?: number | null;
          deposit_months_min?: number | null;
          deposit_months_max?: number | null;
          deposit_months_required?: number | null;
          photo_4?: string | null;
          photo_5?: string | null;
          photo_6?: string | null;
          photo_7?: string | null;
          photo_8?: string | null;
          photo_9?: string | null;
          photo_10?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          phone?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          listing_id: string;
          user_id: string;
          reason: string;
          details: string;
          created_at: string;
        };
        Insert: {
          id: string;
          listing_id: string;
          user_id?: string;
          reason: string;
          details?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          user_id?: string;
          reason?: string;
          details?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Favorite = Database['public']['Tables']['favorites']['Row'];
export type Listing = Database['public']['Tables']['listings']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
