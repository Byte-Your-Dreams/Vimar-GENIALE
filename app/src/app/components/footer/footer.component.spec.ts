import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { Router, NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../services/user.service';
import { PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let mockRouter: any;
  let mockSupabaseService: any;
  let mockCookieService: any;
  let mockUserService: any;
  let mockPlatformId: any;
  let routerEvents$: Subject<any>;

  beforeEach(async () => {
    routerEvents$ = new Subject();

    mockRouter = {
      events: routerEvents$.asObservable(),
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    };

    mockSupabaseService = {
      signOut: jasmine.createSpy('signOut'),
      setSession: jasmine.createSpy('setSession').and.returnValue(Promise.resolve({ data: null, error: null })),
    };

    mockCookieService = {
      get: jasmine.createSpy('get').and.returnValue('{}'),
      delete: jasmine.createSpy('delete'),
    };

    mockUserService = {
      user$: of({ id: '123', is_anonymous: false }),
    };

    mockPlatformId = 'browser';

    await TestBed.configureTestingModule({
      imports: [CommonModule,FooterComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: UserService, useValue: mockUserService },
        { provide: PLATFORM_ID, useValue: mockPlatformId },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should update loginStatus when user is logged in', () => {
    expect(component.loginStatus).toBeTrue();
  });

  it('should update linkLabel based on currentUrl', () => {
    routerEvents$.next(new NavigationEnd(1, '/login', '/login'));
    expect(component.linkLabel).toBe('Back');

    routerEvents$.next(new NavigationEnd(1, '/', '/'));
    expect(component.linkLabel).toBe('Login');
  });

  it('should navigate to login when currentUrl is "/"', () => {
    routerEvents$.next(new NavigationEnd(1, '/', '/'));
    component.navigateToLoginOrHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
  
  it('should navigate to home when currentUrl is "/login"', () => {
    routerEvents$.next(new NavigationEnd(1, '/login', '/login'));
    component.navigateToLoginOrHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should toggle logout window visibility', () => {
    const mockElement = { classList: { toggle: jasmine.createSpy('toggle') } };
    spyOn(document, 'querySelector').and.returnValue(mockElement as any);

    component.showLogout();
    expect(mockElement.classList.toggle).toHaveBeenCalledWith('showLogout');
  });

  it('should log out the user and delete cookies', async () => {
    spyOn(component, 'reloadPage');
    await component.onLogout();
    expect(mockSupabaseService.signOut).toHaveBeenCalled();
    expect(mockCookieService.delete).toHaveBeenCalledWith('sb:token');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    expect(component.reloadPage).toHaveBeenCalled();
  });
});