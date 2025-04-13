import { ChartStrategy } from './chart-strategy';
import { ChartService } from './chart.service';

export class PieChartStrategy implements ChartStrategy {
  render(chartService: ChartService, context: string, labels: any, data: any, title: string, primaryKey: string): void {
    chartService.pieChartData(title, primaryKey, labels, data, context, 'pie');
  }
}