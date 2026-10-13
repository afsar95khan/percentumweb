import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from '../../services/loading.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressSpinnerModule],
  selector: 'app-api-loader',
  styleUrl: './api-loader.component.css',
  template: `
    @if (loading.isLoading()) {
      <div class="api-loader-overlay" role="status" aria-label="Laster">
        <p-progress-spinner ariaLabel="Laster" />
      </div>
    }
  `,
})
export class ApiLoaderComponent {
  protected readonly loading = inject(LoadingService);
}
