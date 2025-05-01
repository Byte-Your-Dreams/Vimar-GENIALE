import { TestBed } from '@angular/core/testing';
import { ConversationService } from './conversation.service';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';

describe('ConversationService', () => {
  let service: ConversationService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;

  beforeEach(() => {
    const supabaseSpy = jasmine.createSpyObj('SupabaseService', ['someMethod']); 

    TestBed.configureTestingModule({
      providers: [
        ConversationService,
        { provide: SupabaseService, useValue: supabaseSpy },
      ],
    });

    service = TestBed.inject(ConversationService);
    mockSupabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the current conversation', () => {
    const mockConversation = { id: '123', name: 'Test Conversation' };
    service.setCurrentConversation(mockConversation);

    service.currentConversation$.subscribe((conversation) => {
      expect(conversation).toEqual(mockConversation);
    });
    expect(service['currentConversationId']).toBe('123');
  });

  it('should add a temporary message', () => {
    const temporaryId = 'temp123';
    const message = 'This is a temporary message';

    service.currentMessages$.subscribe((messageEvent) => {
      if (messageEvent?.type === ConversationService.MESSAGE_TYPE.TEMP) {
        expect(messageEvent.data).toEqual({
          id: temporaryId,
          domanda: message,
          risposta: '',
          CreatedAt: jasmine.any(String),
        });
      }
    });

    service.addTempMessage(temporaryId, message);
  });

  it('should update a temporary message', () => {
    const temporaryId = 'temp123';
    const updatedMessage = { id: '456', domanda: 'Updated message' };

    service.currentMessages$.subscribe((messageEvent) => {
      if (messageEvent?.type === ConversationService.MESSAGE_TYPE.UPDATE_ID) {
        expect(messageEvent.temporaryId).toBe(temporaryId);
        expect(messageEvent.data).toEqual(updatedMessage);
      }
    });

    service.updateTempMessage(temporaryId, updatedMessage);
  });

  it('should update a message', () => {
    const messageId = '456';
    const updatedMessage = { id: '456', domanda: 'Updated message' };

    service.currentMessages$.subscribe((messageEvent) => {
      if (messageEvent?.type === ConversationService.MESSAGE_TYPE.UPDATE) {
        expect(messageEvent.data).toEqual(updatedMessage);
      }
    });

    service.updateMessage(messageId, updatedMessage);
  });
});