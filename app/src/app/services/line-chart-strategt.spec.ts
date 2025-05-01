import { LineChartStrategy } from './line-chart-strategy';
import { ChartService } from './chart.service';

describe('LineChartStrategy', () => {
  let lineChartStrategy: LineChartStrategy;
  let mockChartService: jasmine.SpyObj<ChartService>;

  beforeEach(() => {
    mockChartService = jasmine.createSpyObj('ChartService', ['single', 'double']);
    lineChartStrategy = new LineChartStrategy();
  });

  it('should call ChartService.double when secondaryKey is provided', () => {
    const context = 'chartContext';
    const labels = ['Label1', 'Label2'];
    const data = { primary: [10, 20], secondary: [15, 25] };
    const title = 'Test Line Chart';
    const primaryKey = 'Primary Key';
    const secondaryKey = 'Secondary Key';

    lineChartStrategy.render(mockChartService, context, labels, data, title, primaryKey, secondaryKey);

    expect(mockChartService.double).toHaveBeenCalledWith(
      title,
      primaryKey,
      secondaryKey,
      labels,
      data.primary,
      data.secondary,
      context,
      'line'
    );
    expect(mockChartService.single).not.toHaveBeenCalled();
  });

  it('should call ChartService.single when secondaryKey is not provided', () => {
    const context = 'chartContext';
    const labels = ['Label1', 'Label2'];
    const data = [10, 20];
    const title = 'Test Line Chart';
    const primaryKey = 'Primary Key';

    lineChartStrategy.render(mockChartService, context, labels, data, title, primaryKey);

    expect(mockChartService.single).toHaveBeenCalledWith(
      title,
      primaryKey,
      labels,
      data,
      context,
      'line'
    );
    expect(mockChartService.double).not.toHaveBeenCalled();
  });
});