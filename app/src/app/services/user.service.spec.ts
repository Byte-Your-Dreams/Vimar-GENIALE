// import { TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { UserService } from './user.service';
// import { SupabaseService } from './supabase.service';
// import { BehaviorSubject, of } from 'rxjs';

// describe('UserService', () => {
//   let service: UserService;
//   let supabaseServiceMock: any;
//   let mockUser = { id: '123', is_anonymous: false };
//   let mockAnonUser = { id: 'anon-123', is_anonymous: true };

//   beforeEach(() => {
//     // Create a mock for SupabaseService
//     supabaseServiceMock = jasmine.createSpyObj('SupabaseService', [
//       'getUser',
//       'signInAnonymously'
//     ]);

//     TestBed.configureTestingModule({
//       providers: [
//         UserService,
//         { provide: SupabaseService, useValue: supabaseServiceMock }
//       ]
//     });

//     service = TestBed.inject(UserService);
//   });

//   it('should create the service correctly', () => {
//     expect(service).toBeTruthy();
//   });

//   describe('initUser()', () => {
//     it('should initialize user when a logged-in user exists', fakeAsync(async () => {
//       // Mock an existing user
//       supabaseServiceMock.getUser.and.resolveTo({ data: { user: mockUser } });
      
//       await service.initUser();
//       tick();
      
//       expect(service.getCurrentUser()).toEqual(mockUser);
//       expect(supabaseServiceMock.signInAnonymously).not.toHaveBeenCalled();
//       expect(service.isReady$.subscribe(isReady => expect(isReady).toBeTrue()));
//     }));

//     it('should create an anonymous user when no user exists', fakeAsync(async () => {
//       // Mock no user
//       supabaseServiceMock.getUser.and.resolveTo({ data: { user: null } });
//       supabaseServiceMock.signInAnonymously.and.resolveTo({ data: { user: mockAnonUser } });
      
//       await service.initUser();
//       tick();
      
//       expect(service.getCurrentUser()).toEqual(mockAnonUser);
//       expect(supabaseServiceMock.signInAnonymously).toHaveBeenCalled();
//     }));

//     it('should handle initialization errors', fakeAsync(async () => {
//       // Mock an error
//       supabaseServiceMock.getUser.and.rejectWith(new Error('Connection failed'));
//       spyOn(console, 'error');
      
//       await service.initUser();
//       tick();
      
//       expect(console.error).toHaveBeenCalled();
//       expect(service.isReady$.subscribe(isReady => expect(isReady).toBeTrue()));
//     }));
//   });

//   describe('getCurrentUser()', () => {
//     it('should return the current user', () => {
//       service['userSubject'].next(mockUser);
//       expect(service.getCurrentUser()).toEqual(mockUser);
//     });
//   });

//   describe('isLoggedIn()', () => {
//     it('should return true when a user exists and is not anonymous', (done) => {
//       service['userSubject'].next(mockUser);
//       service.isLoggedIn().subscribe(result => {
//         expect(result).toBeTrue();
//         done();
//       });
//     });

//     it('should return false when the user is anonymous', (done) => {
//       service['userSubject'].next(mockAnonUser);
//       service.isLoggedIn().subscribe(result => {
//         expect(result).toBeFalse();
//         done();
//       });
//     });

//     it('should return false when there is no user', (done) => {
//       service['userSubject'].next(null);
//       service.isLoggedIn().subscribe(result => {
//         expect(result).toBeFalse();
//         done();
//       });
//     });
//   });
// });
