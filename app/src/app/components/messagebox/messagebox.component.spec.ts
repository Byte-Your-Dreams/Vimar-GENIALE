

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MessageboxComponent } from './messagebox.component';
import { SupabaseService } from '../../services/supabase.service';
import { ConversationService } from '../../services/conversation.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import forbiddenWords from '../../../../public/forbidden-words.json';

describe('MessageboxComponent', () => {
  let component: MessageboxComponent;
  let fixture: ComponentFixture<MessageboxComponent>;
  let httpMock: HttpTestingController;
  let supabaseService: jasmine.SpyObj<SupabaseService>;
  let conversationService: jasmine.SpyObj<ConversationService>;

  beforeEach(async () => {
    const supabaseSpy = jasmine.createSpyObj('SupabaseService', [
      'sendQuestion',
      'listenMessageChanges'
    ]);
    const conversationSpy = jasmine.createSpyObj('ConversationService', [
      'addTempMessage',
      'updateTempMessage',
      'updateMessage'
    ]);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, MessageboxComponent],
      providers: [
        { provide: SupabaseService, useValue: supabaseSpy },
        { provide: ConversationService, useValue: conversationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageboxComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    supabaseService = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
    conversationService = TestBed.inject(ConversationService) as jasmine.SpyObj<ConversationService>;

    conversationService.currentConversation$ = of({ id: 'test-convo' });
    supabaseService.sendQuestion.and.resolveTo({ id: '123' });
    
    console.log(" words length: ", forbiddenWords.forbiddenWords.length);
  });

  it('conversationService should be created', () => {
    expect(conversationService).toBeTruthy();
  });

  it("Should have forbiddenWord(s) in 'forbidden-words.json '", () => {
    expect(forbiddenWords).toBeDefined();
    expect(forbiddenWords.forbiddenWords.length).toBeGreaterThan(0);
  });



  afterEach(() => {
    httpMock.verify();
    supabaseService.sendQuestion.calls.reset();
    conversationService.addTempMessage.calls.reset();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });


  describe('Input Handling', () => {
    beforeEach(() => {
        Object.defineProperty(component, 'forbiddenWords', {
            get: () => ['badword'],
          });
    });

    it('should update character counter', () => {
      const testValue = 'Hello world';

      component.handleInputChange({ target: { value: testValue } });

      expect(component.currentMessage).toBe(testValue);
      expect(component.remainingChars).toBe(200 - testValue.length);
    });

    it('should detect forbidden words (case insensitive)', () => {
      component.handleInputChange({ target: { value: 'This has BADWORD' } });
      expect(component.containsForbiddenWords).toBeTrue();
    });

    it('should handle empty input', () => {
      component.handleInputChange({ target: { value: '' } });
      expect(component.containsForbiddenWords).toBeFalse();
      expect(component.remainingChars).toBe(200);
    });

    it('should handle maximum length input', () => {
      const maxLengthText = 'a'.repeat(200);

      component.handleInputChange({ target: { value: maxLengthText } });

      expect(component.remainingChars).toBe(0);
      expect(component.containsForbiddenWords).toBeFalse();
    });
  });

  describe('Message Submission', () => {
    beforeEach(() => {
        Object.defineProperty(component, 'forbiddenWords', {
            get: () => ['badword'],
          });
    });

    it('should send valid message', fakeAsync(() => {
      component.currentConversation = { id: 'test-convo' };
      component.currentMessage = 'Valid message';
      spyOnProperty(component as any, 'forbiddenWords', 'get').and.returnValue(['badword']);
      component.containsForbiddenWords = false;
      component.isInputDisabled = false;
      supabaseService.sendQuestion.and.resolveTo({ id: '123' });
      component.handleSendMessage();
      tick();
      expect(conversationService.addTempMessage).toHaveBeenCalledWith(
        jasmine.stringMatching(/^temp_/),
        'Valid message',
      );
      expect(supabaseService.sendQuestion).toHaveBeenCalledWith('test-convo', 'Valid message');
      expect(supabaseService.listenMessageChanges).toHaveBeenCalledWith('123', jasmine.any(Function));
    }));

    it('should block empty message submission', () => {
      component.currentMessage = '';
      component.handleSendMessage();
      expect(conversationService.addTempMessage).not.toHaveBeenCalled();
    });

    it('should block submission with forbidden words', () => {
    spyOnProperty(component as any, 'forbiddenWords', 'get').and.returnValue(['badword']);
      component.currentMessage = 'Contains badword';
      component.handleSendMessage();
      expect(conversationService.addTempMessage).not.toHaveBeenCalled();
    });

    it('should block submission when no conversation', () => {
      conversationService.currentConversation$ = of(null);
      component.currentMessage = '';
      component.handleSendMessage();
      expect(conversationService.addTempMessage).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Handling', () => {
    it('should trigger send on Enter key', () => {
      const spy = spyOn(component, 'handleSendMessage');
      component.handleKeyDown({ key: 'Enter' } as KeyboardEvent);
      expect(spy).toHaveBeenCalled();
    });

    it('should ignore other keys', () => {
      const spy = spyOn(component, 'handleSendMessage');
      component.handleKeyDown({ key: 'a' } as KeyboardEvent);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  it('should reset message box state', () => {
    component.currentMessage = 'test';
    component.remainingChars = 190;
    component.containsForbiddenWords = true;

    component.resetMessagebox();

    expect(component.currentMessage).toBe('');
    expect(component.remainingChars).toBe(200);
    expect(component.containsForbiddenWords).toBeFalse();
  });
});
