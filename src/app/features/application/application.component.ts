import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StepperModule } from 'primeng/stepper';
import { ApplicationAudienceService } from '../../core/services/application-audience.service';
import { APIService } from '../../core/services/api.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../core/services/toast.service';

type ApplicantType = 'private' | 'company';
type CollateralType = '2' | '1';

interface ApplicationOption {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StepperModule, InputNumberModule],
  selector: 'app-application',
  styleUrls: ['./application.component.css', './application-review.component.css'],
  templateUrl: './application.component.html',
})
export class ApplicationComponent {
  private toast = inject(ToastService);
  private readonly api = inject(APIService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly applicationAudience = inject(ApplicationAudienceService);

  protected readonly step = signal(1);
  protected readonly highestStep = signal(1);
  protected readonly applicantType = signal<ApplicantType>(
    this.route.snapshot.queryParamMap.get('applicantType') === 'company' ? 'company' : 'private',
  );
  protected readonly collateralType = signal<CollateralType>('2');
  protected readonly hasCoApplicant = signal(false);
  protected readonly submissionUnavailable = signal(false);
  protected readonly invalidFields = signal<string[]>([]);
  protected readonly loanType = signal('1');
  protected readonly privateStepNames = ['Søkertype', 'Lånedetaljer', 'Gjeld og sikkerhet', 'Se over og send inn'];
  protected readonly submissionComplete = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submissionError = signal('');
  protected readonly loanNumber = signal('');
  protected readonly applicationForm = this.formBuilder.nonNullable.group({
    applicantType: ['private'],
    loanType: ['1'],
    loanAmount: [0],
    interest_rate: [0],
    tenure: [0],
    description: [''],
    fullName: [''],
    email: ['', Validators.email],
    phone: [''],
    annualIncome: [0],
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
    { icon: 'pi pi-home', id: '1', title: 'Boliglån', description: 'Kjøp av ny bolig med konkurransedyktige renter' },
    { icon: 'pi pi-chart-line', id: '2', title: 'Refinansiering', description: 'Refinansier din eksisterende gjeld for å oppnå bedre rente' },
    { icon: 'pi pi-money-bill', id: '3', title: 'Forbrukslån', description: 'Lån uten å stille sikkerhet for ethvert personlig behov' },
  ];

  protected readonly companyLoanTypes: ApplicationOption[] = [
    { icon: 'pi pi-dollar', id: '4', title: 'Kassekreditt', description: 'Lån til driftskapital' },
    { icon: 'pi pi-chart-line', id: '5', title: 'Prosjektlån', description: 'Finansiering av et spesifikt bedriftsprosjekt' },
    { icon: 'pi pi-home', id: '6', title: 'Eiendomslån', description: 'Finansiering av eiendomsportefølje' },
  ];


// this.loanType.set(applicantType === 'private' ? 'Boliglån' : 'Kassekreditt');
  // constructor() {
  //   const applicantType = this.route.snapshot.queryParamMap.get('applicantType');
  //   const normalizedApplicantType = applicantType === 'company' ? 'company' : 'private';

  //   if (applicantType === 'company' || applicantType === 'private') {
  //     this.applicationAudience.set(applicantType === 'company' ? 'business' : 'private');
  //     this.applicantType.set(normalizedApplicantType);
  //     this.applicationForm.controls.applicantType.setValue(normalizedApplicantType);
  //   }

  //   const selectedLoanType = normalizedApplicantType === 'private' ? 'Boliglån' : 'Kassekreditt';
  //   this.loanType.set(selectedLoanType);
  //   this.applicationForm.controls.loanType.setValue(selectedLoanType);
  // }

  constructor() {
    const applicantType = this.route.snapshot.queryParamMap.get('applicantType');
    const queryLoanType = this.route.snapshot.queryParamMap.get('loanType');
    const validLoanType = queryLoanType !== null && /^[1-6]$/.test(queryLoanType)
      ? queryLoanType
      : null;
    const normalizedApplicantType = validLoanType !== null
      ? (Number(validLoanType) <= 3 ? 'private' : 'company')
      : applicantType === 'company' ? 'company' : 'private';

    if (validLoanType !== null || applicantType === 'company' || applicantType === 'private') {
      this.applicationAudience.set(normalizedApplicantType === 'company' ? 'business' : 'private');
    }
    this.applicantType.set(normalizedApplicantType);
    this.applicationForm.controls.applicantType.setValue(normalizedApplicantType);

    const selectedLoanType = validLoanType ?? (normalizedApplicantType === 'private' ? '1' : '4');
    this.loanType.set(selectedLoanType);
    this.applicationForm.controls.loanType.setValue(selectedLoanType);

    this.setNumericQueryParam('loanAmount', this.applicationForm.controls.loanAmount, 0);
    this.setNumericQueryParam('interest_rate', this.applicationForm.controls.interest_rate, 0);
    this.setNumericQueryParam('tenure', this.applicationForm.controls.tenure, 1);
  }
  
  ngOnInit() {

  }

  protected options(): ApplicationOption[] {
    return this.applicantType() === 'private' ? this.privateLoanTypes : this.companyLoanTypes;
  }

  protected selectApplicantType(type: ApplicantType): void {
    this.applicantType.set(type);
    this.applicationForm.controls.applicantType.setValue(type);
    this.applicationAudience.set(type === 'private' ? 'private' : 'business');

    const selectedLoanType = type === 'private' ? '1' : '4';
    this.loanType.set(selectedLoanType);
    this.applicationForm.controls.loanType.setValue(selectedLoanType);
    this.invalidFields.set([]);
  }

  protected selectLoanType(id: string): void {
    this.loanType.set(id);
    this.applicationForm.controls.loanType.setValue(id);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (this.isSubmitting()) {
      return;
    }
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

    const formValue = this.applicationForm.getRawValue();
    const payload = {
      applicantType: formValue.applicantType,
      loanType: formValue.loanType,
      loanAmount: formValue.loanAmount,
      interest_rate: formValue.interest_rate,
      tenure: formValue.tenure,
      description: formValue.description,
      fullName: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      annualIncome: formValue.annualIncome,
      maritalStatus: formValue.maritalStatus,
      children: formValue.children,
      cars: formValue.cars,
      coApplicantName: formValue.coApplicantName,
      coApplicantEmail: formValue.coApplicantEmail,
      coApplicantPhone: formValue.coApplicantPhone,
      companyName: formValue.companyName,
      companyEmail: formValue.companyEmail,
      companyPhone: formValue.companyPhone,
      annualRevenue: formValue.annualRevenue,
      annualProfit: formValue.annualProfit,
      accountingYear: formValue.accountingYear,
      existingDebt: formValue.existingDebt,
      debtType: formValue.debtType,
      securityValue: formValue.securityValue,
      collateralType: this.collateralType(),
      termsAccepted: formValue.termsAccepted,
      privacyAccepted: formValue.privacyAccepted,
    };
    this.isSubmitting.set(true);
    this.submissionError.set('');
    this.api.post(payload, 'loan/user/add-loan').subscribe({
      next: (response:any) => {
        this.isSubmitting.set(false);
        const loanNumber = response?.data?.loan?.loan_number;
        if (typeof loanNumber !== 'string' || loanNumber.length === 0) {
          this.submissionError.set(response.message ?? 'Søknaden ble opprettet, men svaret manglet lånenummer.');
          return;
        }

        this.loanNumber.set(loanNumber);
        this.submissionComplete.set(true);
        this.toast.success('Suksess', 'Søknaden er sendt inn!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.toast.error('Error', typeof error?.error?.message?.message === 'string' ? error.error.message : 'Det oppstod en feil under innlogging.');
        this.submissionError.set(
          error instanceof HttpErrorResponse && typeof error.error?.message === 'string'
            ? error.error.message
            : 'Kunne ikke sende søknaden. Prøv igjen.',
        );
      },
    });
  }

  protected startNewApplication(): void {
    this.applicationForm.reset();
    this.applicationForm.controls.applicantType.setValue('private');
    this.applicationForm.controls.loanType.setValue('1');
    this.applicantType.set('private');
    this.applicationAudience.set('private');
    this.loanType.set('1');
    this.loanNumber.set('');
    this.submissionError.set('');
    this.isSubmitting.set(false);
    this.collateralType.set('2');
    this.hasCoApplicant.set(false);
    this.step.set(1);
    this.highestStep.set(1);
    this.invalidFields.set([]);
    this.submissionComplete.set(false);
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
      1: 'Billån',
      2: 'Boliglån',
      3: 'Fellesgjeld',
      4: 'Forbrukslån',
      5: 'Kausjonsansvar',     
      6: 'Kredittkort',
      7: 'Studielån',
    };
    return labels[this.applicationForm.controls.debtType.value] ?? '';
  }

  private validateCurrentStep(): boolean {
    let requiredFields: string[] = [];

    if (this.step() === 2) {
      requiredFields =
        this.applicantType() === 'private'
          ? ['loanAmount', 'description', 'fullName', 'email', 'phone', 'annualIncome', 'maritalStatus']
          : ['loanAmount', 'description', 'companyName', 'companyEmail', 'companyPhone', 'annualRevenue', 'annualProfit', 'accountingYear'];

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

  private setNumericQueryParam(
    name: string,
    control: FormControl<number>,
    minimum: number,
  ): void {
    const value = this.route.snapshot.queryParamMap.get(name);
    if (value === null || value.trim() === '') {
      return;
    }

    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue) && parsedValue >= minimum) {
      control.setValue(parsedValue);
    }
  }
}
