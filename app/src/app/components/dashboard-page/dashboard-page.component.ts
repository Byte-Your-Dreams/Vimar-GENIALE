import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartService } from '../../services/chart.service';
import { LineChartStrategy } from '../../services/line-chart-strategy';
import { BarChartStrategy } from '../../services/bar-chart-strategy';
import { PieChartStrategy } from '../../services/pie-chart-strategy';
import { SupabaseService } from '../../services/supabase.service';
import { ScraperButtonComponent } from '../scraper-button/scraper-button.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, FormsModule, ScraperButtonComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  standalone: true
})

export class DashboardPageComponent implements OnInit {

  public averageWords: number = 0;
  public wordCounts: { word: string, count: number }[] = [];

  constructor(
    private chartService: ChartService, 
    private supabaseService: SupabaseService,
   ) { }

  async ngOnInit(): Promise<void> {

    // Line Chart
    this.chartService.setStrategy(new LineChartStrategy());
    const lineChartData: { week_number: number, positive_feedback: number, negative_feedback: number}[] = await this.supabaseService.getCountFeedbacks();
    console.log('lineChartData', lineChartData);
    
    const lineLabelsList = lineChartData.map(item => `Settimana ${item.week_number -1}`);
    const lineDataPositive = lineChartData.map(item => item.positive_feedback);
    const lineDataNegative = lineChartData.map(item => item.negative_feedback);
    this.chartService.renderChart('line-chart', lineLabelsList, { primary: lineDataPositive, secondary: lineDataNegative }, 'Line Chart', 'Positive Feedbacks', 'Negative Feedbacks');

    // Bar Chart
    this.chartService.setStrategy(new BarChartStrategy());
    const barChartData: { numberofweek: number, numberofmessages: number}[] = await this.supabaseService.getCountMessages();
    const barLabelsList = barChartData.map(item => `Settimana ${item.numberofweek}`);
    const barData = barChartData.map(item => item.numberofmessages);
    this.chartService.renderChart('bar-chart', barLabelsList, barData, 'Bar Chart', 'Primary Data');

    // Pie Chart
    this.chartService.setStrategy(new PieChartStrategy());
    const pieChartData: { positive_feedback_mex: number, negative_feedback_mex: number, neutral_feedback_mex: number }[] = await this.supabaseService.getCountFeedbackMex(); 
    const pieLabelsList = ["Positive", "Negative", "Neutral"];
    console.log('pieChartData', pieChartData);
    const pieData = [pieChartData[0].positive_feedback_mex, pieChartData[0].negative_feedback_mex, pieChartData[0].neutral_feedback_mex];
    this.chartService.renderChart('pie-chart', pieLabelsList, pieData, 'Pie Chart', 'Quantity');

    // Termini più usati e numero di parole usate
    const analysisResult = await this.supabaseService.getAnalyzeTextMessages();
    this.averageWords = Math.floor(analysisResult.averageWords);
    this.wordCounts  = analysisResult.wordCounts.slice(0,3);
  }
}