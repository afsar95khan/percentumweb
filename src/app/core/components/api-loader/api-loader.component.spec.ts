import { TestBed } from '@angular/core/testing';
import { ApiLoaderComponent } from './api-loader.component';
import { LoadingService } from '../../services/loading.service';

describe('ApiLoaderComponent', () => {
  it('renders the PrimeNG spinner only while requests are active', async () => {
    await TestBed.configureTestingModule({
      imports: [ApiLoaderComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ApiLoaderComponent);
    const loading = TestBed.inject(LoadingService);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.api-loader-overlay')).toBeNull();

    loading.show();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.api-loader-overlay p-progress-spinner')).not.toBeNull();

    loading.hide();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.api-loader-overlay')).toBeNull();
  });
});
