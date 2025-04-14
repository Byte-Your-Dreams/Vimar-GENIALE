import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from '../../services/supabase.service';
import { ConversationService } from '../../services/conversation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-messagebox',
  standalone: true,
  templateUrl: './messagebox.component.html',
  styleUrls: ['./messagebox.component.css'],
  imports: [CommonModule, FormsModule]
})

export class MessageboxComponent {
  public currentMessage: string = '';
  public maxChars: number = 200;
  public remainingChars: number = this.maxChars;
  public isInputDisabled: boolean = true;
  public containsForbiddenWords: boolean = false;
  public currentConversation: any = null;
  private forbiddenWords: string[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private conversationService: ConversationService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit():void {
    // Cambia la conversazione corrente in base alla conversazione selezionata
    this.conversationService.currentConversation$.subscribe(conversation => {
      this.currentConversation = conversation;
      this.isInputDisabled = !conversation;
      this.resetMessagebox();
    });

    // Load forbidden words only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Carica le parole vietate dal file JSON all'array forbiddenWords
      this.http.get<{ forbiddenWords: string[] }>('assets/forbidden-words.json')
        .subscribe({
          next: (data) => {
            this.forbiddenWords = data.forbiddenWords;
            // console.log('Parole vietate caricate:', this.forbiddenWords);
          },
          error: (error) => {
            console.error('Errore nel caricamento delle parole vietate:', error);
          }
        });
    }
  }

  resetMessagebox(): void {
    this.currentMessage = '';
    this.remainingChars = this.maxChars;
    this.containsForbiddenWords = false;
    
    if (isPlatformBrowser(this.platformId)) {
      const inputChat = document.querySelector('.input-field');
      inputChat?.classList.remove('redBorder');
    }
  }


  handleSendMessage(): void {
    if (!this.currentMessage.trim() || this.isInputDisabled || this.containsForbiddenWords) return;
    const chatId = this.currentConversation.id;
    
    // Crea un messaggio temporaneo da mostrare in chat
    let temporaryUUID: string = "temp_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.conversationService.addTempMessage(temporaryUUID, this.currentMessage);

    // Invia il messaggio al server ad elaborare, e ottiene il id del messaggio dal database
    this.supabaseService.sendQuestion(chatId, this.currentMessage).then((response) => {
      this.conversationService.updateTempMessage(temporaryUUID, response);
      console.log('Messaggio inviato:', response);
      return response.id;
    }).then((chatId) => {
      this.supabaseService.listenMessageChanges(chatId, (data) => {
        console.log('Messaggio aggiornato:', data);
        console.log('Vecchio messaggio:', data.old);
        this.conversationService.updateMessage(data.old.id, data.new);
      });
    });

    this.resetMessagebox();
  }

  handleInputChange(event: any): void {
    const value = event.target.value;
    
    this.currentMessage = value;
    this.remainingChars = 200 - value.length;
    
    // Only check forbidden words if they've been loaded (browser environment)
    if (this.forbiddenWords.length > 0) {
      // Split the text into words and check each word against forbidden words
      const words = value.toLowerCase().split(/\s+/);
      this.containsForbiddenWords = words.some((word: string) => 
        this.forbiddenWords.includes(word)
      );
      
      if (isPlatformBrowser(this.platformId)) {
        const inputChat = document.querySelector('.input-field');
        if (this.containsForbiddenWords) {
          inputChat?.classList.add('redBorder');
        } else {
          inputChat?.classList.remove('redBorder');
        }
      }
    } else {
      this.containsForbiddenWords = false;
    }
  }

  handleKeyDown(event: any): void {
    if (event.key === 'Enter') {
      this.handleSendMessage();
    }
  }
}