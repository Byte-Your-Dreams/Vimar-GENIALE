import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { LoadingService } from './services/loading.service';
import { BehaviorSubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let loadingServiceMock: any;
  let loadingSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    loadingSubject = new BehaviorSubject<boolean>(false);

    loadingServiceMock = {
      loading$: loadingSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: LoadingService, useValue: loadingServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA] // 忽略子组件
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading false', () => {
    expect(component.isLoading).toBeFalse();
  });

  it('should update isLoading when loadingService emits true', () => {
    loadingSubject.next(true);
    fixture.detectChanges();
    expect(component.isLoading).toBeTrue();
  });

  it('should update isLoading when loadingService emits false', () => {
    loadingSubject.next(false);
    fixture.detectChanges();
    expect(component.isLoading).toBeFalse();
  });

  it('should log on ngOnInit', () => {
    spyOn(console, 'log');
    component.ngOnInit();
    expect(console.log).toHaveBeenCalledWith('AppComponent initialized');
  });
});
