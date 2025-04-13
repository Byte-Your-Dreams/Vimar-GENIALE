import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  private isReadySubject = new BehaviorSubject<boolean>(false);
  public isReady$ = this.isReadySubject.asObservable();

  constructor(private supabaseService: SupabaseService) {}

  async initUser() {
    console.log('[UserService] Initializing user...');
    try {
      const userResponse = await this.supabaseService.getUser();
      const user = userResponse.data.user;


      if (user) {
        this.userSubject.next(user);
      } else {
        const anonResponse = await this.supabaseService.signInAnonymously();
        const anonUser = anonResponse.data.user;
        this.userSubject.next(anonUser);
      }
    } catch (err) {
      console.error('[UserService] Error initializing user', err);
    } finally {
      this.isReadySubject.next(true);
      console.log('[UserService] User initialization complete');
    }
  }
  
  getCurrentUser() {
    return this.userSubject.getValue();
  }
}
