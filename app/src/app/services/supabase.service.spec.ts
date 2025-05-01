import { TestBed } from '@angular/core/testing';
import { SupabaseService } from './supabase.service';
import { CookieService } from 'ngx-cookie-service';
import { PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RealtimeChannel } from '@supabase/supabase-js';
import { isPlatformBrowser } from '@angular/common';
import { on } from 'events';

describe('SupabaseService', () => {
  let service: SupabaseService;
  let mockCookieService: any;
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockCookieService = {
      get: jasmine.createSpy('get').and.returnValue(''),
      set: jasmine.createSpy('set'),
    };



    mockSupabaseClient = {
      auth: {
        signInAnonymously: jasmine.createSpy('signInAnonymously').and.returnValue(Promise.resolve({ data: { user: { id: 'anon123' } } })),
        signInWithPassword: jasmine.createSpy('signInWithPassword').and.returnValue(
          Promise.resolve({
            data: {
              session: {
                access_token: 'session123',
                refresh_token: 'refresh123',
                expires_in: 3600,
                token_type: 'bearer',
                user: {
                  id: 'user123',
                  email: 'test@example.com',
                  app_metadata: {},
                  user_metadata: {},
                  aud: 'authenticated',
                  created_at: '2025-04-18T00:00:00.000Z',
                },
              },
            },
            error: null,
          })
        ),
        getUser: jasmine.createSpy('getUser').and.returnValue(Promise.resolve({ data: { user: { id: 'user123' } } })),
        getSession: jasmine.createSpy('getSession').and.returnValue(
          Promise.resolve({
            data: {
              session: {
                access_token: 'session123',
                refresh_token: 'refresh123',
                expires_in: 3600,
                token_type: 'bearer',
                user: {
                  id: 'user123',
                  email: 'test@example.com',
                  app_metadata: {},
                  user_metadata: {},
                  aud: 'authenticated',
                  created_at: '2025-04-18T00:00:00.000Z',
                },
              },
            },
            error: null,
          })
        ),
        setSession: jasmine.createSpy('setSession').and.returnValue(Promise.resolve({})),
        signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve({})),
      },
      from: jasmine.createSpy('from').and.returnValue({
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ data: [], error: null })),
        }),
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine.createSpy('single').and.returnValue(Promise.resolve({ data: { id: 'message123' }, error: null })),
          }),
        }),
        delete: jasmine.createSpy('delete').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null })),
        }),
        update: jasmine.createSpy('update').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null })),
        }),
      }),
      rpc: jasmine.createSpy('rpc').and.returnValue(Promise.resolve({ data: [], error: null })),
      functions: {
        invoke: jasmine.createSpy('invoke').and.returnValue(Promise.resolve({ data: {}, error: null })),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        SupabaseService,
        { provide: CookieService, useValue: mockCookieService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(SupabaseService);
    (service as any).supabase = mockSupabaseClient;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should sign in anonymously', async () => {
    const result = await service.signInAnonymously();
    expect(mockSupabaseClient.auth.signInAnonymously).toHaveBeenCalled();
    if (result.data.user) {
      expect(result.data.user.id).toBe('anon123');
    } else {
      fail('User should not be null');
    }
  });

  it('should sign in with password', async () => {
    const credentials = { email: 'test@example.com', password: 'password123' };
    const result = await service.signInWithPassword(credentials);

    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith(credentials);
    expect(mockCookieService.set).toHaveBeenCalledWith(
      'sb:token',
      JSON.stringify({
        session: {
          access_token: 'session123',
          refresh_token: 'refresh123',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'user123',
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2025-04-18T00:00:00.000Z',
          },
        },
      })
    );

    if (result.data.session) {
      expect(result.data.session).toEqual({
        access_token: 'session123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'user123',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2025-04-18T00:00:00.000Z',
        },
      });
    } else {
      fail('Session should not be null');
    }
  });

  it('should get user', async () => {
    const result = await service.getUser();
    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    if (result.data.user) {
      expect(result.data.user.id).toBe('user123');
    } else {
      fail('User should not be null');
    }
  });

  it('should get session', async () => {
    const result = await service.getSession();
    expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
    console.log('Session===============================:', result.data.session);

    if (result.data.session) {
      expect(result.data.session).toEqual({
        access_token: 'session123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'user123',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2025-04-18T00:00:00.000Z',
        },
      });
    } else {
      fail('Session should not be null');
    }
  });

  it('should set session', async () => {
    const session = { id: 'session123' } as any;
    await service.setSession(session);
    expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith(session);
  });

  it('should sign out', async () => {
    await service.signOut();
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
  });

  it('should get chats for user', async () => {
    const userId = 'user123';
    const result = await service.getChatsForUser(userId);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('get_all_conversations');
    expect(mockSupabaseClient.from().select).toHaveBeenCalledWith('*');
    expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith('utente', userId);
    expect(result).toEqual([]);
  });

  it('should delete chat', async () => {
    const chatId = 'chat123';
    await service.deleteChat(chatId);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('chat');
    expect(mockSupabaseClient.from().delete).toHaveBeenCalled();
    expect(mockSupabaseClient.from().delete().eq).toHaveBeenCalledWith('id', chatId);
  });

  it('should create a new chat', async () => {
    const userId = 'user123';
    const mockChatData = [{ id: 'chat123', utente: userId }];
    mockSupabaseClient.from().insert().select.and.returnValue(Promise.resolve({ data: mockChatData, error: null }));
    const initialChats = [{ id: 'chat456', utente: 'otherUser' }];
    (service as any).chatsSubject = new BehaviorSubject(initialChats);
    const result = await service.newChat(userId);

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('chat');
    expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith([{ utente: userId }]);
    expect(mockSupabaseClient.from().insert().select).toHaveBeenCalledWith('*');
    expect(result).toEqual(mockChatData);
    const updatedChats = (service as any).chatsSubject.getValue();
    expect(updatedChats).toEqual([...initialChats, ...mockChatData]);
  });

  it('should send a question', async () => {
    const chatId = 'chat123';
    const question = 'What is your name?';
    const result = await service.sendQuestion(chatId, question);

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('messaggio');
    expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith([{ chat: chatId, domanda: question }]);
    expect(mockSupabaseClient.from().insert().select).toHaveBeenCalled();
    expect(mockSupabaseClient.from().insert().select().single).toHaveBeenCalled();
    expect(result).toEqual({ id: 'message123' });
  });

  it('should submit feedback', async () => {
    const messageId = 'message123';
    const feedbackCheck = true;
    const feedbackText = 'Great!';
  
    mockSupabaseClient.from.and.returnValue({
      insert: jasmine.createSpy('insert').and.returnValue(Promise.resolve({ error: null })),
    });
  
    await service.submitFeedback(messageId, feedbackCheck, feedbackText);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('feedback');
    expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith([
      {
        messaggio: messageId,
        feedback: 1,
        feedback_text: feedbackText,
      },
    ]);
  });

  it('should get count of feedback messages', async () => {
    const mockFeedbackData = [
      { positive_feedback_mex: 10, negative_feedback_mex: 5, neutral_feedback_mex: 3 },
    ];
    mockSupabaseClient.rpc.and.returnValue(Promise.resolve({ data: mockFeedbackData, error: null }));

    const result = await service.getCountFeedbackMex();

    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_number_of_feedback_messages');
    expect(result).toEqual(mockFeedbackData);
  });

  it('should get count of feedbacks per week', async () => {
    const mockFeedbackData = [
      { week_number: 1, negative_feedback: 2, positive_feedback: 8 },
    ];
    mockSupabaseClient.rpc.and.returnValue(Promise.resolve({ data: mockFeedbackData, error: null }));

    const result = await service.getCountFeedbacks();

    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_number_of_feedbacks');
    expect(result).toEqual(mockFeedbackData);
  });

  it('should get count of messages per week', async () => {
    const mockMessageData = [
      { numberofweek: 1, numberofmessages: 50 },
    ];
    mockSupabaseClient.rpc.and.returnValue(Promise.resolve({ data: mockMessageData, error: null }));

    const result = await service.getCountMessages();

    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_messages_per_week');
    expect(result).toEqual(mockMessageData);
  });

  it('should analyze text messages', async () => {
    const mockAnalysisData = {
      averageWords: 5,
      wordCounts: [
        { word: 'hello', count: 10 },
        { word: 'world', count: 8 },
      ],
    };
    mockSupabaseClient.functions.invoke.and.returnValue(Promise.resolve({ data: mockAnalysisData, error: null }));

    const result = await service.getAnalyzeTextMessages();

    expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('analyzeMessages', { body: { foo: 'bar' } });
    expect(result).toEqual(mockAnalysisData);
  });

  it('should get feedbacks', async () => {
    const mockFeedbackData = [
      { risposta: 'Yes', feedback_check: '0', feedback_text: 'Good' },
      { risposta: 'No', feedback_check: '1', feedback_text: 'Bad' },
    ];
    mockSupabaseClient.rpc.and.returnValue(Promise.resolve({ data: mockFeedbackData, error: null }));

    const result = await service.getFeedbacks();

    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_feedbacks');
    expect(result).toEqual([
      { risposta: 'Yes', type: true, text: 'Good' },
      { risposta: 'No', type: false, text: 'Bad' },
    ]);
  });

  it('should listen to message changes', async () => {
    const messageId = 'message123';
    const mockCallback = jasmine.createSpy('callback');
    const mockSubscription = { unsubscribe: jasmine.createSpy('unsubscribe') } as unknown as RealtimeChannel;

    mockSupabaseClient.channel = jasmine.createSpy('channel').and.returnValue({
      on: jasmine.createSpy('on').and.returnValue({
        subscribe: jasmine.createSpy('subscribe').and.returnValue({
          unsubscribe: jasmine.createSpy('unsubscribe'),
        }),
      }),
    });
    mockSupabaseClient.channel.and.returnValue({
      on: jasmine.createSpy('on').and.returnValue({
        subscribe: jasmine.createSpy('subscribe').and.returnValue(mockSubscription),
      }),
    });

    const result = await service.listenMessageChanges(messageId, mockCallback);

    expect(mockSupabaseClient.channel).toHaveBeenCalledWith(`public:messaggio:id=eq.${messageId}`);
    expect(mockSupabaseClient.channel().on).toHaveBeenCalledWith(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'messaggio', filter: `id=eq.${messageId}` },
      mockCallback
    );
    expect(mockSupabaseClient.channel().on().subscribe).toHaveBeenCalled();
    expect(result).toBe(mockSubscription);
  });

  it('should handle Supabase errors correctly', () => {
    const alertSpy = spyOn(window, 'alert');
    const onlineSpy = spyOnProperty(navigator, 'onLine', 'get');
  
    const error401 = { status: 401, code: 'PGRST301', message: 'JWT expired' };
    (service as any).handleSupabaseError(error401);
    expect(alertSpy).toHaveBeenCalledWith('ERRORE 401 | Supabase non è al momento raggiungibile');
    alertSpy.calls.reset();
  
    const errorOffline = { status: 0, message: 'Network error' };
    onlineSpy.and.returnValue(false); 
    (service as any).handleSupabaseError(errorOffline);
    expect(alertSpy).toHaveBeenCalledWith('ERRORE | Connessione internet non disponibile');
    alertSpy.calls.reset();
  
    const unknownError = { status: 500, message: 'Internal server error' };
    onlineSpy.and.returnValue(true); 
    (service as any).handleSupabaseError(unknownError);
    expect(alertSpy).toHaveBeenCalledWith('ERRORE 500 | Supabase non è al momento raggiungibile');
  });

  it('should test Supabase connection successfully', async () => {
    mockSupabaseClient.from.and.returnValue({
      select: jasmine.createSpy('select').and.returnValue(Promise.resolve({ error: null })),
    });
  
    await (service as any).testSupabaseConnection();
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('chat');
    expect(mockSupabaseClient.from().select).toHaveBeenCalledWith('*');
  });
  
  it('should handle error during Supabase connection test', async () => {
    spyOn(window, 'alert');
    mockSupabaseClient.from.and.returnValue({
      select: jasmine.createSpy('select').and.returnValue(Promise.resolve({ error: { message: 'Connection failed' } })),
    });
  
    await (service as any).testSupabaseConnection();
    expect(window.alert).toHaveBeenCalledWith('ERRORE | Connessione a Supabase non riuscita. Riprova più tardi.');
  });

  it('should save anonymous session', async () => {
    const mockSession = {
      data: {
        session: {
          access_token: 'session123',
          refresh_token: 'refresh123',
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'user123',
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2025-04-18T00:00:00.000Z',
          },
        },
      },
      error: null,
    };
    spyOn(service, 'getSession').and.returnValue(Promise.resolve(mockSession));

    await service.saveAnonSession();

    expect(mockCookieService.set).toHaveBeenCalledWith(
      'anonymous-session',
      JSON.stringify(mockSession.data.session),
      { path: '/', secure: false, sameSite: 'Lax' }
    );
  });
  
  it('should check anonymous session and return true if session exists', async () => {
    mockCookieService.get.and.returnValue(JSON.stringify({ id: 'anon-session' }));
  
    const result = await service.checkAnonSession();
    expect(result).toBeTrue();
    expect(mockCookieService.get).toHaveBeenCalledWith('anonymous-session');
  });
  
  it('should check anonymous session and return false if session does not exist', async () => {
    mockCookieService.get.and.returnValue('');
  
    const result = await service.checkAnonSession();
    expect(result).toBeFalse();
    expect(mockCookieService.get).toHaveBeenCalledWith('anonymous-session');
  });

  it('should unsubscribe from message changes', async () => {
    const messageId = 'message123';
    const mockCallback = jasmine.createSpy('callback');
    const mockSubscription = { unsubscribe: jasmine.createSpy('unsubscribe') } as unknown as RealtimeChannel;
  
    mockSupabaseClient.channel = jasmine.createSpy('channel').and.returnValue({
      on: jasmine.createSpy('on').and.returnValue({
        subscribe: jasmine.createSpy('subscribe').and.returnValue(mockSubscription),
      }),
    });
  
    const subscription = await service.listenMessageChanges(messageId, mockCallback);
    subscription.unsubscribe();
  
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should return empty array if userId is empty in getChatsForUser', async () => {
    const result = await service.getChatsForUser('');
    expect(result).toEqual([]);
  });

  it('should handle error in submitFeedback', async () => {
    mockSupabaseClient.from.and.returnValue({
      insert: jasmine.createSpy('insert').and.returnValue(Promise.resolve({ error: { message: 'Insert failed' } })),
    });
  
    spyOn(console, 'error');
    await service.submitFeedback('message123', true, 'Great!');
    expect(console.error).toHaveBeenCalledWith('Error submitting feedback:', { message: 'Insert failed' });
  });


  it('should handle error when saving anonymous session', async () => {
    spyOn(service, 'getSession').and.throwError('Failed to get session');
    spyOn(console, 'error');
  
    await service.saveAnonSession();
    expect(console.error).toHaveBeenCalledWith('Error getting anonymous session', jasmine.any(Error));
  });

  it('should handle invalid JSON in anonymous session cookie', async () => {
    mockCookieService.get.and.returnValue('invalid-json');
    spyOn(console, 'error');
  
    const result = await service.checkAnonSession();
    expect(result).toBeFalse();
    expect(console.error).toHaveBeenCalledWith('Invalid anonymous session in cookie:', jasmine.any(SyntaxError));
  });

  it('should handle error when fetching chats for user', async () => {
    mockSupabaseClient.from.and.returnValue({
      select: jasmine.createSpy('select').and.returnValue({
        eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ data: null, error: { message: 'Fetch failed' } })),
      }),
    });
    spyOn(console, 'error');
  
    const result = await service.getChatsForUser('user123');
    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Error fetching chats:', { message: 'Fetch failed' });
  });

  it('should handle error when deleting chat', async () => {
    mockSupabaseClient.from.and.returnValue({
      delete: jasmine.createSpy('delete').and.returnValue({
        eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: { message: 'Delete failed' } })),
      }),
    });
    spyOn(console, 'error');
  
    await service.deleteChat('chat123');
    expect(console.error).toHaveBeenCalledWith('Error deleting chat:', { message: 'Delete failed' });
  });

  it('should handle error when creating new chat', async () => {
    mockSupabaseClient.from.and.returnValue({
      insert: jasmine.createSpy('insert').and.returnValue({
        select: jasmine.createSpy('select').and.returnValue(Promise.resolve({ data: null, error: { message: 'Insert failed' } })),
      }),
    });
    spyOn(console, 'error');
  
    const result = await service.newChat('user123');
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Error creating chat:', { message: 'Insert failed' });
  });

  it('should handle error when sending question', async () => {
    mockSupabaseClient.from.and.returnValue({
      insert: jasmine.createSpy('insert').and.returnValue({
        select: jasmine.createSpy('select').and.returnValue({
          single: jasmine.createSpy('single').and.returnValue(Promise.resolve({ data: null, error: { message: 'Insert failed' } })),
        }),
      }),
    });
    spyOn(console, 'error');
  
    const result = await service.sendQuestion('chat123', 'What is your name?');
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Error sending question:', { message: 'Insert failed' });
  });

  it('should handle error when getting feedbacks', async () => {
    mockSupabaseClient.rpc.and.returnValue(Promise.resolve({ data: null, error: { message: 'Fetch failed' } }));
    spyOn(console, 'error');
  
    const result = await service.getFeedbacks();
    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Error fetching feedbacks:', { message: 'Fetch failed' });
  }
  );

});