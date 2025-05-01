import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  private isReadySubject = new BehaviorSubject<boolean>(false);
  public isReady$ = this.isReadySubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async initUser() {
    console.log('[UserService] Initializing user...');
    
    // 判断是否在浏览器环境中
    if (isPlatformBrowser(this.platformId)) {
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
    } else {
      // 如果是服务器端渲染，直接设置为默认状态
      this.isReadySubject.next(true);
    }
  }
  
  getCurrentUser() {
    return this.userSubject.getValue();
  }
}
