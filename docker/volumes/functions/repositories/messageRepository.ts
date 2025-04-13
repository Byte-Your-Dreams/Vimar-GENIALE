import { SupabaseClient } from 'jsr:@supabase/supabase-js';
import { SupabaseMessage, SupabaseChat } from '../entities/supabaseChat.ts';
import { SupabaseInsertResponse } from '../entities/SupabaseInsertResponse.ts';

export class MessageRepository {

    constructor(private client: SupabaseClient) { }

    public async getHistory(chat: SupabaseChat): Promise<SupabaseChat> {
        const { data, error} = await this.client.rpc('getlastmessages', { chat_id: chat.getID() });
        if (error) {
            throw new Error(error.message);
        }
        if (!data) {
            throw new Error('No data found');
        }
        return new SupabaseChat(chat.getID(), data.map((message: any) => new SupabaseMessage(message.id, chat.getID(), message.domanda, new Date(), [], [], [], message.risposta)));
    }

    public async obtainAllMessages(): Promise<SupabaseMessage[]> {
        const { data, error } = await this.client.from('messaggio').select('id, chat, domanda');
        if (error) {
            throw new Error(error.message);
        }
        if (!data) {
            throw new Error('No data found');
        }
        return data.map((message: any) => new SupabaseMessage(message.id, message.chat_id, message.domanda, new Date(), [], [], [], ''));
    }

    public async updateMessage(message: SupabaseMessage): Promise<SupabaseInsertResponse> {
        const { error } = await this.client.from('messaggio').update({'risposta': message.getAnswer()}).eq('id', message.getID());
        if (error) {
            return new SupabaseInsertResponse(false, error.message);
        }

        return new SupabaseInsertResponse(true, 'Update successful');
    }
    
}