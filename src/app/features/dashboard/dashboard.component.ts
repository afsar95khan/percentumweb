import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DashboardItem {
  label: string;
  icon: string;
  route?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.css',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
    protected readonly user = signal<any>(null);
    
  protected readonly items: DashboardItem[] = [
    { label: 'Investere', icon: 'pi pi-wallet' },
    { label: 'Oversikt', icon: 'pi pi-th-large' },
    { label: 'Transaksjoner', icon: 'pi pi-sync' },
    { label: 'Meldinger', icon: 'pi pi-comment' },
    { label: 'Min Profil', icon: 'pi pi-user', route: '/profile' },
    { label: 'Mine lån', icon: 'pi pi-file', route: '/my-loan' },
  ];

  constructor() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user.set(JSON.parse(userData));
    }
  }
}
