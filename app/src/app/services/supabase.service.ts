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
  private currentLocation: string = '';

  constructor(private ngZone: NgZone,private cookieService: CookieService, @Inject(PLATFORM_ID) private platformId: Object) {
    let supabaseUrl = ``;
    if (isPlatformBrowser(this.platformId)) {
      console.log('🚀 运行在 CSR（浏览器端）');
      
      //YIXIN
      supabaseUrl = `${window.location.protocol}//${window.location.hostname}:${environment.supabasePort}`;

      //ARMANDO
      // supabaseUrl = 'https://vqgvzelfzrmefuypovhq.supabase.co',
      // console.log('🚀 Kong 运行在', supabaseUrl)
    } else {
      console.log('🖥️ 运行在 SSR（服务器端）');
      
      //YIXIN
      supabaseUrl = `http://localhost:${environment.supabasePort}`;
      //ARMANDO
      // supabaseUrl = 'https://vqgvzelfzrmefuypovhq.supabase.co',
      console.log('🖥️ Kong 运行在 ', supabaseUrl);
    }

    // NgZone 是 Angular 的一个服务，用于管理 Angular 应用的变化检测机制
    // 通过 runOutsideAngular 方法，可以在 Angular 应用之外执行代码，避免触发 Angular 的变化检测机制  
    // 由于 Supabase SDK 会自动触发 Angular 的变化检测机制，因此需要在初始化 SupabaseClient 时，使用 runOutsideAngular 方法
    // 以避免在初始化过程中触发 Angular 的变化检测机制

    
    this.ngZone.runOutsideAngular(() => {
      this.supabase = createClient(supabaseUrl, environment.supabaseKey, {
        auth: {
          autoRefreshToken: false
        }
      });
    });
    // 如果不使用 runOutsideAngular 方法，angular 一直会检测到变化，导致页面一直在刷新
    // 因为 Supabase SDK 会自动触发 Angular 的变化检测机制
    // 细节：https://angular.cn/guide/zone
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
      // 🚀 存储 session 到 Cookie，服务器端也能访问
      this.cookieService.set('sb:token', JSON.stringify(data));
    }
    return { data, error };
  }

  async saveAnonSession() {
    try {
      // 获取匿名用户的 session
      const anonymousSession = (await this.getSession()).data.session;
      console.log('Anonymous session', anonymousSession);
      if (anonymousSession) {
        // 保存匿名用户的 session 到 cookie
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
    const { data, error } = await this.supabase
      .from('get_all_conversations')
      .select('*')
      .eq('utente', userId); // 只查询指定用户的聊天记录

    if (error) {
      console.error('Error fetching chats:', error);
      this.chatsSubject.next([]);
      return [];
    }
    this.chatsSubject.next(data);
    return data;
  }

  async deleteChat(chatId: string) {
    const { error } = await this.supabase
      .from('chat')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
      return;
    }
    // Update the chats after deletion
    const currentChats = this.chatsSubject.getValue();
    this.chatsSubject.next(currentChats.filter(chat => chat.id !== chatId));
  }



  async newChat(userId: string) {
    const { data, error } = await this.supabase
      .from('chat')
      .insert([{ utente: userId }])
      .select('*');

    if (error) {
      console.error('Error creating chat:', error);
      return null;
    }
    if (data) {
      // Update the chats after adding a new chat
      const currentChats = this.chatsSubject.getValue();
      this.chatsSubject.next([...currentChats, ...data]);
    }
    return data;
  }

  async sendQuestion(chatId: string, question: string) {
    const { data, error } = await this.supabase
      .from('messaggio')
      .insert([{ chat: chatId, domanda: question }])
      .select()
      .single();

    if (error) {
      console.error('Error sending question:', error);
      return null;
    }
    return data;
  }

  async submitFeedback(messageId: string, feedbackCheck: boolean, feedbackText: string): Promise<void> {
    const feedbackBit = feedbackCheck ? 1 : 0;
    const { error } = await this.supabase
      .from('messaggio')
      .update({ feedback_check: feedbackBit, feedback_text: feedbackText })
      .eq('id', messageId);

    if (error) {
      console.error('Error updating feedback:', error);
      throw new Error('Failed to update feedback');
    }

    console.log('Feedback updated successfully');
  }

  // supabase liten message row changes
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

  // Prende il numero di -- MESSAGGI -- relativi ai feedback positivi, negativi e neutri
  async getCountFeedbackMex(): Promise<{ positive_feedback_mex: number, negative_feedback_mex: number, neutral_feedback_mex: number }[]> {
    const { data, error } = await this.supabase
      .rpc('get_number_of_feedback_messages');
      
    if (error) {
      console.error('Error fetching feedbacks:', error);
      return [];
    }
    return data;
  }

  // Prende il numero di feedback positivi, negativi e il numero della settimana
  async getCountFeedbacks(): Promise<{ week_number: number, negative_feedback: number, positive_feedback: number }[]> {
    const { data, error } = await this.supabase
      .rpc('get_number_of_feedbacks');
      
    if (error) {
      console.error('Error fetching feedbacks:', error);
      return [];
    }
    return data;
  }

  // Prende il numero di messaggi ordinati in maniera crescente (prima il più vecchio)
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

  // Prende il testo dei messaggi inviati per analizzare numero di parole usate e termini più usati
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
}
