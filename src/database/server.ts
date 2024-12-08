import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from './client.js'

function handleError(message: string, error: PostgrestError) {
    console.error(message, error.message)
}

export async function fetchChats() {
    const { data, error } = await supabase.from('chats').select()
    if (error) handleError('Error fetching chats:', error)
    return { chats: data ?? [] }
}

export async function insertChat(chat: any) {
    const { data, error } = await supabase
        .from('chats')
        .select('id')
        .eq('id', chat.id)
        .maybeSingle()

    if (error) handleError('Error checking chat existence:', error)

    if (data) {
        console.log(`Chat ${chat.id} already exists.`)
        return
    }

    const { error: insertError } = await supabase
        .from('chats')
        .insert([
            { id: chat.id, first_name: chat.first_name, username: chat.username },
        ])
    if (insertError) handleError('Error inserting chat:', insertError)
}