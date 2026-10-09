import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApplicationAudienceService } from '../../core/services/application-audience.service';
import { APIService } from '../../core/services/api.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-layout',
  styleUrl: './layout.component.css',
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
   private readonly api = inject(APIService);
  private readonly applicationAudience = inject(ApplicationAudienceService);
  protected readonly applicantType = () =>
    this.applicationAudience.selected() === 'business' ? 'company' : 'private';
  protected readonly menuOpen = signal(false);
  protected readonly states = signal<any>(null)

  ngOnInit() {
    this.getProjects()
  }
  getProjects() {
    const endpoint = 'analytics/user/summary';
     this.api.get('', endpoint).subscribe((res: any) => {
      if (res.success) {
        this.states.set(res.data)
      }
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
