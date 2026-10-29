import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard-summary',
  styleUrl: './dashboard-summary.component.css',
  templateUrl: './dashboard-summary.component.html',
})
export class DashboardSummaryComponent {}
