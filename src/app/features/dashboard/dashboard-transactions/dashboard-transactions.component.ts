import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard-transactions',
  styleUrl: './dashboard-transactions.component.css',
  templateUrl: './dashboard-transactions.component.html',
})
export class DashboardTransactionsComponent {}
