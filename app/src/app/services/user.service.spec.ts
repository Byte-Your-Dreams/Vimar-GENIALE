import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { SupabaseService } from './supabase.service';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';

describe('UserService', () => {
    let service: UserService;
    let mockSupabaseService: any;
    describe('in browser environment', () => {
    beforeEach(() => {
        mockSupabaseService = {
            getUser: jasmine.createSpy('getUser').and.returnValue(Promise.resolve({ data: { user: { id: 'user123' } } })),
            signInAnonymously: jasmine.createSpy('signInAnonymously').and.returnValue(Promise.resolve({ data: { user: { id: 'anon123' } } })),
        };

        TestBed.configureTestingModule({
            providers: [
                UserService,
                { provide: SupabaseService, useValue: mockSupabaseService },
                { provide: PLATFORM_ID, useValue: 'browser' }, // 默认模拟为浏览器环境
            ],
        });

        service = TestBed.inject(UserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize user if user exists', async () => {
        await service.initUser();

        expect(mockSupabaseService.getUser).toHaveBeenCalled();
        expect(service.getCurrentUser()).toEqual({ id: 'user123' });
    });

    it('should initialize anonymous user if no user exists', async () => {
        mockSupabaseService.getUser.and.returnValue(Promise.resolve({ data: { user: null } }));

        await service.initUser();

        expect(mockSupabaseService.getUser).toHaveBeenCalled();
        expect(mockSupabaseService.signInAnonymously).toHaveBeenCalled();
        expect(service.getCurrentUser()).toEqual({ id: 'anon123' });
    });

    it('should handle errors during user initialization', async () => {
        mockSupabaseService.getUser.and.throwError('Error fetching user');

        await service.initUser();

        expect(mockSupabaseService.getUser).toHaveBeenCalled();
        expect(service.getCurrentUser()).toBeNull();
    });

    it('should set isReady$ to true after initialization', async () => {
        await service.initUser();

        service.isReady$.subscribe((isReady) => {
            expect(isReady).toBeTrue();
        });
    });
});

describe('in non-browser environment', () => {
    beforeEach(() => {
        mockSupabaseService = {
            getUser: jasmine.createSpy('getUser').and.returnValue(Promise.resolve({ data: { user: { id: 'user123' } } })),
            signInAnonymously: jasmine.createSpy('signInAnonymously').and.returnValue(Promise.resolve({ data: { user: { id: 'anon123' } } })),
        };

        TestBed.configureTestingModule({
            providers: [
                UserService,
                { provide: SupabaseService, useValue: mockSupabaseService },
                { provide: PLATFORM_ID, useValue: 'server' }, // 模拟服务器环境
            ],
        });

        service = TestBed.inject(UserService);
    });

    it('should set isReady$ to true immediately in non-browser environments', async () => {
        await service.initUser();

        service.isReady$.subscribe((isReady) => {
            expect(isReady).toBeTrue();
        });
    });
});
})
