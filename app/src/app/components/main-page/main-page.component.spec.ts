import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainPageComponent } from './main-page.component';
import { ChatComponent } from '../chat/chat.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPageComponent, ChatComponent],
      schemas: [NO_ERRORS_SCHEMA] 
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the main page component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the chat component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const chatEl = compiled.querySelector('app-chat');
    expect(chatEl).not.toBeNull();
  });
});
