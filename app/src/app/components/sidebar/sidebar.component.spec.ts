import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { Router, NavigationEnd } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ConversationService } from '../../services/conversation.service';
import { UserService } from '../../services/user.service';
import { of, Subject } from 'rxjs';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockRouter: any;
  let mockSupabaseService: any;
  let mockConversationService: any;
  let mockUserService: any;

  beforeEach(async () => {
    mockRouter = {
      events: new Subject(),
      navigate: jasmine.createSpy('navigate'),
    };

    mockSupabaseService = {
      chats$: new Subject(),
      getChatsForUser: jasmine.createSpy('getChatsForUser'),
      deleteChat: jasmine.createSpy('deleteChat').and.returnValue(Promise.resolve()),
      newChat: jasmine.createSpy('newChat').and.returnValue(Promise.resolve([{ id: 1 }])),
    };

    mockConversationService = {
      setCurrentConversation: jasmine.createSpy('setCurrentConversation'),
    };

    mockUserService = {
      user$: new Subject(),
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: ConversationService, useValue: mockConversationService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update link label on navigation', () => {
    mockRouter.events.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
    expect(component.linkDashHome).toBe('Home');

    mockRouter.events.next(new NavigationEnd(1, '/', '/'));
    expect(component.linkDashHome).toBe('Dashboard');
  });

  it('should handle user subscription and fetch chats', () => {
    const mockUser = { id: 'user123', is_anonymous: false };
    mockUserService.user$.next(mockUser);
  
    expect((component as any).userId).toBe('user123');
    expect(mockSupabaseService.getChatsForUser).toHaveBeenCalledWith('user123');
  });

  it('should select a chat', () => {
    component.chats = [{ id: 1, messages: [] }];
    component.selectChat(1);

    expect(component.selectedChatId).toBe(1);
    expect(mockConversationService.setCurrentConversation).toHaveBeenCalledWith(component.chats[0]);
  });

  it('should delete a chat and refresh chats', async () => {
    (component as any).userId = 'user123';
    component.chats = [{ id: 1, messages: [] }];
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
  
    await component.deleteChat(1, event);
  
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(mockSupabaseService.deleteChat).toHaveBeenCalledWith('1');
    expect(mockSupabaseService.getChatsForUser).toHaveBeenCalledWith('user123');
  });

  it('should create a new chat', async () => {
    (component as any).userId = 'user123';
    component.chats = [];
    await component.newChat();

    expect(mockSupabaseService.newChat).toHaveBeenCalledWith('user123');
    expect(mockSupabaseService.getChatsForUser).toHaveBeenCalledWith('user123');
    expect(component.selectedChatId).toBe(1);
  });

  it('should toggle chat visibility', () => {
    const menu = document.createElement('div');
    menu.id = 'sidebar';
    menu.classList.add('hidden');
    document.body.appendChild(menu);
  
    const burger = document.createElement('div');
    burger.classList.add('button-burger');
    document.body.appendChild(burger);
  
    component.toggleChat();
  
    expect(burger.classList.contains('close')).toBeTrue();
  
    component.toggleChat();

    expect(burger.classList.contains('close')).toBeFalse();
  
    document.body.removeChild(menu);
    document.body.removeChild(burger);
  });

  it('should navigate to dashboard or home', () => {
    (component as any).currentUrl = '/';
    component.navigateToDashOrHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  
    (component as any).currentUrl = '/dashboard';
    component.navigateToDashOrHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});