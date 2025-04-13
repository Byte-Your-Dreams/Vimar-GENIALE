import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FeedbackDialogComponent } from './feedback-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('FeedbackDialogComponent', () => {
  let component: FeedbackDialogComponent;
  let fixture: ComponentFixture<FeedbackDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<FeedbackDialogComponent>>;

  beforeEach(async () => {
    const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        FeedbackDialogComponent, // 使用 imports 而不是 declarations
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { isPositive: true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackDialogComponent);
    component = fixture.componentInstance;
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<FeedbackDialogComponent>>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the correct positive feedback state', () => {
    expect(component.isPositive).toBeTrue();
  });

  it('should close the dialog without data when "onNoClick" is called', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close the dialog with feedback data when "onSubmit" is called', () => {
    component.feedback = 'This is feedback';
    component.onSubmit();
    expect(dialogRefSpy.close).toHaveBeenCalledWith('This is feedback');
  });


it('should update feedback on input change', () => {
    fixture.detectChanges();
    const textareaElement: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textareaElement).not.toBeNull();
    textareaElement.value = 'Test feedback'; 
    textareaElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.feedback).toBe('Test feedback');
  });
  
});
