import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ScraperButtonComponent } from './scraper-button.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of as observableOf } from 'rxjs';
import * as rxjs from 'rxjs';
import { HttpClient } from '@angular/common/http';
 
import { of, throwError } from 'rxjs';

describe('ScraperButtonComponent', () => {
  let component: ScraperButtonComponent;
  let fixture: ComponentFixture<ScraperButtonComponent>;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScraperButtonComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ScraperButtonComponent);
    component = fixture.componentInstance;
    // httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);  // Inject HttpClient directly
    fixture.detectChanges();
  });

  // afterEach(() => {
  //   httpMock.verify(); // 确保没有未处理的请求
  // });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start scraper and schedule status check', fakeAsync(() => {
    const mockResponse = { jobid: '12345' };
    spyOn(component['http'], 'post').and.returnValue(observableOf(mockResponse));
    spyOn(component, 'startStatusCheck');
    component.startScraper();
    expect(component['http'].post).toHaveBeenCalledWith(
      'http://localhost:6800/schedule.json',
      'project=Vimar&spider=SpiderVimar',
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );}));

  it('should check scraper status', fakeAsync(() => {
    const mockResponse = { status: 'running' };
    component['jobId'] = '12345';
    spyOn(component['http'], 'get').and.returnValue(observableOf(mockResponse));
    component.checkScraperStatus();
    expect(component['http'].get).toHaveBeenCalledWith(
      'http://localhost:6800/status.json',
      { params: jasmine.anything() }
    );
  }
  ));


  it('should check scraper status finnised status', fakeAsync(() => {
    const mockResponse = { currstate: 'finished' };
    component['jobId'] = '12345';
    spyOn(component['http'], 'get').and.returnValue(observableOf(mockResponse));
    component.checkScraperStatus();
    expect(component['http'].get).toHaveBeenCalledWith(
      'http://localhost:6800/status.json',
      { params: jasmine.anything() }
    );
  }
  ));

  it('should check scraper status running status', fakeAsync(() => {
    const mockResponse = { currstate: 'running' };
    component['jobId'] = '12345';
    spyOn(component['http'], 'get').and.returnValue(observableOf(mockResponse));
    component.checkScraperStatus();
    expect(component['http'].get).toHaveBeenCalledWith(
      'http://localhost:6800/status.json',
      { params: jasmine.anything() }
    );
  }
  ));

  it('should check scraper status go to observe error', fakeAsync(() => {
    const mockResponse = { currstate: 'running' };
    component['jobId'] = '12345';
    spyOn(component['http'], 'get').and.returnValue(observableOf(throwError(() => new Error('Network error'))));
    component.checkScraperStatus();
    expect(component['http'].get).toHaveBeenCalledWith(
      'http://localhost:6800/status.json',
      { params: jasmine.anything() }
    );
  }
  ));




  it('should stop interval on ngOnDestroy', () => {
    const unsubscribeSpy = jasmine.createSpy('unsubscribe');
    component['statusCheckInterval'] = { unsubscribe: unsubscribeSpy } as any;

    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });


  it('should handle error when startScraper fails', () => {
    // Spy on httpClient.post to simulate an error
    const postSpy = spyOn(httpClient, 'post').and.returnValue(throwError(() => new Error('Network error')));

    // Spy on startStatusCheck to ensure it is not called in case of error
    spyOn(component, 'startStatusCheck');

    // Call the startScraper method
    component.startScraper();
  
    expect(component.startStatusCheck).not.toHaveBeenCalled(); // Ensure startStatusCheck is not called
  });



 

  /**
   * * Test the startStatusCheck method.
   */
  it('should start status check', fakeAsync(() => {
    const jobId = '12345';
    component['jobId'] = jobId;
    spyOn(component, 'checkScraperStatus');

    component.startStatusCheck();
    tick(5 * 60 * 1100); // Simulate the passage of time for the interval
  
    expect(component['statusCheckInterval']).toBeDefined();
    expect(component.checkScraperStatus).toHaveBeenCalled();
  }));

  it('should start status check with error', () => {
    component.startStatusCheck();
    expect(component['statusCheckInterval']).toBeDefined();
    spyOn(component, 'checkScraperStatus').and.callFake(() => { });
  });

  


  it('it should stop status check', () => {
    const unsubscribeSpy = jasmine.createSpy('unsubscribe');
    component['statusCheckInterval'] = { unsubscribe: unsubscribeSpy } as any;
    component.stopStatusCheck();
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(component['statusCheckInterval']).toBeNull();
  });
});

