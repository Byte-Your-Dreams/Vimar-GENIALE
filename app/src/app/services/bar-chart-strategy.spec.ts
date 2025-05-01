import { BarChartStrategy } from './bar-chart-strategy';
import { ChartService } from './chart.service';

describe('BarChartStrategy', () => {
  let barChartStrategy: BarChartStrategy;
  let mockChartService: jasmine.SpyObj<ChartService>;

  beforeEach(() => {
    mockChartService = jasmine.createSpyObj('ChartService', ['single', 'double']);
    barChartStrategy = new BarChartStrategy();
  });

  it('should call ChartService.double when secondaryKey is provided', () => {
    const context = 'chartContext';
    const labels = ['Label1', 'Label2'];
    const data = { primary: [10, 20], secondary: [15, 25] };
    const title = 'Test Chart';
    const primaryKey = 'Primary Key';
    const secondaryKey = 'Secondary Key';

    barChartStrategy.render(mockChartService, context, labels, data, title, primaryKey, secondaryKey);

    expect(mockChartService.double).toHaveBeenCalledWith(
      title,
      primaryKey,
      secondaryKey,
      labels,
      data.primary,
      data.secondary,
      context,
      'bar'
    );
    expect(mockChartService.single).not.toHaveBeenCalled();
  });

  it('should call ChartService.single when secondaryKey is not provided', () => {
    const context = 'chartContext';
    const labels = ['Label1', 'Label2'];
    const data = [10, 20];
    const title = 'Test Chart';
    const primaryKey = 'Primary Key';

    barChartStrategy.render(mockChartService, context, labels, data, title, primaryKey);

    expect(mockChartService.single).toHaveBeenCalledWith(
      title,
      primaryKey,
      labels,
      data,
      context,
      'bar'
    );
    expect(mockChartService.double).not.toHaveBeenCalled();
  });
});