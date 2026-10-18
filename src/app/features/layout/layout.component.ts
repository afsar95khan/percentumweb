import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApplicationAudienceService } from '../../core/services/application-audience.service';
import { APIService } from '../../core/services/api.service';
import { ApiLoaderComponent } from '../../core/components/api-loader/api-loader.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ApiLoaderComponent, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-layout',
  styleUrl: './layout.component.css',
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  public readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly api = inject(APIService);
  private readonly applicationAudience = inject(ApplicationAudienceService);
  protected readonly applicantType = () =>
    this.applicationAudience.selected() === 'business' ? 'company' : 'private';
  protected readonly menuOpen = signal(false);
  protected readonly states = signal<any>(null);
  protected readonly isScrolled = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Triggers fixed header after scrolling 100px down
    this.isScrolled.set(window.scrollY > 100);
  }

  ngOnInit() {
    this.getProjects();
  }

  getProjects() {
    const endpoint = 'analytics/user/summary';
    this.api.get('', endpoint).subscribe((res: any) => {
      if (res.success) {
        this.states.set(res.data);
      }
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout() {
    this.auth.logout(); 
    this.router.navigate(['/home']);  
  }
}