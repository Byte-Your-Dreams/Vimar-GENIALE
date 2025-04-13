import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { ConversationService } from '../../services/conversation.service';
import { SupabaseService } from '../../services/supabase.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { of, Subscription } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { MessageboxComponent } from '../messagebox/messagebox.component';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let mockConversationService: any;
    let mockSupabaseService: any;
    let mockUserService: any;
    let mockDialog: any;

    beforeEach(async () => {
        mockConversationService = {
            currentConversation$: of(null),
            currentMessages$: of({
                type: '',
                data: { id: 'tempId', domanda: 'test question', risposta: null }
            }),
            addTempMessage: jasmine.createSpy('addTempMessage'),
            updateTempMessage: jasmine.createSpy('updateTempMessage'),
            updateMessage: jasmine.createSpy('updateMessage'),
            currentConversationId: 'test-conversation-id',
            setCurrentConversation: jasmine.createSpy('setCurrentConversation'),
            MESSAGE_TYPE: {
                TEMP: 'TEMP',
                UPDATE_ID: 'UPDATE_ID',
                UPDATE: 'UPDATE'
            },
        };


        mockSupabaseService = {
            chats$: of([]),
            getChatsForUser: jasmine.createSpy('getChatsForUser').and.returnValue(Promise.resolve()),
            newChat: jasmine.createSpy('newChat').and.returnValue(Promise.resolve([{ id: 1 }])),
            submitFeedback: jasmine.createSpy('submitFeedback').and.returnValue(Promise.resolve())
        };

        mockUserService = {
            user$: of({ id: 'test-user' })
        };

        mockDialog = {
            open: jasmine.createSpy('open').and.returnValue({
                afterClosed: () => of('test feedback')
            })
        };

        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                HttpClientModule,
                MarkdownModule,
                ChatComponent, // Moved from declarations to imports
                MessageboxComponent // Also needs to be imported if it's standalone
            ],
            providers: [
                { provide: ConversationService, useValue: mockConversationService },
                { provide: SupabaseService, useValue: mockSupabaseService },
                { provide: UserService, useValue: mockUserService },
                { provide: MatDialog, useValue: mockDialog }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should subscribe to currentConversation$', () => {
            const testConversation = { messages: [] };
            mockConversationService.currentConversation$ = of(testConversation);
            component.ngOnInit();
            expect(component.currentConversation).toEqual(testConversation);
        });

        it('should subscribe to user$ and get chats if user exists', () => {
            component.ngOnInit();
            expect(mockSupabaseService.getChatsForUser).toHaveBeenCalledWith('test-user');
        });

    }
    );

    describe('timeout handling', () => {
        it('should start timeout when last message has question but no answer', fakeAsync(() => {
            component.currentConversation = {
                messages: [
                    { domanda: 'test question', risposta: null }
                ]
            };
            component.startTimeout();
            expect(component['timeoutId']).toBeTruthy();

            tick(component['timeoutDuration']);
            expect(component.currentConversation.messages.length).toBe(2);
            expect(component.currentConversation.messages[1].risposta).toBe('Timeout rimanda la domanda');
        }));

        it('should clear timeout when new answer arrives', () => {
            spyOn(component, 'clearTimeout');
            component.currentConversation = {
                messages: [
                    { domanda: 'test question', risposta: null }
                ]
            };

            // Simulate answer coming in
            mockConversationService.currentMessages$ = of({
                type: mockConversationService.MESSAGE_TYPE.UPDATE,
                data: { id: 1, domanda: 'test question', risposta: 'answer' }
            });
            component.ngOnInit();

            expect(component.clearTimeout).toHaveBeenCalled();
        });
    });

    describe('feedback handling', () => {
        it('should open feedback dialog and submit feedback', async () => {
            component.currentConversation = {
                messages: [
                    { id: 123, domanda: 'test', risposta: 'answer' }
                ]
            };

            await component.handleFeedbackClick('thumbsUp');

            expect(mockDialog.open).toHaveBeenCalled();
            expect(mockSupabaseService.submitFeedback).toHaveBeenCalledWith(123, true, 'test feedback');
            expect(component.selectedFeedback).toBe('thumbsUp');
        });
    });

    describe('chat management', () => {
        it('should create new chat when user exists and limit not reached', async () => {
            mockSupabaseService.chats$ = of([{ id: 1 }, { id: 2 }]);
            await component.newChat();

            expect(mockSupabaseService.newChat).toHaveBeenCalledWith('test-user');
            expect(mockSupabaseService.getChatsForUser).toHaveBeenCalled();
            expect(mockConversationService.setCurrentConversation).toHaveBeenCalled();
        });
        it('should show error when chat limit is reached', fakeAsync(() => {
            mockSupabaseService.chats$ = of([{ id: 1 }, { id: 2 }, { id: 3 }]);
            mockUserService.user$ = of({ id: 'test-user' });
            component.ngOnInit();
            tick();
            fixture.detectChanges();
            component.newChat();
            fixture.detectChanges();
            expect(component.showError).toBeTrue();
            tick(5000);
            fixture.detectChanges();
            expect(component.showError).toBeFalse();
        }));

        it('should set selectedChatId when selecting chat', () => {
            // Mock the chats array
            Object.defineProperty(component, 'chats', {
                value: [{ id: 1, name: 'Chat 1' }, { id: 2, name: 'Chat 2' }],
                writable: true,
            });

            // Call the selectChat method
            component.selectChat(1);

            // Assert that setCurrentConversation is called with the correct chat object
            expect(mockConversationService.setCurrentConversation).toHaveBeenCalledWith(
                jasmine.objectContaining({ id: 1, name: 'Chat 1' })
            );
        });
    });

    describe('cleanup', () => {
        it('should unsubscribe and clear timeout on destroy', () => {
            spyOn(component['subscription'], 'unsubscribe');
            spyOn(component, 'clearTimeout');

            component.ngOnDestroy();

            expect(component['subscription'].unsubscribe).toHaveBeenCalled();
            expect(component.clearTimeout).toHaveBeenCalled();
        });
    });

    describe('isTimeoutMessage', () => {
        it('should correctly identify timeout messages', () => {
            const timeoutMessage = { risposta: 'Timeout rimanda la domanda' };
            const normalMessage = { risposta: 'Normal answer' };

            expect(component.isTimeoutMessage(timeoutMessage)).toBeTrue();
            expect(component.isTimeoutMessage(normalMessage)).toBeFalse();
        });
    });
});