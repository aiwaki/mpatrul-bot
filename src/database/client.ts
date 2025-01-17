import { createClient } from '@supabase/supabase-js'
import type { PostgrestError } from '@supabase/supabase-js';

export const supabase = createClient(
    `https://${process.env.SUPABASE_URL}.supabase.co`,
    process.env.SUPABASE_KEY as string
)

export const handleError = (message: string, error: PostgrestError): never => {
    console.error(`${message} ${error.message}`);
    throw new Error(`${message} ${error.message}`);
};

export const updateField = async (table: string, idField: string, idValue: number, data: Record<string, any>): Promise<void> => {
    const { error } = await supabase.from(table).update(data).eq(idField, idValue);
    if (error) {
        handleError(`Error updating ${table}:`, error);
    }
};

export const fetchData = async (table: string, filters: Record<string, any> = {}): Promise<any[]> => {
    let query = supabase.from(table).select();
    for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
    }
    const { data, error } = await query;
    if (error) {
        handleError(`Error fetching data from ${table}:`, error);
    }
    return data ?? [];
};