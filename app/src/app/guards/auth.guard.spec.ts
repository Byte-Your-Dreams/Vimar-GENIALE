import { AuthGuard } from './auth.guard';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoadingService } from '../services/loading.service';
import { UserService } from '../services/user.service';
import { of } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fakeAsync, tick } from '@angular/core/testing';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: LoadingService,
          useValue: jasmine.createSpyObj('LoadingService', ['show', 'hide'])
        },
        {
          provide: UserService,
          useValue: jasmine.createSpyObj('UserService', ['user$'])
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate'])
        }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
  
  it('should allow access for authenticated user', fakeAsync(() => {
    userService.user$ = of({ id: '123', is_anonymous: false });

    let result: boolean | undefined;
    guard.canActivate().subscribe(res => (result = res));

    tick(1000);

    expect(result).toBeTrue();
    expect(loadingService.show).toHaveBeenCalled();
    expect(loadingService.hide).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should block access and redirect for anonymous user', fakeAsync(() => {
    userService.user$ = of({ id: 'anon', is_anonymous: true });

    let result: boolean | undefined;
    guard.canActivate().subscribe(res => (result = res));

    tick(1000);

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(loadingService.show).toHaveBeenCalled();
    expect(loadingService.hide).toHaveBeenCalled();
  }));

  it('should block access and redirect for null user', fakeAsync(() => {
    userService.user$ = of(null);

    let result: boolean | undefined;
    guard.canActivate().subscribe(res => (result = res));

    tick(1000);

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(loadingService.show).toHaveBeenCalled();
    expect(loadingService.hide).toHaveBeenCalled();
  }));
});
