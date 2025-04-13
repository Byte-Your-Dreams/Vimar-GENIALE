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
      'getAnalyzeTextMessages'
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
      { week_number: 2, positive_feedback: 10, negative_feedback: 5 }
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

    await component.ngOnInit();

    // Check line chart strategy
    expect(chartServiceSpy.setStrategy).toHaveBeenCalledWith(jasmine.any(LineChartStrategy));
    expect(chartServiceSpy.renderChart).toHaveBeenCalledWith(
      'line-chart',
      ['Settimana 1'],
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
      [8, 3, 4],
      'Pie Chart',
      'Quantity'
    );

    // Check word analysis
    expect(component.averageWords).toBe(12);
    expect(component.wordCounts.length).toBe(3);
    expect(component.wordCounts[0].word).toBe('ciao');
  });
});
