import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StepperModule } from 'primeng/stepper';
import { ApplicationAudienceService } from '../../core/services/application-audience.service';

type ApplicantType = 'private' | 'company';
type CollateralType = 'property' | 'other';

interface ApplicationOption {
  icon: string;
  title: string;
  description: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StepperModule],
  selector: 'app-application',
  styleUrls: ['./application.component.css', './application-review.component.css'],
  templateUrl: './application.component.html',
})
export class ApplicationComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly applicationAudience = inject(ApplicationAudienceService);

  protected readonly step = signal(1);
  protected readonly highestStep = signal(1);
  protected readonly applicantType = signal<ApplicantType>(
    this.route.snapshot.queryParamMap.get('applicantType') === 'company' ? 'company' : 'private',
  );
  protected readonly collateralType = signal<CollateralType>('property');
  protected readonly hasCoApplicant = signal(false);
  protected readonly submissionUnavailable = signal(false);
  protected readonly invalidFields = signal<string[]>([]);

  protected readonly applicationForm = this.formBuilder.nonNullable.group({
    loanAmount: [0],
    purpose: [''],
    fullName: [''],
    email: ['', Validators.email],
    phone: [''],
    annualIncome: [''],
    maritalStatus: [''],
    children: [0],
    cars: [0],
    coApplicantName: [''],
    coApplicantEmail: ['', Validators.email],
    coApplicantPhone: [''],
    companyName: [''],
    companyEmail: ['', Validators.email],
    companyPhone: [''],
    annualRevenue: [''],
    annualProfit: [''],
    accountingYear: [''],
    existingDebt: [0],
    debtType: [''],
    securityValue: [0],
    termsAccepted: [false],
    privacyAccepted: [false],
  });

  protected readonly privateLoanTypes: ApplicationOption[] = [
    { icon: 'pi pi-home', title: 'Boliglån', description: 'Kjøp av ny bolig med konkurransedyktige renter' },
    { icon: 'pi pi-chart-line', title: 'Refinansiering eller', description: 'Refinansier din eksisterende gjeld for å oppnå bedre rente' },
    { icon: 'pi pi-money-bill', title: 'Forbrukslån', description: 'Lån uten å stille sikkerhet for ethvert personlig behov' },
  ];

  protected readonly companyLoanTypes: ApplicationOption[] = [
    { icon: 'pi pi-dollar', title: 'Kassekreditt', description: 'Lån til driftskapital' },
    { icon: 'pi pi-chart-line', title: 'Prosjektlån', description: 'Finansiering av et spesifikt bedriftsprosjekt' },
    { icon: 'pi pi-home', title: 'Eiendomslån', description: 'Finansiering av eiendomsportefølje' },
  ];

  protected readonly loanType = signal('Boliglån');
  protected readonly privateStepNames = ['Søkertype', 'Lånedetaljer', 'Gjeld og sikkerhet', 'Se over og send inn'];

  constructor() {
    const applicantType = this.route.snapshot.queryParamMap.get('applicantType');
    if (applicantType === 'company' || applicantType === 'private') {
      this.applicationAudience.set(applicantType === 'company' ? 'business' : 'private');
    }
  }

  protected options(): ApplicationOption[] {
    return this.applicantType() === 'private' ? this.privateLoanTypes : this.companyLoanTypes;
  }

  protected selectApplicantType(type: ApplicantType): void {
    this.applicantType.set(type);
    this.applicationAudience.set(type === 'private' ? 'private' : 'business');
    this.loanType.set(type === 'private' ? 'Boliglån' : 'Kassekreditt');
    this.invalidFields.set([]);
  }

  protected updateLoanAmount(event: Event): void {
    const amount = Number((event.target as HTMLInputElement).value);
    this.applicationForm.controls.loanAmount.setValue(amount);
  }

  protected updateCount(field: 'children' | 'cars', amount: number): void {
    const control = this.applicationForm.controls[field];
    control.setValue(Math.max(0, control.value + amount));
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(amount);
  }

  protected onStepperChange(value: number | undefined): void {
    if (value !== undefined && value >= 1 && value <= this.highestStep()) {
      this.step.set(value);
      this.invalidFields.set([]);
    }
  }

  protected nextStep(): void {
    if (!this.validateCurrentStep()) {
      return;
    }

    const next = Math.min(this.step() + 1, 4);
    this.highestStep.update((highest) => Math.max(highest, next));
    this.step.set(next);
    this.invalidFields.set([]);
  }

  protected previousStep(): void {
    this.step.update((current) => Math.max(1, current - 1));
    this.invalidFields.set([]);
  }

  protected editStep(step: number): void {
    this.step.set(step);
    this.invalidFields.set([]);
  }

  protected submitApplication(): void {
    const missing: string[] = [];
    if (!this.applicationForm.controls.termsAccepted.value) {
      missing.push('termsAccepted');
    }
    if (!this.applicationForm.controls.privacyAccepted.value) {
      missing.push('privacyAccepted');
    }

    this.invalidFields.set(missing);
    if (missing.length) {
      return;
    }

    this.submissionUnavailable.set(true);
  }

  protected startNewApplication(): void {
    this.applicationForm.reset();
    this.applicantType.set('private');
    this.applicationAudience.set('private');
    this.loanType.set('Boliglån');
    this.collateralType.set('property');
    this.hasCoApplicant.set(false);
    this.step.set(1);
    this.highestStep.set(1);
    this.invalidFields.set([]);
    this.submissionUnavailable.set(false);
  }

  protected hasError(field: string): boolean {
    return this.invalidFields().includes(field);
  }

  protected applicantLabel(): string {
    return this.applicantType() === 'private' ? 'Privat' : 'Bedrift';
  }

  protected maritalStatusLabel(): string {
    const labels: Record<string, string> = {
      cohabiting: 'Samboer',
      divorced: 'Skilt',
      married: 'Gift',
      single: 'Singel',
    };
    return labels[this.applicationForm.controls.maritalStatus.value] ?? '';
  }

  protected debtTypeLabel(): string {
    const labels: Record<string, string> = {
      'credit-card': 'Kredittkort',
      mortgage: 'Boliglån',
      none: 'Ingen eksisterende gjeld',
      other: 'Annen gjeld',
      consumer: 'Forbrukslån',
    };
    return labels[this.applicationForm.controls.debtType.value] ?? '';
  }

  private validateCurrentStep(): boolean {
    let requiredFields: string[] = [];

    if (this.step() === 2) {
      requiredFields =
        this.applicantType() === 'private'
          ? ['loanAmount', 'purpose', 'fullName', 'email', 'phone', 'annualIncome', 'maritalStatus']
          : ['loanAmount', 'purpose', 'companyName', 'companyEmail', 'companyPhone', 'annualRevenue', 'annualProfit', 'accountingYear'];

      if (this.applicantType() === 'private' && this.hasCoApplicant()) {
        requiredFields.push('coApplicantName', 'coApplicantEmail', 'coApplicantPhone');
      }
    } else if (this.step() === 3) {
      requiredFields = ['debtType', 'securityValue'];
    }

    const invalid = requiredFields.filter((name) => {
      const control = this.applicationForm.get(name);
      control?.markAsTouched();
      const value = control?.value;

      if (typeof value === 'string') {
        return value.trim().length === 0 || control?.invalid === true;
      }

      if (typeof value === 'number') {
        return name === 'loanAmount' || name === 'securityValue' ? value <= 0 : false;
      }

      return control?.invalid === true;
    });

    this.invalidFields.set(invalid);
    return invalid.length === 0;
  }
}
