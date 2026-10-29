import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard-investments',
  styleUrl: './dashboard-investments.component.css',
  templateUrl: './dashboard-investments.component.html',
})
export class DashboardInvestmentsComponent {}
