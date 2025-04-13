import { ChartService } from './chart.service';

export interface ChartStrategy {
  render(chartService: ChartService, context: string, labels: any, data: any, title: string, key: string, secondaryKey?: string, thirdKey?: string): void;
}