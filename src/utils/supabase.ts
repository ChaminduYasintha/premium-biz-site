// ============================================
// SUPABASE UTILITIES
// ============================================
// Utilities for fetching data from Supabase

import { createClient } from '@supabase/supabase-js';

// Types
export interface Property {
    id: string;
    created_at: string;
    title: string;
    price: number;
    city: string;
    description: string;
    image_url: string;
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn('⚠️ Supabase credentials not found in environment variables.');
}

/**
 * Fetch all properties from Supabase
 */
export async function fetchProperties(): Promise<Property[]> {
    if (!supabase) {
        console.warn('⚠️ Supabase client not initialized. Skipping properties fetch.');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching properties:', error.message);
            return [];
        }

        console.log(`✅ Fetched ${data?.length || 0} properties from Supabase.`);
        return data || [];
    } catch (error) {
        console.error('❌ Unexpected error fetching properties:', error);
        return [];
    }
}

/**
 * Fetch a single property by ID
 */
export async function fetchPropertyById(id: string): Promise<Property | null> {
    if (!supabase) {
        console.warn('⚠️ Supabase client not initialized.');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`❌ Error fetching property ${id}:`, error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error('❌ Unexpected error fetching property:', error);
        return null;
    }
}

/**
 * Format price with commas (e.g., 50000 => "50,000")
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-LK').format(price);
}
