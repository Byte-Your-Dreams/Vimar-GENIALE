import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { UserService } from '../../services/user.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthError } from '@supabase/supabase-js';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser,DOCUMENT } from '@angular/common';


describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockUserService: jasmine.SpyObj<UserService>;

  
  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
    mockSupabaseService = jasmine.createSpyObj('SupabaseService', ['checkAnonSession', 'saveAnonSession', 'signInWithPassword']);
    // mockUserService = jasmine.createSpyObj('UserService', [], { user$: of(null) });
    mockUserService = jasmine.createSpyObj('UserService', [], {
      user$: of({ is_anonymous: false })
    });

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent, FormsModule, CommonModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: UserService, useValue: mockUserService }
      ]
    }).compileComponents();

    await TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: DOCUMENT, useValue: document }
      ]
    }).compileComponents();


    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      mockUserService = jasmine.createSpyObj('UserService', [], {
        user$: of({ is_anonymous: false })
      });
    });
    it('should redirect to home if user is logged in', fakeAsync(() => {
      mockUserService.user$ = of({ is_anonymous: false });
      component.ngOnInit();
      tick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should save anonymous session if no session exists', fakeAsync(() => {
      mockSupabaseService.checkAnonSession.and.returnValue(Promise.resolve(false));
      component.ngOnInit();
      tick();
      expect(mockSupabaseService.saveAnonSession).toHaveBeenCalled();
    }));
  });

  describe('handleLogin', () => {

    it('should log in successfully and navigate to home', fakeAsync(async () => {
      component.email = 'test@example.com';
      component.password = 'password123';
      const event = new Event('submit');
      const mockAuthError = {
        message: 'Invalid credentials',
        status: 401
      } as AuthError;

      mockSupabaseService.signInWithPassword.and.returnValue(Promise.resolve({
        data: { user: null, session: null, weakPassword: null },
        error: mockAuthError
      }));

      await component.handleLogin(event);
      tick();

      expect(mockSupabaseService.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should show error message on login failure', fakeAsync(async () => {
      const mockAuthError = {
        message: 'Invalid credentials',
        status: 401
      } as AuthError;
      mockSupabaseService.signInWithPassword.and.returnValue(Promise.resolve({
        data: { user: null, session: null, weakPassword: null },
        error: mockAuthError
      }));
      component.email = 'test@example.com';
      component.password = 'wrongpassword';
      const event = new Event('submit');

      await component.handleLogin(event);
      tick();

      expect(component.error).toBe('Invalid email or password. Please try again.');
    }));
  });

  describe('navigateToHome', () => {
    it('should navigate to home', () => {
      component.navigateToHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
