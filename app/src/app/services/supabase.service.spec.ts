// import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
// import { SupabaseService } from './supabase.service';
// import { CookieService } from 'ngx-cookie-service';
// import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import { AuthChangeEvent, Session } from '@supabase/supabase-js';
// import { BehaviorSubject, of } from 'rxjs';
// import { NgZone, PLATFORM_ID } from '@angular/core';

// // 创建 SupabaseClient 的模拟实现
// const mockSupabaseClient = jasmine.createSpyObj('SupabaseClient', {
//   auth: {
//     signInAnonymously: Promise.resolve({ data: { user: { id: 'anon-123' } }, error: null }),
//     signInWithPassword: Promise.resolve({ data: { session: {} }, error: null }),
//     getUser: Promise.resolve({ data: { user: { id: 'user-123' } } }),
//     getSession: Promise.resolve({ data: { session: { access_token: 'test-token' } } }),
//     setSession: Promise.resolve({ data: null, error: null }),
//     signOut: Promise.resolve({ error: null }),
//     onAuthStateChange: (callback: any) => ({
//       data: { subscription: {} },
//       unsubscribe: () => {}
//     })
//   },
//   from: jasmine.createSpy().and.returnValue({
//     select: jasmine.createSpy().and.returnValue({
//       eq: jasmine.createSpy().and.returnValue(Promise.resolve({ data: [], error: null }))
//     }),
//     insert: jasmine.createSpy().and.returnValue({
//       select: jasmine.createSpy().and.returnValue(Promise.resolve({ data: [{}], error: null }))
//     }),
//     delete: jasmine.createSpy().and.returnValue({
//       eq: jasmine.createSpy().and.returnValue(Promise.resolve({ error: null }))
//     }),
//     update: jasmine.createSpy().and.returnValue({
//       eq: jasmine.createSpy().and.returnValue(Promise.resolve({ error: null }))
//     })
//   }),
//   channel: jasmine.createSpy().and.returnValue({
//     on: jasmine.createSpy().and.returnValue({
//       subscribe: jasmine.createSpy()
//     })
//   }),
//   rpc: jasmine.createSpy().and.returnValue(Promise.resolve({ data: [], error: null })),
//   functions: {
//     invoke: jasmine.createSpy().and.returnValue(Promise.resolve({ data: {}, error: null }))
//   }
// });

// describe('SupabaseService', () => {
//   let service: SupabaseService;
//   let cookieService: jasmine.SpyObj<CookieService>;
//   let ngZone: NgZone;

//   beforeEach(() => {
//     // 创建模拟依赖项
//     cookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete']);
//     ngZone = { runOutsideAngular: (fn: Function) => fn() } as any;

//     TestBed.configureTestingModule({
//       providers: [
//         SupabaseService,
//         { provide: CookieService, useValue: cookieService },
//         { provide: NgZone, useValue: ngZone },
//         { provide: PLATFORM_ID, useValue: 'browser' }
//       ]
//     });

//     // 替换实际的 Supabase 客户端
//     spyOn(createClient, 'createClient').and.returnValue(mockSupabaseClient);
//     service = TestBed.inject(SupabaseService);
//   });

//   afterEach(() => {
//     mockSupabaseClient.auth.signInAnonymously.calls.reset();
//     cookieService.set.calls.reset();
//   });

//   it('应该正确创建服务', () => {
//     expect(service).toBeTruthy();
//   });

//   describe('认证相关方法', () => {
//     it('应该处理匿名登录', fakeAsync(() => {
//       service.signInAnonymously().then(result => {
//         expect(result.data.user!.id).toBe('anon-123');
//         expect(cookieService.set).toHaveBeenCalled();
//       });
//       tick();
//     }));

//     it('应该处理密码登录', fakeAsync(() => {
//       service.signInWithPassword({ email: 'test@test.com', password: 'password' })
//         .then(result => {
//           expect(result.data.session).toBeDefined();
//           expect(cookieService.set).toHaveBeenCalledWith('sb:token', jasmine.any(String));
//         });
//       tick();
//     }));

//     it('应该处理登出', fakeAsync(() => {
//       service.signOut().then(() => {
//         expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
//       });
//       tick();
//     }));
//   });

//   describe('会话管理', () => {
//     it('应该保存匿名会话', fakeAsync(() => {
//       service.saveAnonSession();
//       tick();
//       expect(cookieService.set).toHaveBeenCalledWith(
//         'anonymous-session', 
//         jasmine.any(String), 
//         jasmine.any(Object)
//       );
//     }));

//     it('应该检查存在的会话', fakeAsync(() => {
//       cookieService.get.and.returnValue(JSON.stringify({}));
//       service.checkAnonSession().then(result => {
//         expect(result).toBeTrue();
//       });
//       tick();
//     }));
//     it('应该删除聊天', fakeAsync(() => {
//         service['chatsSubject'].next([{ id: 'chat-1' }]); // 正确访问私有属性
//         service.deleteChat('chat-1').then(() => {
//           expect(service['chatsSubject'].getValue().length).toBe(0); // 正确访问私有属性
//         });
//         tick();
//       }));
//   });

//   describe('聊天操作', () => {
//     it('应该处理匿名登录', fakeAsync(() => {
//         service.signInAnonymously().then(result => {
//           expect(result.data.user!.id).toBe('anon-123'); // 添加非空断言
//           expect(cookieService.set).toHaveBeenCalled();
//         });
//         tick();
//       }));
    
//       it('应该获取用户聊天列表', fakeAsync(() => {
//         service.getChatsForUser('user-123').then(data => {
//           expect(data.length).toBe(0);
//           expect(service['chatsSubject'].getValue()).toEqual([]); // 正确访问私有属性
//         });
//         tick();
//       }));
    
//       it('应该创建新聊天', fakeAsync(() => {
//         service.newChat('user-123').then(data => {
//           expect(data).toBeDefined();
//           expect(service['chatsSubject'].getValue().length).toBe(1); // 正确访问私有属性
//         });
//         tick();
//       }));
//   });

//   describe('消息处理', () => {
//     it('应该发送问题', fakeAsync(() => {
//       service.sendQuestion('chat-1', 'Test question').then(data => {
//         expect(data).toBeDefined();
//       });
//       tick();
//     }));

//     it('应该监听消息变更', fakeAsync(() => {
//       const callback = jasmine.createSpy('callback');
//       const subscription = service.listenMessageChanges('msg-1', callback);
//       expect(subscription).toBeDefined();
//     }));
//   });

//   describe('反馈处理', () => {
//     it('应该提交反馈', fakeAsync(() => {
//       service.submitFeedback('msg-1', true, 'Good response').then(() => {
//         expect(mockSupabaseClient.from).toHaveBeenCalledWith('messaggio');
//       });
//       tick();
//     }));
//   });

//   describe('分析功能', () => {
//     it('应该获取消息分析数据', fakeAsync(() => {
//       service.getAnalyzeTextMessages().then(data => {
//         expect(data.averageWords).toBeDefined();
//       });
//       tick();
//     }));

//     it('应该获取反馈统计', fakeAsync(() => {
//       service.getCountFeedbackMex().then(data => {
//         expect(data.length).toBe(0);
//       });
//       tick();
//     }));
//   });

//   describe('错误处理', () => {
//     it('应该处理获取用户错误', fakeAsync(() => {
//       mockSupabaseClient.auth.getUser.and.rejectWith(new Error('Connection error'));
//       spyOn(console, 'error');
      
//       service.getUser().catch(() => {
//         expect(console.error).toHaveBeenCalled();
//       });
//       tick();
//     }));
//   });
// });