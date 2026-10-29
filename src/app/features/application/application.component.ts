import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
  protected readonly loanTypeTitle = signal('Boliglån');
  protected stepNames(): string[] {
    return this.applicantType() === 'private'
      ? ['Søkertype', 'Lånedetaljer', 'Gjeld', 'Se over og send inn']
      : ['Søkertype', 'Lånedetaljer', 'Gjeld og sikkerhet', 'Se over og send inn'];
  }
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
    co_applicants: this.formBuilder.array<FormGroup<{
      name: FormControl<string>;
      email: FormControl<string>;
      phone: FormControl<string>;
    }>>([]),
    companyName: [''],
    companyEmail: ['', Validators.email],
    companyPhone: [''],
    annualRevenue: [''],
    annualProfit: [''],
    accountingYear: [''],
    debt: this.formBuilder.array<FormGroup<{
      loan_type: FormControl<string>;
      balance: FormControl<number>;
    }>>([]),
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
    this.setLoanType(selectedLoanType);
    this.setNumericQueryParam('loanAmount', this.applicationForm.controls.loanAmount, 0);
    this.setNumericQueryParam('interest_rate', this.applicationForm.controls.interest_rate, 0);
    this.setNumericQueryParam('tenure', this.applicationForm.controls.tenure, 1);
    this.addDebt();
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

  protected coApplicants(): FormArray<FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    phone: FormControl<string>;
  }>> {
    return this.applicationForm.controls.co_applicants;
  }

  protected debts(): FormArray<FormGroup<{
    loan_type: FormControl<string>;
    balance: FormControl<number>;
  }>> {
    return this.applicationForm.controls.debt;
  }

  protected addCoApplicant(): void {
    this.coApplicants().push(
      this.formBuilder.nonNullable.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
      }),
    );
    this.hasCoApplicant.set(true);
    this.invalidFields.set([]);
  }

  protected toggleCoApplicants(): void {
    if (this.hasCoApplicant()) {
      this.coApplicants().clear();
      this.hasCoApplicant.set(false);
      this.invalidFields.set([]);
      return;
    }

    this.addCoApplicant();
  }

  protected removeCoApplicant(index: number): void {
    this.coApplicants().removeAt(index);
    this.hasCoApplicant.set(this.coApplicants().length > 0);
    this.invalidFields.set([]);
  }

  protected addDebt(): void {
    this.debts().push(
      this.formBuilder.nonNullable.group({
        loan_type: ['', Validators.required],
        balance: [0, Validators.min(0)],
      }),
    );
    this.invalidFields.set([]);
  }

  protected removeDebt(index: number): void {
    this.debts().removeAt(index);
    this.invalidFields.set([]);
  }

  protected selectLoanType(id: string): void {
    this.setLoanType(id);
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
      title: this.loanTypeTitle(),
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
      co_applicants: this.hasCoApplicant() ? formValue.co_applicants : [],
      companyName: formValue.companyName,
      companyEmail: formValue.companyEmail,
      companyPhone: formValue.companyPhone,
      annualRevenue: formValue.annualRevenue,
      annualProfit: formValue.annualProfit,
      accountingYear: formValue.accountingYear,
      debt: formValue.debt.filter((item) => item.loan_type !== ''),
      securityValue: formValue.securityValue,
      ...(this.applicantType() === 'company'
        ? { collateralType: this.collateralType() }
        : {}),
      termsAccepted: formValue.termsAccepted,
      privacyAccepted: formValue.privacyAccepted,
    };
    debugger;
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
    this.applicantType.set('private');
    this.applicationAudience.set('private');
    this.setLoanType('1');
    this.loanNumber.set('');
    this.submissionError.set('');
    this.isSubmitting.set(false);
    this.collateralType.set('2');
    this.coApplicants().clear();
    this.debts().clear();
    this.addDebt();
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

  protected debtTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      1: 'Billån',
      2: 'Boliglån',
      3: 'Fellesgjeld',
      4: 'Forbrukslån',
      5: 'Kausjonsansvar',
      6: 'Kredittkort',
      7: 'Studielån',
    };
    return labels[type] ?? '';
  }

  protected hasDebtEntries(): boolean {
    return this.debts().controls.some((debt) =>
      debt.controls.loan_type.value !== '' || debt.controls.balance.value > 0,
    );
  }

  private validateCurrentStep(): boolean {
    let requiredFields: string[] = [];
    const invalidFields: string[] = [];

    if (this.step() === 2) {
      requiredFields =
        this.applicantType() === 'private'
          ? ['loanAmount', 'tenure', 'fullName', 'email', 'phone', 'annualIncome', 'maritalStatus']
          : ['loanAmount', 'tenure', 'companyName', 'companyEmail', 'companyPhone', 'annualRevenue', 'annualProfit', 'accountingYear'];

      if (this.applicantType() === 'private' && this.hasCoApplicant()) {
        this.coApplicants().controls.forEach((applicant, index) => {
          for (const field of ['name', 'email', 'phone'] as const) {
            const control = applicant.controls[field];
            control.markAsTouched();
            if (control.invalid) {
              invalidFields.push(`co_applicants.${index}.${field}`);
            }
          }
        });
      }
    } else if (this.step() === 3) {
      this.debts().controls.forEach((debt, index) => {
        const hasLoanType = debt.controls.loan_type.value.trim().length > 0;
        const hasBalance = debt.controls.balance.value > 0;
        if (hasLoanType || hasBalance) {
          debt.controls.loan_type.markAsTouched();
          debt.controls.balance.markAsTouched();
          if (debt.controls.loan_type.invalid) {
            invalidFields.push(`debt.${index}.loan_type`);
          }
          if (!Number.isFinite(debt.controls.balance.value) || debt.controls.balance.value < 0) {
            invalidFields.push(`debt.${index}.balance`);
          }
        }
      });
      requiredFields = ['securityValue'];
    }
    const invalid = requiredFields.filter((name) => {
      const control = this.applicationForm.get(name);
      control?.markAsTouched();
      const value = control?.value;

      if (typeof value === 'string') {
        return value.trim().length === 0 || control?.invalid === true;
      }

      if (typeof value === 'number' || value === null) {
        return name === 'loanAmount' || name === 'tenure' || name === 'securityValue' ? value <= 0 : false;
      }

      return control?.invalid === true;
    });

    this.invalidFields.set([...invalid, ...invalidFields]);
    return invalid.length === 0 && invalidFields.length === 0;
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

   private setLoanType(id: string): void {
    const option = [...this.privateLoanTypes, ...this.companyLoanTypes].find((loanType) => loanType.id === id);
    if (!option) {
      throw new Error(`Unknown loan type: ${id}`);
    }

    this.loanType.set(id);
    this.loanTypeTitle.set(option.title);
    this.applicationForm.controls.loanType.setValue(id);
  }
}


// const submitLoanApplication = async (req, res) => {
//   let createdUser = null;
//   const createdCustomers = [];
//   let createdLoan = null;
//   let sendingWelcomeEmail = false;

//   try {
//     const data = req.body || {};
//     const applicantType = data.applicantType;
//     if (!['private', 'company'].includes(applicantType)) {
//       return res.status(400).json(failureApiResponse('applicantType must be private or company'));
//     }

//     if (data.termsAccepted !== true || data.privacyAccepted !== true) {
//       return res.status(400).json(failureApiResponse('Terms and privacy policy must be accepted'));
//     }

//     const applicant = applicantType === 'private'
//       ? { name: data.fullName, email: data.email, phone: data.phone }
//       : { name: data.companyName, email: data.companyEmail, phone: data.companyPhone };
//     const name = typeof applicant.name === 'string' ? applicant.name.trim() : '';
//     const email = typeof applicant.email === 'string' ? applicant.email.trim().toLowerCase() : '';
//     const phone = applicant.phone == null ? '' : String(applicant.phone).trim();
//     const loanType = typeof data.loanType === 'string' ? data.loanType.trim() : '';
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!name || !emailPattern.test(email) || !phone || !loanType) {
//       return res.status(400).json(failureApiResponse('Applicant name, valid email, phone, and loanType are required'));
//     }

//     const parseNumber = (value, field, fallback = 0) => {
//       if (value === undefined || value === null || value === '') return fallback;
//       const parsed = Number(value);
//       if (!Number.isFinite(parsed) || parsed < 0) {
//         throw new Error(`${field} must be a non-negative number`);
//       }
//       return parsed;
//     };

//     const loanAmount = parseNumber(data.loanAmount, 'loanAmount');
//     if (loanAmount <= 0) {
//       return res.status(400).json(failureApiResponse('loanAmount must be greater than zero'));
//     }
//     const annualIncome = applicantType === 'private'
//       ? parseNumber(data.annualIncome, 'annualIncome')
//       : 0;
//     const annualRevenue = applicantType === 'company'
//       ? parseNumber(data.annualRevenue, 'annualRevenue')
//       : undefined;
//     const annualProfit = applicantType === 'company'
//       ? parseNumber(data.annualProfit, 'annualProfit')
//       : undefined;
//     const existingDebt = parseNumber(data.existingDebt, 'existingDebt');
//     const securityValue = parseNumber(data.securityValue, 'securityValue');
//     const children = applicantType === 'private'
//       ? parseNumber(data.children, 'children')
//       : 0;
//     const cars = applicantType === 'private'
//       ? parseNumber(data.cars, 'cars')
//       : 0;

//     const coApplicantName = typeof data.coApplicantName === 'string'
//       ? data.coApplicantName.trim()
//       : '';
//     const coApplicantEmail = typeof data.coApplicantEmail === 'string'
//       ? data.coApplicantEmail.trim().toLowerCase()
//       : '';
//     const coApplicantPhone = data.coApplicantPhone == null
//       ? ''
//       : String(data.coApplicantPhone).trim();
//     const hasCoApplicant = Boolean(coApplicantName || coApplicantEmail || coApplicantPhone);
//     if (hasCoApplicant && (
//       !coApplicantName
//       || !emailPattern.test(coApplicantEmail)
//       || !coApplicantPhone
//       || coApplicantEmail === email
//     )) {
//       return res.status(400).json(failureApiResponse('Co-applicant name, valid email, and phone are required and must be distinct'));
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser && (existingUser.role !== 'USER' || existingUser.isActive === false)) {
//       return res.status(409).json(failureApiResponse('This email belongs to an account that cannot submit loan applications'));
//     }

//     let temporaryPassword;
//     let user = existingUser;
//     if (!user) {
//       temporaryPassword = crypto.randomBytes(18).toString('hex');
//       const [firstName, ...lastNameParts] = name.split(/\s+/);
//       user = await User.create({
//         firstName,
//         lastName: lastNameParts.join(' '),
//         email,
//         mobile: phone,
//         role: 'USER',
//         hashedPassword: getHashedPassword(temporaryPassword),
//       });
//       createdUser = user;
//     }

//     const findOrCreateCustomer = async (customerData) => {
//       const existing = customerData.email
//         ? await Customer.findOne({ email: customerData.email })
//         : null;
//       if (existing) return existing;
//       const customer = await Customer.create(customerData);
//       createdCustomers.push(customer);
//       return customer;
//     };

//     const customer = await findOrCreateCustomer({
//       name,
//       email,
//       phone,
//       role: 'subscriber',
//       createdBy: user._id,
//     });
//     let coApplicantCustomer = null;
//     if (hasCoApplicant) {
//       coApplicantCustomer = await findOrCreateCustomer({
//         name: coApplicantName,
//         email: coApplicantEmail,
//         phone: coApplicantPhone,
//         role: 'subscriber',
//         createdBy: user._id,
//       });
//     }

//     const loanNumber = await generateUniqueLoanNumber();
//     const loan = await Loan.create({
//       customer_id: customer._id,
//       customer_name: customer.name,
//       title: data.title || `Loan Application - ${loanNumber}`,
//       content: typeof data.description === 'string' ? data.description.trim() : '',
//       description: typeof data.description === 'string' ? data.description.trim() : '',
//       loan_number: loanNumber,
//       loan_amount: loanAmount,
//       loan_type: loanType,
//       tenure: data.tenure || 0,
//       interest_rate: data.interest_rate || 0,
//       applicant_type: applicantType,
//       monthly_income: annualIncome / 12,
//       yearly_income: annualIncome,
//       marital_status: applicantType === 'private' ? data.maritalStatus || '' : '',
//       number_of_children: children,
//       children_fullCustody: children,
//       number_of_cars: cars,
//       annual_revenue: annualRevenue,
//       annual_profit: annualProfit,
//       accounting_year: applicantType === 'company' ? data.accountingYear || '' : undefined,
//       security_value: securityValue,
//       mortgage: { value: securityValue,collateral_type: data.collateralType || '',},
//       debt: existingDebt > 0
//         ? [{ loan_type: data.debtType || 'other', balance: existingDebt }]
//         : [],
//       co_applicants: coApplicantCustomer
//         ? [{
//           customer_id: coApplicantCustomer._id,
//           customer_name: coApplicantCustomer.name,
//         }]
//         : [],
//       // existing_debt: existingDebt,
//       // debt_type: data.debtType || '',
//       // terms_accepted: true,
//       // privacy_accepted: true,
//       createdBy: user._id,
//       status: '0',
//     });
//     createdLoan = loan;

//     console.log(`Loan application submitted: ${loan._id} for user: ${user._id}`);
//     let welcomeEmailSent = user.isEmailSent === true;

//     if (createdUser) {
//         try {
//             await sendLoanApplicationWelcomeEmail(
//                 { name, email },
//                 temporaryPassword
//             );

//             await User.updateOne(
//                 { _id: user._id },
//                 { $set: { isEmailSent: true } }
//             );

//             welcomeEmailSent = true;

//             console.log(`Welcome email sent successfully to: ${email}`);
//         } catch (emailError) {
//             welcomeEmailSent = false;

//             logError(
//                 emailError,
//                 `Welcome email failed for user ${user._id}`
//             );

//             // Do not throw here.
//             // The loan application should remain saved.
//         }
//     }

//     return res.status(201).json(
//         successApiResponse({
//             loan,
//             customer_id: customer._id,
//             co_applicant_customer_id: coApplicantCustomer?._id || null,
//             user_id: user._id,
//             account_reused: !createdUser,
//             isEmailSent: welcomeEmailSent,
//         })
//     );
    
//   } catch (error) {
//     if (createdLoan) {
//       await Loan.deleteOne({ _id: createdLoan._id }).catch(cleanupError => {
//         logError(cleanupError, 'Unable to roll back submitted loan application');
//       });
//     }
//     if (createdCustomers.length) {
//       await Customer.deleteMany({ _id: { $in: createdCustomers.map(item => item._id) } }).catch(cleanupError => {
//         logError(cleanupError, 'Unable to roll back loan application customers');
//       });
//     }
//     if (createdUser) {
//       await User.deleteOne({ _id: createdUser._id }).catch(cleanupError => {
//         logError(cleanupError, 'Unable to roll back loan application user');
//       });
//     }

//     logError(error, 'Issue in submitting loan application');
//     if (error.name === 'ValidationError') {
//       return res.status(400).json(failureApiResponse(error.message));
//     }
//     if (error.code === 11000) {
//       return res.status(409).json(failureApiResponse('An account or customer with this email already exists'));
//     }
//     if (sendingWelcomeEmail) {
//       return res.status(502).json(failureApiResponse('Application could not be completed because account details could not be emailed'));
//     }
//     if (error.message?.endsWith('must be a non-negative number')) {
//       return res.status(400).json(failureApiResponse(error.message));
//     }
//     return res.status(500).json(failureApiResponse('Some error occurred'));
//   }
// };