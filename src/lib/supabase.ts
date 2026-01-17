
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const DATABASE_CONFIG = {
    tableName: 'properties',
    bucketName: 'property-images'
};
