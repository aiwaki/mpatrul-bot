import type { Chat } from 'telegraf/types';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './client';

const handleError = (
    message: string, error: PostgrestError
): never => {
    console.error(`${message} ${error.message}`);
    throw new Error(`${message} ${error.message}`);
}

const isPrivateChat = (
    chat: Chat
): chat is Chat & { tg_first_name: string; tg_username?: string } => {
    return chat.type === 'private';
}

export const fetchChats = async (
): Promise<Chat[]> => {
    try {
        const { data, error } = await supabase.from('chats').select();
        if (error) handleError('Error fetching chats:', error);
        return (data ?? []) as Chat[];
    } catch (error) {
        console.error('Unexpected error in fetchChats:', error);
        return [];
    }
}

export const insertChat = async (
    chat: Chat
): Promise<void> => {
    try {
        if (!isPrivateChat(chat)) {
            console.log(`Skipping non-private chat with ID: ${chat.id}`);
            return;
        }

        const chatExists = await checkChatExists(chat.id);
        if (chatExists) {
            console.log(`Chat ${chat.id} already exists.`);
            return;
        }

        const { error: insertError } = await supabase.from('chats').insert([{
            tg_id: chat.id,
            tg_first_name: chat.first_name,
            tg_username: chat.username,
        }]);

        if (insertError) handleError('Error inserting chat:', insertError);
        console.log(`Chat ${chat.id} inserted successfully.`);
    } catch (error) {
        console.error('Unexpected error in insertChat:', error);
    }
}

const checkChatExists = async (
    tg_id: number
): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('tg_id')
            .eq('tg_id', tg_id)
            .maybeSingle();

        if (error) handleError('Error checking chat existence:', error);
        return !!data;
    } catch (error) {
        console.error('Unexpected error in checkChatExists:', error);
        return false;
    }
}

export const updateLogin = async (
    tg_id: number, mpatrul_login: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('chats')
            .update({ mpatrul_login })
            .eq('tg_id', tg_id);

        if (error) handleError('Error updating login:', error);
        console.log(`Login for chat ${tg_id} updated successfully.`);
    } catch (error) {
        console.error('Unexpected error in updateLogin:', error);
    }
}

export const updatePassword = async (
    tg_id: number, mpatrul_password: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('chats')
            .update({ mpatrul_password })
            .eq('tg_id', tg_id);

        if (error) handleError('Error updating password:', error);
        console.log(`Password for chat ${tg_id} updated successfully.`);
    } catch (error) {
        console.error('Unexpected error in updatePassword:', error);
    }
}

export const fetchLogin = async (
    tg_id: number
): Promise<string> => {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('mpatrul_login')
            .eq('tg_id', tg_id)
            .single();

        if (error) handleError('Error fetching chats:', error);
        return data?.mpatrul_login;
    } catch (error) {
        console.error('Unexpected error in fetchLogin:', error);
        return "";
    }
}

export const fetchPassword = async (
    tg_id: number
): Promise<string> => {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('mpatrul_password')
            .eq('tg_id', tg_id)
            .single();

        if (error) handleError('Error fetching chats:', error);
        return data?.mpatrul_password;
    } catch (error) {
        console.error('Unexpected error in fetchPassword:', error);
        return "";
    }
}

export const updateToken = async (
    tg_id: number, mpatrul_token: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('chats')
            .update({ mpatrul_token })
            .eq('tg_id', tg_id);

        if (error) handleError('Error updating token:', error);
        console.log(`Token for chat ${tg_id} updated successfully.`);
    } catch (error) {
        console.error('Unexpected error in updateToken:', error);
    }
}

export const fetchToken = async (
    tg_id: number
): Promise<string> => {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('mpatrul_token')
            .eq('tg_id', tg_id)
            .maybeSingle();

        if (error) handleError('Error fetching token:', error);
        return data?.mpatrul_token;
    } catch (error) {
        console.error('Unexpected error in hasToken:', error);
        return "";
    }
}

export const insertLink = async (
    tg_id: number, url: string
): Promise<boolean> => {
    try {
        const { error: insertError } = await supabase.from('links').insert([{
            tg_id,
            url,
        }]);

        if (insertError) {
            if (insertError.code === '23505') {
                console.warn(`Link ${url} from ${tg_id} already exists.`);
            } else {
                handleError('Error inserting link:', insertError);
            }
            return true;
        }

        console.log(`Link ${url} from ${tg_id} inserted successfully.`);
    } catch (error) {
        console.error('Unexpected error in insertLink:', error);
    }
    return false;
}