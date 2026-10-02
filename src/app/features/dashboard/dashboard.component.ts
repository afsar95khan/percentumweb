import { ChangeDetectionStrategy, Component } from '@angular/core';

interface DashboardItem {
  label: string;
  icon: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.css',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  protected readonly items: DashboardItem[] = [
    { label: 'Investere', icon: 'pi pi-wallet' },
    { label: 'Oversikt', icon: 'pi pi-th-large' },
    { label: 'Transaksjoner', icon: 'pi pi-sync' },
    { label: 'Meldinger', icon: 'pi pi-comment' },
    { label: 'Min Profil', icon: 'pi pi-user' },
    { label: 'Mine lån', icon: 'pi pi-file' },
  ];
}
