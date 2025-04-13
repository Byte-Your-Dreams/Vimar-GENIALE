import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private currentConversationSubject = new BehaviorSubject<any>(null);
  currentConversation$ = this.currentConversationSubject.asObservable();
  
  private currentConversationMessageSubject = new BehaviorSubject<any>(null);
  currentMessages$ = this.currentConversationMessageSubject.asObservable();

  private currentConversationId: string = "";

  static MESSAGE_TYPE = {
    TEMP : "temp",
    UPDATE_ID : "update_id",
    UPDATE : "update"
  }


  constructor(
    private supabaseService: SupabaseService
  ) { }


  setCurrentConversation(conversation: any) {
    this.currentConversationSubject.next(conversation);
    console.log('set new conversation', conversation);
    this.currentConversationId = conversation.id;
  }

  addTempMessage(temporaryId:string, message: string) {
    let tempMessage = {
      id: temporaryId,
      domanda: message,
      risposta: "",
      CreatedAt: new Date().toISOString(),
    }
    this.currentConversationMessageSubject.next({type: ConversationService.MESSAGE_TYPE.TEMP, data: tempMessage});
  }

  updateTempMessage(temporaryId:string, message: any) {
    this.currentConversationMessageSubject.next({type: ConversationService.MESSAGE_TYPE.UPDATE_ID,temporaryId, data: message});
  }

  updateMessage(messageId: string, message: any) {
    this.currentConversationMessageSubject.next({type: ConversationService.MESSAGE_TYPE.UPDATE, data: message});
  }
}