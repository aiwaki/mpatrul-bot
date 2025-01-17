import { supabase, handleError, fetchData, updateField } from './client';
import type { Chat } from 'telegraf/types';

const isPrivateChat = (chat: Chat): chat is Chat & { tg_first_name: string; tg_username?: string } => {
    return chat.type === 'private';
};

export const fetchChats = async (): Promise<Chat[]> => {
    return fetchData('chats');
};

export const insertChat = async (chat: Chat): Promise<void> => {
    try {
        if (!isPrivateChat(chat)) {
            console.log(`Skipping non-private chat with ID: ${chat.id}`);
            return;
        }
        const { error } = await supabase.from('chats').insert([{
            tg_id: chat.id,
            tg_first_name: chat.first_name,
            tg_username: chat.username,
        }]);
        if (error) {
            if (error.code === '23505') {
                console.warn(`Chat ${chat.id} already exists.`);
            } else {
                handleError('Error inserting chat:', error);
            }
            return;
        }
        console.log(`Chat ${chat.id} inserted successfully.`);
    } catch (error) {
        console.error('Unexpected error in insertChat:', error);
    }
};

export const deleteChat = async (tg_id: number): Promise<void> => {
    await updateField('chats', 'tg_id', tg_id, {});
    console.log(`Chat ${tg_id} deleted.`);
};

export const updateLogin = async (tg_id: number, mpatrul_login: string): Promise<void> => {
    await updateField('chats', 'tg_id', tg_id, { mpatrul_login });
    console.log(`Login for chat ${tg_id} updated.`);
};

export const updatePassword = async (tg_id: number, mpatrul_password: string): Promise<void> => {
    await updateField('chats', 'tg_id', tg_id, { mpatrul_password });
    console.log(`Password for chat ${tg_id} updated.`);
};

export const updateToken = async (tg_id: number, mpatrul_token: string): Promise<void> => {
    await updateField('chats', 'tg_id', tg_id, { mpatrul_token });
    console.log(`Token for chat ${tg_id} updated.`);
};

export const fetchLogin = async (tg_id: number): Promise<string | null> => {
    const data = await fetchData('chats', { tg_id });
    return data.length > 0 ? data[0].mpatrul_login : null;
};

export const fetchPassword = async (tg_id: number): Promise<string | null> => {
    const data = await fetchData('chats', { tg_id });
    return data.length > 0 ? data[0].mpatrul_password : null;
};

export const fetchToken = async (tg_id: number): Promise<string | null> => {
    const data = await fetchData('chats', { tg_id });
    return data.length > 0 ? data[0].mpatrul_token : null;
};