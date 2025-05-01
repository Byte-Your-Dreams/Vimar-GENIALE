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
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component'; // Adjust the path as needed

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
                MessageboxComponent,
                FeedbackDialogComponent,
                MessageboxComponent
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

        it('should subscribe to user$', () => {
            component.ngOnInit();
            expect(mockSupabaseService.getChatsForUser).toHaveBeenCalledWith('test-user');
        });
        it('should set userId when user is available', () => {
            component.ngOnInit();
            expect(component['userId']).toBe('test-user');
        });
        it('should call getChatsForUser when userId is available', () => {
            component.ngOnInit();
            expect(mockSupabaseService.getChatsForUser).toHaveBeenCalledWith('test-user');
        });
        it('should call getChatsForUser when userId is available', () => {
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
            mockConversationService.currentMessages$ = of({
                type: mockConversationService.MESSAGE_TYPE.UPDATE,
                data: { id: 1, domanda: 'test question', risposta: 'answer' }
            });
            component.ngOnInit();

            expect(component.clearTimeout).toHaveBeenCalled();
        });
    });

    describe('feedback handling', () => {
        it('should open feedback dialog with positive or negative', () => {
            component.handleFeedbackClick('thumbsUp');
            expect(mockDialog.open).toHaveBeenCalledWith(FeedbackDialogComponent, {
                width: '250px',
                data: { isPositive: true }
            });

            component.handleFeedbackClick('thumbsDown');
            expect(mockDialog.open).toHaveBeenCalledWith(FeedbackDialogComponent, {
                width: '250px',
                data: { isPositive: false }
            });
        });

        it('should call submitFeedback with correct parameters', async () => {
            mockDialog.open.and.returnValue({
                afterClosed: () => of('test feedback')
            });

            component.currentConversation = {
                messages: [{ id: 123, domanda: 'test', risposta: 'answer' }]
            };

            await component.handleFeedbackClick('thumbsUp');
            expect(mockSupabaseService.submitFeedback).toHaveBeenCalledWith(123, true, 'test feedback');
        });

        it('should show feedback changed', fakeAsync(() => {
            mockDialog.open.and.returnValue({
                afterClosed: () => of('test feedback')
            });

            component.currentConversation = {
                messages: [{ id: 123, domanda: 'test', risposta: 'answer' }]
            };

            component.handleFeedbackClick('thumbsUp');
            tick();
            expect(component.showFeedbackSuccess).toBeTrue();

            tick(5000);
            expect(component.showFeedbackSuccess).toBeFalse();
        }));

        it('should handle errors when submitFeedback fails', async () => {
            mockDialog.open.and.returnValue({
                afterClosed: () => of('test feedback')
            });

            mockSupabaseService.submitFeedback.and.returnValue(Promise.reject('Error submitting feedback'));

            component.currentConversation = {
                messages: [{ id: 123, domanda: 'test', risposta: 'answer' }]
            };

            spyOn(console, 'error');
            await component.handleFeedbackClick('thumbsUp');
            expect(console.error).toHaveBeenCalledWith('Error submitting feedback:', 'Error submitting feedback');
        });
        it('should not call submitFeedback if messageId is not available', async () => {
            mockDialog.open.and.returnValue({
                afterClosed: () => of('test feedback')
            });

            component.currentConversation = {
                messages: [{ domanda: 'test', risposta: 'answer' }]
            };

            await component.handleFeedbackClick('thumbsUp');
            expect(mockSupabaseService.submitFeedback).not.toHaveBeenCalled();
        });

        it('should not call submitFeedback if feedback is undefined', async () => {
            mockDialog.open.and.returnValue({
                afterClosed: () => of(undefined)
            });

            component.currentConversation = {
                messages: [{ id: 123, domanda: 'test', risposta: 'answer' }]
            };

            await component.handleFeedbackClick('thumbsUp');
            expect(mockSupabaseService.submitFeedback).not.toHaveBeenCalled();
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
            Object.defineProperty(component, 'chats', {
                value: [{ id: 1, name: 'Chat 1' }, { id: 2, name: 'Chat 2' }],
                writable: true,
            });
            component.selectChat(1);
            expect(mockConversationService.setCurrentConversation).toHaveBeenCalledWith(
                jasmine.objectContaining({ id: 1, name: 'Chat 1' })
            );
        });
        it('should scroll to bottom', fakeAsync(() => {
            spyOn(component, 'scrollToBottom').and.callThrough();
            component.scrollToBottom();
            tick(1000);
            expect(component.scrollToBottom).toHaveBeenCalled();
        }));

        it('should handle null response from newChat', async () => {
            mockSupabaseService.newChat.and.returnValue(Promise.resolve(null));
            component['userId'] = 'test-user';

            await component.newChat();

            expect(mockSupabaseService.newChat).toHaveBeenCalledWith('test-user');
            expect(mockSupabaseService.getChatsForUser).toHaveBeenCalledWith('test-user');
            expect(mockConversationService.setCurrentConversation).not.toHaveBeenCalled();
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
        it('should return false for undefined messages', () => {
            const undefinedMessage = undefined;
            expect(component.isTimeoutMessage(undefinedMessage)).toBeFalse();
        });
        it('should return false for messages without risposta property', () => {
            const messageWithoutRisposta = { domanda: 'test question' };
            expect(component.isTimeoutMessage(messageWithoutRisposta)).toBeFalse();
        });
    });
    
    it('should log when user is null', () => {
        spyOn(console, 'log');
        mockUserService.user$ = of(null); // forza utente null
        component.ngOnInit();
        expect(console.log).toHaveBeenCalledWith('[Chat] User not ready yet');
      });
     
      it('should not create new chat if userId is null', async () => {
        component['userId'] = null;
        await component.newChat();
        expect(mockSupabaseService.newChat).not.toHaveBeenCalled();
      });
      
      it('should show and hide error if chat limit is reached', fakeAsync(() => {
        component['userId'] = 'test-user';
        component['chats'] = [{id: 1}, {id: 2}, {id: 3}];
      
        component.newChat();
        expect(component.showError).toBeTrue();
      
        tick(5000); // aspetta che l'errore venga nascosto
        expect(component.showError).toBeFalse();
      }));
    
      it('should handle error in scrollToBottom gracefully', fakeAsync(() => {
        component.messagesEndRef = {
          nativeElement: {
            scrollIntoView: () => {
              throw new Error('scroll failed');
            }
          }
        } as any;
      
        spyOn(console, 'error');
      
        component.scrollToBottom();
        tick(100); // esegue il setTimeout
      
        expect(console.error).toHaveBeenCalledWith('Scroll to botton failed:', jasmine.any(Error));
      }));
      it('should scroll to bottom if element exists', fakeAsync(() => {
        const scrollSpy = jasmine.createSpy('scrollIntoView');
        component.messagesEndRef = {
          nativeElement: { scrollIntoView: scrollSpy }
        } as any;
      
        component.scrollToBottom();
        tick(1000);
        expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'end' });
      }));

      it('should not throw if messagesEndRef is undefined', fakeAsync(() => {
        component.messagesEndRef = null as any;
        spyOn(console, 'error');
        expect(() => {
          component.scrollToBottom();
          tick(1000);
        }).not.toThrow();
        expect(console.error).not.toHaveBeenCalled();
      }));
      
      it('should clear existing timeout before starting new one', () => {
        const clearSpy = spyOn(window, 'clearTimeout').and.callThrough();
        component['timeoutId'] = setTimeout(() => {}, 5000);
        component.startTimeout();
        expect(clearSpy).toHaveBeenCalled();
      });
      
      it('should handle undefined messagesEndRef gracefully', fakeAsync(() => {
        component.messagesEndRef = undefined as any;
        expect(() => {
          component.scrollToBottom();
          tick(100);
        }).not.toThrow();
      }));

      it('should call startTimeout if last message has domanda and no risposta', () => {
        const spy = spyOn(component, 'startTimeout');
        const messages = [{ domanda: 'Domanda?', risposta: null }];
        mockConversationService.currentConversation$ = of({ messages });
    
        component.ngOnInit();
    
        expect(spy).toHaveBeenCalled();
      });
    
      it('should not call startTimeout if last message has no domanda and no risposta', () => {
        const spy = spyOn(component, 'startTimeout');
        const messages = [{}];
        mockConversationService.currentConversation$ = of({ messages });
    
        component.ngOnInit();
    
        expect(spy).not.toHaveBeenCalled();
      });
    
});