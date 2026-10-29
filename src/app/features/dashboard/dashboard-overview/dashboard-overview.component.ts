import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-dashboard-overview',
  styleUrl: './dashboard-overview.component.css',
  templateUrl: './dashboard-overview.component.html',
})
export class DashboardOverviewComponent {}
