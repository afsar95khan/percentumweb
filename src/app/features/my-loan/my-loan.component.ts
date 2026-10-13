import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APIService } from '../../core/services/api.service';

interface LoanApplication {
  loan_number?: string;
  applicant_type?: string;
  loan_type?: string;
  loan_amount?: number | string;
  interest_rate?: number | string;
  tenure?: number | string;
  description?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  customer_name?: string;
  annualIncome?: number | string;
  maritalStatus?: string;
  children?: number | string;
  cars?: number | string;
  coApplicantName?: string;
  coApplicantEmail?: string;
  coApplicantPhone?: string;
  companyEmail?: string;
  companyPhone?: string;
  annualRevenue?: number | string;
  annualProfit?: number | string;
  accountingYear?: string;
  existingDebt?: number | string;
  debtType?: string;
  securityValue?: number | string;
  companyName?: string;
  status?: string;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
}

interface MyLoanResponse {
  success: boolean;
  data?: [];
  message?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-my-loan',
  styleUrl: './my-loan.component.css',
  templateUrl: './my-loan.component.html',
})
export class MyLoanComponent implements OnInit {
  private readonly api = inject(APIService);

  protected readonly loans = signal<LoanApplication[]>([]);
  protected readonly error = signal('');
  protected readonly loaded = signal(false);
  protected readonly user = signal<any>(null);

  constructor() {
  }

  ngOnInit(): void {
    this.loadLoans();
  }

  protected loadLoans(): void {
    this.error.set('');
    this.loaded.set(false);
    this.api.get<MyLoanResponse>('', 'loan/user/get-loan').subscribe({
      next: (response) => {
        if (!response.success || !Array.isArray(response.data)) {
          this.error.set(response.message ?? 'Kunne ikke hente lånesøknadene dine.');
          this.loaded.set(true);
          return;
        }

        this.loans.set(response.data);
        this.loaded.set(true);
      },
      error: () => {
        this.error.set('Kunne ikke hente lånesøknadene dine. Prøv igjen.');
        this.loaded.set(true);
      },
    });
  }

  protected formatAmount(amount: number | string | undefined): string {
    const value = typeof amount === 'string' ? Number(amount) : amount;
    return typeof value === 'number' && Number.isFinite(value)
      ? new Intl.NumberFormat('nb-NO', {
          style: 'currency',
          currency: 'NOK',
          maximumFractionDigits: 0,
        }).format(value)
      : 'Ikke oppgitt';
  }

  protected formatValue(value: number | string | undefined, suffix = ''): string {
    return value !== undefined && value !== null && value !== '' ? `${value}${suffix}` : 'Ikke oppgitt';
  }

  protected hasValue(value: string | number | boolean | undefined): boolean {
    return value !== undefined && value !== null && value !== '';
  }

  protected formatBoolean(value: boolean | undefined): string {
    return value === true ? 'Ja' : 'Nei';
  }
}
