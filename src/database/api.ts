import type { Chat } from 'telegraf/types';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './client.ts';

function handleError(message: string, error: PostgrestError): never {
    console.error(`${message} ${error.message}`);
    throw new Error(`${message} ${error.message}`);
}

function isPrivateChat(chat: Chat): chat is Chat & { tg_first_name: string; tg_username?: string } {
    return chat.type === 'private';
}

export async function fetchChats(): Promise<Chat[]> {
    try {
        const { data, error } = await supabase.from('chats').select();
        if (error) handleError('Error fetching chats:', error);
        return (data ?? []) as Chat[];
    } catch (error) {
        console.error('Unexpected error in fetchChats:', error);
        return [];
    }
}

export async function insertChat(chat: Chat): Promise<void> {
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

async function checkChatExists(tg_id: number): Promise<boolean> {
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

export async function updateLogin(tg_id: number, mpatrul_login: string): Promise<void> {
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

export async function updatePassword(tg_id: number, mpatrul_password: string): Promise<void> {
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

export async function fetchLogin(tg_id: number): Promise<string> {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('mpatrul_login')
            .eq('tg_id', tg_id)
            .single();

        if (error) handleError('Error fetching chats:', error);
        return data.mpatrul_login;
    } catch (error) {
        console.error('Unexpected error in fetchLogin:', error);
        return "";
    }
}

export async function fetchPassword(tg_id: number): Promise<string> {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('mpatrul_password')
            .eq('tg_id', tg_id)
            .single();

        if (error) handleError('Error fetching chats:', error);
        return data.mpatrul_password;
    } catch (error) {
        console.error('Unexpected error in fetchPassword:', error);
        return "";
    }
}

export async function updateToken(tg_id: number, mpatrul_token: string): Promise<void> {
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

export async function fetchToken(tg_id: number): Promise<string> {
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