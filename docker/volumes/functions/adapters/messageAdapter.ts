import { MessageRepository } from "../repositories/messageRepository.ts";

//ports

import { GetHistoryPort } from "../ports/getHistoryPort.ts";
import { UpdateMessagePort } from "../ports/updateMessagePort.ts";

//models
import { Message, Chat } from "../models/chat.ts";
import { DBInsertResponse } from "../models/dbInsertResponse.ts";

//entities
import { SupabaseChat, SupabaseMessage } from "../entities/supabaseChat.ts";
import { SupabaseInsertResponse } from "../entities/SupabaseInsertResponse.ts";

export class MessageAdapter implements GetHistoryPort, UpdateMessagePort {
    constructor(private repository: MessageRepository) { }

    public async getHistory(chat: Chat): Promise<Chat> {
        let supabaseChat = this.convertChatToSupabaseChat(chat);
        supabaseChat = await this.repository.getHistory(supabaseChat);
        return this.convertSupabaseChatToChat(supabaseChat);
    }

    public async updateMessage(message: Message): Promise<DBInsertResponse> {
        let supabaseMessage = this.convertMessageToSupabaseMessage(message);
        let supabaseInsertResponse = await this.repository.updateMessage(supabaseMessage);
        return this.convertSupabaseInsertResponseToDBInsertResponse(supabaseInsertResponse);
    }

    public async obtainAllMessages(): Promise<Message[]> {
        let supabaseMessages = await this.repository.obtainAllMessages();
        return supabaseMessages.map((message) => this.convertSupabaseMessageToMessage(message));
    }

    private convertChatToSupabaseChat(chat: Chat): SupabaseChat {
        return new SupabaseChat(chat.getID(), chat.getMessages().map((message) => this.convertMessageToSupabaseMessage(message)));
    }

    private convertSupabaseChatToChat(supabaseChat: SupabaseChat): Chat {
        return new Chat(supabaseChat.getID(), supabaseChat.getMessages().map((message) => this.convertSupabaseMessageToMessage(message)));
    }

    private convertMessageToSupabaseMessage(message: Message): SupabaseMessage {
        return new SupabaseMessage(message.getID(), message.getChatID(), message.getQuestion(), message.getDate(), message.getProductNames(), message.getProductIDs(), message.getEmbedding(), message.getAnswer());
    }

    private convertSupabaseMessageToMessage(supabaseMessage: SupabaseMessage): Message {
        return new Message(supabaseMessage.getID(), supabaseMessage.getChatID(), supabaseMessage.getQuestion(), supabaseMessage.getDate(), supabaseMessage.getAnswer(), supabaseMessage.getProductNames(), supabaseMessage.getProductIDs(), supabaseMessage.getEmbedding());
    }

    private convertSupabaseInsertResponseToDBInsertResponse(supabaseInsertResponse: SupabaseInsertResponse): DBInsertResponse {
        return new DBInsertResponse(supabaseInsertResponse.getSuccess(), supabaseInsertResponse.getAnswer());
    }
}
