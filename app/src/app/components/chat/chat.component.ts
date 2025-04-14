import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConversationService } from '../../services/conversation.service';
import { SupabaseService } from '../../services/supabase.service';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';
import { MessageboxComponent } from '../messagebox/messagebox.component';
import { HttpClientModule } from '@angular/common/http'; // LASCIA PERCHE' SERVE PER IL FEEDBACK
import { MarkdownModule } from 'ngx-markdown';

interface Chat {
  id: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [CommonModule, MessageboxComponent, HttpClientModule, MarkdownModule]
})

export class ChatComponent implements OnInit {
  public selectedFeedback: string | null = null;
  public currentConversation: any;
  private chats: Chat[] = [];
  private userId: string | null = null;
  public showError: boolean = false;
  private subscription: Subscription = new Subscription();
  private timeoutId: any;
  private timeoutDuration: number = 300000; 


  @ViewChild('messagesEndRef') messagesEndRef!: ElementRef;

  constructor(
    private conversationService: ConversationService,
    private supabaseService: SupabaseService,
    public dialog: MatDialog,
    private userService: UserService
  ) { }

  ngOnInit():void {
    this.subscription.add(
      this.conversationService.currentConversation$.subscribe(conversation => {
        this.currentConversation = conversation;
        console.log('Current conversation:', this.currentConversation);
      this.clearTimeout();
      if (this.currentConversation?.messages?.length) {
        const lastMessage = this.currentConversation.messages.at(-1);
        if (lastMessage?.domanda && !lastMessage?.risposta) {
          this.startTimeout();
        }
      }
      })
    );

    this.userService.user$.subscribe(user => {
      if (user) {
        console.log('[Chat] Got user ID:', user.id);
        this.userId = user.id;
        this.supabaseService.chats$.subscribe(chats => {
          this.chats = chats;
        });
        if (this.userId) {
          this.supabaseService.getChatsForUser(this.userId);
        }
      } else {
        console.log('[Chat] User not ready yet');
      }
    });

    this.subscription.add(
      this.conversationService.currentMessages$.subscribe(messages => {
        if (this.currentConversation == null) {
          console.log('nessuna conversazione selezionata');
          return;
        }
        if (this.currentConversation?.messages == null) {
          this.currentConversation.messages = [];
        }

        console.log('有一条新消息', messages);
        switch (messages.type) {

          case ConversationService.MESSAGE_TYPE.TEMP: // push only
            this.currentConversation.messages.push(messages.data);
            this.scrollToBottom();
            break;

          case ConversationService.MESSAGE_TYPE.UPDATE_ID: // replace all
            const index = this.currentConversation.messages.findIndex((m: any) => m.id == messages.temporaryId);
            if (index !== -1) {
              this.currentConversation.messages[index] = messages.data;
              this.scrollToBottom();
            }
            break;
          
          case ConversationService.MESSAGE_TYPE.UPDATE: // replace all
            // find index with same id updatte
            case ConversationService.MESSAGE_TYPE.UPDATE:
          const index2 = this.currentConversation.messages.findIndex((m: any) => m.id == messages.data.id);
          if (index2 !== -1) {
            this.currentConversation.messages[index2] = messages.data;
            this.scrollToBottom();
            if (messages.data.risposta) {
              this.clearTimeout();
            } else if (messages.data.domanda && !messages.data.risposta) {
              this.startTimeout();
            }
          }
          break;
        }
      })
    );
  }

  startTimeout():void {
    this.clearTimeout(); 
    this.timeoutId = setTimeout(() => {
      console.warn('Timeout:non ha ricevuto la risposta');
      this.currentConversation.messages.push({
        risposta: 'Timeout rimanda la domanda',
        timestamp: new Date().toISOString()
      });
      this.scrollToBottom();
    }, this.timeoutDuration);
  }
  
  clearTimeout():void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  
  ngOnDestroy():void {
    this.subscription.unsubscribe();
    this.clearTimeout();
  }

  handleFeedbackClick(feedback: 'thumbsUp' | 'thumbsDown'): void {
    const isPositive = feedback === 'thumbsUp';
    const dialogRef = this.dialog.open(FeedbackDialogComponent, {
      width: '250px',
      data: { isPositive }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result !== undefined) {
        this.selectedFeedback = feedback;
        const feedbackCheck = feedback === 'thumbsUp';
        const feedbackText = result;

        if (this.currentConversation) {
          const messageId = this.currentConversation.messages.at(-1)?.id;
          if (messageId) {
            try {
              await this.supabaseService.submitFeedback(messageId, feedbackCheck, feedbackText);
            } catch (error) {
              console.error('Error submitting feedback:', error);
            }
          }
        }
      }
    });
  }

  async newChat():Promise<void> {
    if (this.userId) {
      if (this.chats.length >= 3) {
        this.showError = true;
        setTimeout(() => {
          this.showError = false;
        }, 5000);
        return;
      }

      // Crea e seleziona automaticamente la nuova conversazione
      const newChat = await this.supabaseService.newChat(this.userId);
      await this.supabaseService.getChatsForUser(this.userId);
      if (newChat) {
        console.log('New chat:', newChat[0]);
        this.selectChat(newChat[0].id);
      }
    }
  }

  selectChat(chatId: number):void {
    const selectedChat = this.chats.find(chat => chat.id === chatId);
    this.conversationService.setCurrentConversation(selectedChat);
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.messagesEndRef?.nativeElement) {
          this.messagesEndRef.nativeElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end' 
          });
        }
      } catch (err) {
        console.error('Scroll to botton failed:', err);
      }
    }, 100);
  }

  isTimeoutMessage(message: any): boolean {
    return message?.risposta === 'Timeout rimanda la domanda';
  }
}