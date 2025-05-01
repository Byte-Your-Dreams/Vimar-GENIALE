import { PieChartStrategy } from './pie-chart-strategy';
import { ChartService } from './chart.service';

describe('PieChartStrategy', () => {
  let pieChartStrategy: PieChartStrategy;
  let mockChartService: jasmine.SpyObj<ChartService>;

  beforeEach(() => {
    mockChartService = jasmine.createSpyObj('ChartService', ['pieChartData']);
    pieChartStrategy = new PieChartStrategy();
  });

  it('should call ChartService.pieChartData with correct parameters', () => {
    const context = 'chartContext';
    const labels = ['Label1', 'Label2'];
    const data = [10, 20];
    const title = 'Test Pie Chart';
    const primaryKey = 'Primary Key';

    pieChartStrategy.render(mockChartService, context, labels, data, title, primaryKey);

    expect(mockChartService.pieChartData).toHaveBeenCalledWith(
      title,
      primaryKey,
      labels,
      data,
      context,
      'pie'
    );
  });
});