import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';
import { skip, take } from 'rxjs/operators';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit true when show is called', (done) => {
    service.loading$.pipe(skip(1)).subscribe((isLoading) => {
      expect(isLoading).toBeTrue();
      done();
    });
    service.show();
  });

  it('should emit false when hide is called', (done) => {
    service.loading$.pipe(skip(1)).subscribe((isLoading) => {
      expect(isLoading).toBeFalse();
      done();
    });
    service.hide();
  });

  it('should initially emit false', (done) => {
    service.loading$.pipe(take(1)).subscribe((isLoading) => {
      expect(isLoading).toBeFalse();
      done();
    });
  });
});