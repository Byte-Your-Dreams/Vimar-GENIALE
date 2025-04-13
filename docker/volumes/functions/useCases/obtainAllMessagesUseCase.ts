import { ObtainAllMessagesPort } from '../ports/obtainAllMessagesPort.ts';
import { Message } from '../models/chat.ts';

export class ObtainAllMessagesUseCase {
    constructor(private obtainAllMessagesPort: ObtainAllMessagesPort) { }

    public async obtainAllMessages(): Promise<Message[]> {
        try {
            return await this.obtainAllMessagesPort.obtainAllMessages();
        }
        catch (error) {
            throw error;
        }
    }
}