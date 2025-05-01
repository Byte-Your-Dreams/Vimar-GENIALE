import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DashboardPageComponent } from './dashboard-page.component';
import { ChartService } from '../../services/chart.service';
import { SupabaseService } from '../../services/supabase.service';
import { LineChartStrategy } from '../../services/line-chart-strategy';
import { BarChartStrategy } from '../../services/bar-chart-strategy';
import { PieChartStrategy } from '../../services/pie-chart-strategy';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let chartServiceSpy: jasmine.SpyObj<ChartService>;
  let supabaseServiceSpy: jasmine.SpyObj<SupabaseService>;

  beforeEach(waitForAsync(() => {
    chartServiceSpy = jasmine.createSpyObj('ChartService', ['setStrategy', 'renderChart']);
    supabaseServiceSpy = jasmine.createSpyObj('SupabaseService', [
      'getCountFeedbacks',
      'getCountMessages',
      'getCountFeedbackMex',
      'getAnalyzeTextMessages',
      'getFeedbacks'
    ]);

    TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        { provide: ChartService, useValue: chartServiceSpy },
        { provide: SupabaseService, useValue: supabaseServiceSpy }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and render all charts and analysis on init', async () => {
    // Mock SupabaseService responses
    supabaseServiceSpy.getCountFeedbacks.and.resolveTo([
      { week_number: 1, positive_feedback: 5, negative_feedback: 10 }
    ]);

    supabaseServiceSpy.getCountMessages.and.resolveTo([
      { numberofweek: 2, numberofmessages: 50 }
    ]);

    supabaseServiceSpy.getCountFeedbackMex.and.resolveTo([
      { positive_feedback_mex: 8, negative_feedback_mex: 3, neutral_feedback_mex: 4 }
    ]);

    supabaseServiceSpy.getAnalyzeTextMessages.and.resolveTo({
      averageWords: 12.8,
      wordCounts: [
        { word: 'ciao', count: 30 },
        { word: 'grazie', count: 25 },
        { word: 'ok', count: 20 },
        { word: 'altro', count: 10 }
      ]
    });

    supabaseServiceSpy.getFeedbacks.and.resolveTo([
      { risposta: 'Yes', type: true, text: 'Great!' },
      { risposta: 'No', type: false, text: 'Bad!' },
      { risposta: 'Maybe', type: true, text: 'Okay!' }
    ]);

    // Call ngOnInit to initialize the component
    await component.ngOnInit();

    // Verify feedbacks are fetched and applied
    expect(supabaseServiceSpy.getFeedbacks).toHaveBeenCalled();
    expect(component.feedbacks.length).toBe(3);

    // Check line chart strategy
    expect(chartServiceSpy.setStrategy).toHaveBeenCalledWith(jasmine.any(LineChartStrategy));
    expect(chartServiceSpy.renderChart).toHaveBeenCalledWith(
      'line-chart',
      ['Settimana 0'],
      { primary: [10], secondary: [5] },
      'Line Chart',
      'Positive Feedbacks',
      'Negative Feedbacks'
    );

    // Check bar chart strategy
    expect(chartServiceSpy.setStrategy).toHaveBeenCalledWith(jasmine.any(BarChartStrategy));
    expect(chartServiceSpy.renderChart).toHaveBeenCalledWith(
      'bar-chart',
      ['Settimana 2'],
      [50],
      'Bar Chart',
      'Primary Data'
    );

    // Check pie chart strategy
    expect(chartServiceSpy.setStrategy).toHaveBeenCalledWith(jasmine.any(PieChartStrategy));
    expect(chartServiceSpy.renderChart).toHaveBeenCalledWith(
      'pie-chart',
      ['Positive', 'Negative', 'Neutral'],
      [3, 8, 4],
      'Pie Chart',
      'Quantity'
    );

    // Check word analysis
    expect(component.averageWords).toBe(12);
    expect(component.wordCounts.length).toBe(3);
    expect(component.wordCounts[0].word).toBe('ciao');
  });



  it('should fetch feedbacks correctly', async () => {
    // Mock SupabaseService getFeedbacks response
    const mockFeedbacks = [
      { risposta: 'Yes', type: true, text: 'Great!' },
      { risposta: 'No', type: false, text: 'Bad!' },
      { risposta: 'Maybe', type: true, text: 'Okay!' }
    ];
    supabaseServiceSpy.getFeedbacks.and.resolveTo(mockFeedbacks);

    // Call the method in the component
    const feedbacks = await supabaseServiceSpy.getFeedbacks();

    // Verify the service method was called
    expect(supabaseServiceSpy.getFeedbacks).toHaveBeenCalled();

    // Verify the returned feedbacks
    expect(feedbacks.length).toBe(3);
    expect(feedbacks[0].risposta).toBe('Yes');
    expect(feedbacks[1].type).toBe(false);
    expect(feedbacks[2].text).toBe('Okay!');
  });

  it('should filter feedbacks by type = all', () => {
    component.feedbacks = [
      { risposta: '1', type: true, text: 'a' },
      { risposta: '2', type: false, text: 'b' }
    ];
    component.filterByType = 'all';
    component.applyFilters();
    expect(component.filteredFeedbacks.length).toBe(2);
  });

  it('should filter feedbacks by type = true (negative)', () => {
    component.feedbacks = [
      { risposta: '1', type: true, text: 'a' },
      { risposta: '2', type: false, text: 'b' }
    ];
    component.filterByType = 'true';
    component.applyFilters();
    expect(component.filteredFeedbacks.length).toBe(1);
    expect(component.filteredFeedbacks[0].type).toBe(false); // NOTA: !fb.type
  });

  it('should filter feedbacks by type = false (positive)', () => {
    component.feedbacks = [
      { risposta: '1', type: true, text: 'a' },
      { risposta: '2', type: false, text: 'b' }
    ];
    component.filterByType = 'false';
    component.applyFilters();
    expect(component.filteredFeedbacks.length).toBe(1);
    expect(component.filteredFeedbacks[0].type).toBe(true);
  });

  it('should return correct positive and negative counts', () => {
    component.feedbacks = [
      { risposta: '1', type: true, text: 'a' },
      { risposta: '2', type: false, text: 'b' },
      { risposta: '3', type: true, text: 'c' }
    ];

    expect(component.positiveCount).toBe(2); // type: true
    expect(component.negativeCount).toBe(1); // type: false
  });

});
