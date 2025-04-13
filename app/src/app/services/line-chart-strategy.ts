import { ChartStrategy } from './chart-strategy';
import { ChartService } from './chart.service';

export class LineChartStrategy implements ChartStrategy {
  render(chartService: ChartService, context: string, labels: any, data: any, title: string, primaryKey: string, secondaryKey?: string, thirdyKey?: string): void {
    if(secondaryKey) {
      chartService.double(title, primaryKey, secondaryKey, labels, data.primary, data.secondary, context, 'line');
    }
    else {
      chartService.single(title, primaryKey, labels, data, context, 'line');
    }
  }
}