import { TestBed } from '@angular/core/testing';
import { ChartService } from './chart.service';
import { Chart } from 'chart.js';
import { ChartStrategy } from './chart-strategy';

describe('ChartService', () => {
  let service: ChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartService);
  
    // 添加一个假的 canvas 元素到 DOM 中
    const canvas = document.createElement('canvas');
    canvas.id = 'context';
    document.body.appendChild(canvas);
  });

  afterEach(() => {
    // 清理 canvas，避免测试污染
    const canvas = document.getElementById('context');
    if (canvas) {
      document.body.removeChild(canvas);
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set chart strategy', () => {
    const mockStrategy: ChartStrategy = {
      render: jasmine.createSpy('render'),
    };
    service.setStrategy(mockStrategy);
    expect((service as any).strategy).toBe(mockStrategy);
  });

  it('should call strategy render method in renderChart', () => {
    const mockStrategy: ChartStrategy = {
      render: jasmine.createSpy('render'),
    };
    service.setStrategy(mockStrategy);
    service.renderChart('context', ['label'], [1, 2, 3], 'title', 'key');
    expect(mockStrategy.render).toHaveBeenCalled();
  });

  it('should throw error if strategy not set', () => {
    expect(() =>
      service.renderChart('context', ['label'], [1, 2], 'title', 'key')
    ).toThrowError('Chart strategy not set');
  });

 it('should create a chart in single()', () => {
  expect(() => {
    service.single('Test Chart', 'Key', ['A', 'B'], [1, 2], 'context', 'bar');
  }).not.toThrow();
});

it('should create a chart in double()', () => {
    expect(() => {
      service.double(
        'Test Chart',
        'Dataset 1',
        'Dataset 2',
        ['A', 'B'],
        [1, 2],
        [3, 4],
        'context',
        'bar'
      );
    }).not.toThrow();
  });

  it('should create a chart in pieChartData()', () => {
    expect(() => {
      service.pieChartData('Pie Test', 'Key', ['A', 'B'], [1, 2], 'context', 'pie');
    }).not.toThrow();
  });
});
