import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, timer, of, forkJoin } from 'rxjs';
import { map, switchMap, take, finalize, delay } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from '../services/user.service';
import { LoadingService } from '../services/loading.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private readonly MIN_LOADING_DURATION:number = 1000; 
  private readonly isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private loadingService: LoadingService,
    private userService: UserService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  canActivate(): Observable<boolean> {
    if (this.isBrowser) {
      this.loadingService.show();
    }

    return forkJoin([
      this.checkAuthStatus(),
      this.forceLoadingDuration()
    ]).pipe(
      map(([isAuthenticated]) => isAuthenticated),
      switchMap(isAuthenticated => {
        if (!isAuthenticated && this.isBrowser) {
          this.router.navigate(['/login']);
        }
        return of(isAuthenticated);
      }),
      finalize(() => {
        if (this.isBrowser) {
          this.loadingService.hide();
        }
      })
    );
  }

  checkAuthStatus(): Observable<boolean> {
    return this.userService.user$.pipe(
      take(1),
      map(user => !!user && !user.is_anonymous),
      delay(0)
    );
  }

  forceLoadingDuration(): Observable<true> {
    return this.isBrowser 
      ? timer(this.MIN_LOADING_DURATION).pipe(map(() => <true>true), take(1))
      : of(true); 
  }
}