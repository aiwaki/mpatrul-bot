import { supabase, handleError, fetchData } from './client';

export interface Classification {
    label: string;
    content: string;
    score: number;
}

export interface Page {
    title: string;
    description: string;
    url: string;
    classify_out_id?: number | null;
}

export const insertClassification = async (classification: Classification): Promise<number | null> => {
    const { data, error } = await supabase
        .from('classifications')
        .insert([classification])
        .select('id')
        .single();

    if (error) {
        handleError('Error inserting classification:', error);
    }

    return data?.id ?? null;
};

export const insertClassificationsBatch = async (classifications: Classification[]): Promise<number[]> => {
    const { data, error } = await supabase
        .from('classifications')
        .insert(classifications)
        .select('id');

    if (error) {
        handleError('Error batch inserting classifications:', error);
    }

    return data?.map((item) => item.id) ?? [];
};

export const insertPage = async (page: Page): Promise<void> => {
    const { error } = await supabase
        .from('pages')
        .insert([page]);

    if (error) {
        handleError('Error inserting page:', error);
    }
};

export const insertPagesBatch = async (pages: Page[]): Promise<number[]> => {
    const { data, error } = await supabase
        .from('pages')
        .insert(pages)
        .select('id');

    if (error) {
        handleError('Error batch inserting pages:', error);
    }

    return data?.map((item) => item.id) ?? [];
};

export const fetchClassificationsByLabel = async (label: string): Promise<Classification[]> => {
    return await fetchData('classifications', { label }) as Classification[];
};

export const fetchPagesByKeyword = async (keyword: string): Promise<Page[]> => {
    const { data, error } = await supabase
        .from('pages')
        .select()
        .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);

    if (error) {
        handleError('Error fetching pages by keyword:', error);
    }

    return data as Page[] ?? [];
};

export const isPageExist = async (url: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('pages')
        .select('id')
        .eq('url', url)
        .single();

    if (error && error.code !== 'PGRST116') {
        handleError('Error checking if page exists:', error);
    }

    return data !== null;
};