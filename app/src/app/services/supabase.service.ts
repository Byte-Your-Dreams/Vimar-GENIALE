import { AuthChangeEvent, Session, createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Injectable, NgZone, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService{
  private supabase!: SupabaseClient;
  private chatsSubject = new BehaviorSubject<any[]>([]);
  chats$ = this.chatsSubject.asObservable();

  constructor(private ngZone: NgZone,private cookieService: CookieService, @Inject(PLATFORM_ID) private platformId: Object) {
    let supabaseUrl = ``;
    if (isPlatformBrowser(this.platformId)) {
      supabaseUrl = `${window.location.protocol}//${window.location.hostname}:${environment.supabasePort}`;
    } else {
      supabaseUrl = `http://localhost:${environment.supabasePort}`;
    }
    
    this.ngZone.runOutsideAngular(() => {
      this.supabase = createClient(supabaseUrl, environment.supabaseKey, {
        auth: {
          autoRefreshToken: false
        }
      });
    });
    this.testSupabaseConnection();
  }


  private handleSupabaseError(error: any): void {
    if (isPlatformBrowser(this.platformId)) {
      if (error.status === 401 || error.code === 'PGRST301' || error.message?.includes('JWT')) {
        alert("ERRORE 401 | Supabase non è al momento raggiungibile");
      } else if (!navigator.onLine) {
        alert("ERRORE | Connessione internet non disponibile");
      } else {
        alert(`ERRORE ${error.status || 'sconosciuto'} | Supabase non è al momento raggiungibile`);
      }
      console.error('Errore Supabase:', error);
    }
  }

  private async testSupabaseConnection(): Promise<void> {
    try {
      const { error } = await this.supabase.from('chat').select('*').limit(1);
      if (error) {
        console.error('Supabase connection failed:', error);
        alert('ERRORE | Impossibile connettersi a Supabase.');
      }
    } catch (err) {
      console.error('Unexpected error during Supabase connection test:', err);
      alert('ERRORE | Connessione a Supabase non riuscita. Riprova più tardi.');
    }
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  signInAnonymously() {
    return this.supabase.auth.signInAnonymously();
  }

  async signInWithPassword(credentials: { email: string; password: string }) {
    const { data, error } = await this.supabase.auth.signInWithPassword(credentials);
    if (data.session) {
      this.cookieService.set('sb:token', JSON.stringify(data));
    }
    return { data, error };
  }

  async saveAnonSession() {
    try {
      const anonymousSession = (await this.getSession()).data.session;
      console.log('Anonymous session', anonymousSession);
      if (anonymousSession) {
        this.cookieService.set('anonymous-session', JSON.stringify(anonymousSession), {
          path: '/',
          secure: false,
          sameSite: 'Lax'
        });
      }
    } catch (error) {
      console.error('Error getting anonymous session', error);
    }
  }

  async checkAnonSession(): Promise<boolean> {
    const cookieValue = this.cookieService.get('anonymous-session');
    if (cookieValue) {
      try {
        const anonymousSession = JSON.parse(cookieValue);
        console.log('Anonymous session exists', anonymousSession);
        return true;
      } catch (error) {
        console.error('Invalid anonymous session in cookie:', error);
        return false;
      }
    } else {
      console.log('Anonymous session does not exist');
      return false;
    }
  }
  

  async getUser() {
    const user = this.supabase.auth.getUser();
    return user;
  }

  async getSession() {
    const session = this.supabase.auth.getSession();
    return session; 
  }

  async setSession(session: Session) {
    const SettedSession = this.supabase.auth.setSession(session);
    return SettedSession;
  }

  
  async signOut() {
    await this.supabase.auth.signOut();
  }



  async getChatsForUser(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('get_all_conversations')
        .select('*')
        .eq('utente', userId);
      if (error) {
        console.error('Error fetching chats:', error);
        this.handleSupabaseError(error);
        this.chatsSubject.next([]);
        return [];
      }
      this.chatsSubject.next(data);
      return data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      this.handleSupabaseError(error);
      this.chatsSubject.next([]);
      return [];
    }
  }

  async deleteChat(chatId: string) {
    try {
      const { error } = await this.supabase
        .from('chat')
        .delete()
        .eq('id', chatId);

      if (error) {
        console.error('Error deleting chat:', error);
        this.handleSupabaseError(error);
        return;
      }
      const currentChats = this.chatsSubject.getValue();
      this.chatsSubject.next(currentChats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
      this.handleSupabaseError(error);
    }
  }



  async newChat(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('chat')
        .insert([{ utente: userId }])
        .select('*');

      if (error) {
        console.error('Error creating chat:', error);
        this.handleSupabaseError(error);
        return null;
      }
      if (data) {
        const currentChats = this.chatsSubject.getValue();
        this.chatsSubject.next([...currentChats, ...data]);
      }
      return data;
    } catch (error) {
      console.error('Error creating chat:', error);
      this.handleSupabaseError(error);
      return null;
    }
  }

  async sendQuestion(chatId: string, question: string) {
    try {
      const { data, error } = await this.supabase
        .from('messaggio')
        .insert([{ chat: chatId, domanda: question }])
        .select()
        .single();

      if (error) {
        console.error('Error sending question:', error);
        this.handleSupabaseError(error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error sending question:', error);
      this.handleSupabaseError(error);
      return null;
    }
  }

  async submitFeedback(messageId: string, feedbackCheck: boolean, feedbackText: string): Promise<void> {
    try {
      const feedbackBit = feedbackCheck ? 1 : 0;
      const { error } = await this.supabase
        .from('feedback')
        .insert([
          {
            messaggio: messageId,
            feedback: feedbackBit,
            feedback_text: feedbackText
          }
        ]);

      if (error) {
        console.error('Error submitting feedback:', error);
        this.handleSupabaseError(error);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      this.handleSupabaseError(error);
    }
  }

  async listenMessageChanges(messageId: string, callback: (payload: any) => void) {
    const subscription = this.supabase
      .channel(`public:messaggio:id=eq.${messageId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messaggio', 
          filter: `id=eq.${messageId}` 
        }, 
        callback)
      .subscribe();

      console.log(`id=eq.${messageId}`)
    return subscription;
  }

  async getCountFeedbackMex(): Promise<{ positive_feedback_mex: number, negative_feedback_mex: number, neutral_feedback_mex: number }[]> {
    const { data, error } = await this.supabase
      .rpc('get_number_of_feedback_messages');
      
    if (error) {
      console.error('Error fetching feedbacks:', error);
      return [];
    }
    return data;
  }

  async getCountFeedbacks(): Promise<{ week_number: number, negative_feedback: number, positive_feedback: number }[]> {
    const { data, error } = await this.supabase
      .rpc('get_number_of_feedbacks');
      
    if (error) {
      console.error('Error fetching feedbacks:', error);
      return [];
    }
    return data;
  }

  async getCountMessages(): Promise<{ numberofweek: number, numberofmessages: number }[]> {
    const { data, error } = await this.supabase
      .rpc('get_messages_per_week');
      
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    console.log('data', data);
    console.log('datatype', typeof(data));
    return data;
  }

  async getAnalyzeTextMessages(): Promise<{ averageWords: number, wordCounts:{ word: string, count: number }[] }> {
    const { data, error } = await this.supabase.functions.invoke('analyzeMessages', {
      body: { foo: 'bar' }
    })

    if (error) {
      console.error('Error fetching and analyzing messages:', error);
      throw new Error('Failed to fetching messages ');
    }
    console.log('Analyzed data: ', data);
    return data;
  }

  async getFeedbacks(): Promise<{ risposta: string, type: boolean, text: string }[]> {
    const { data, error } = await this.supabase.rpc('get_feedbacks');
    if (error) {
      console.error('Error fetching feedbacks:', error);
      return [];
    }
    console.log('feedbacks', data);
    return data.map((feedback: {risposta: string, feedback_check: string, feedback_text: string}) => ({
      risposta: feedback.risposta, type: feedback.feedback_check == "0", text: feedback.feedback_text
    }));
  }
}