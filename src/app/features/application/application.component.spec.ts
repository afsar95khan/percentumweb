import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ApplicationComponent } from './application.component';

describe('ApplicationComponent', () => {
  let applicantType = 'private';
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    applicantType = 'private';
    await TestBed.configureTestingModule({
      imports: [ApplicationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => key === 'applicantType' ? applicantType : null,
              },
            },
          },
        },
      ],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('renders the private application start with PrimeNG stepper navigation', async () => {
    const fixture = TestBed.createComponent(ApplicationComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Start søknaden din her');
    expect(element.querySelectorAll('p-step')).toHaveLength(4);
    expect(element.querySelectorAll('.applicant-choices .choice-card')).toHaveLength(2);
    expect(element.querySelectorAll('.loan-choices .choice-card')).toHaveLength(3);
  });

  it('switches to the company loan options', async () => {
    const fixture = TestBed.createComponent(ApplicationComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLButtonElement>('.applicant-choices .choice-card:nth-child(2)')?.click();
    fixture.detectChanges();

    expect(element.querySelector('.applicant-choices .selected strong')?.textContent).toContain('BEDRIFT');
    expect(element.querySelector('.loan-choices')?.textContent).toContain('Kassekreditt');
    expect(element.querySelector('.loan-choices')?.textContent).toContain('Prosjektlån');
  });

  it('selects the company applicant type from the application route query parameter', async () => {
    applicantType = 'company';
    const fixture = TestBed.createComponent(ApplicationComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.applicant-choices .choice-card:nth-child(2)')?.classList.contains('selected')).toBe(true);
    expect(element.querySelector('.applicant-choices .choice-card:nth-child(2)')?.getAttribute('aria-pressed')).toBe('true');
    expect(element.querySelector('.loan-choices')?.textContent).toContain('Kassekreditt');
  });

  it('shows company-specific details in the second step', async () => {
    const fixture = TestBed.createComponent(ApplicationComponent);
    const element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('.applicant-choices .choice-card:nth-child(2)')?.click();
    element.querySelector<HTMLButtonElement>('.form-actions .primary-button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.querySelector('#company-name')).toBeTruthy();
    expect(element.querySelector('#annual-revenue')).toBeTruthy();
    expect(element.querySelector('#full-name')).toBeFalsy();
  });

  it('keeps applicants on the current step until required loan details are valid', async () => {
    const fixture = TestBed.createComponent(ApplicationComponent);
    const element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('.form-actions .primary-button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.querySelector('.panel-heading h2')?.textContent).toContain('Låneinformasjon');
    element.querySelector<HTMLButtonElement>('.form-actions .primary-button')?.click();
    fixture.detectChanges();

    expect(element.querySelector('.panel-heading h2')?.textContent).toContain('Låneinformasjon');
    expect(element.querySelector('.field-error')?.textContent).toContain('lånebeløp');
  });

  it('submits private co-applicant, debt, and security value data without collateral type', async () => {
    const fixture = TestBed.createComponent(ApplicationComponent);
    const element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    const setValue = (selector: string, value: string, eventName = 'input') => {
      const control = element.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector);
      if (!control) {
        throw new Error(`Missing form control: ${selector}`);
      }
      control.value = value;
      control.dispatchEvent(new Event(eventName, { bubbles: true }));
    };

    const clickNext = async () => {
      element.querySelector<HTMLButtonElement>('.form-actions .primary-button')?.click();
      fixture.detectChanges();
      await fixture.whenStable();
    };

    await clickNext();
    fixture.componentInstance['applicationForm'].controls.loanAmount.setValue(250000);
    setValue('#loan-tenure', '20');
    setValue('#loan-purpose', 'Kjøp av bolig');
    setValue('#full-name', 'Ola Nordmann');
    setValue('#applicant-email', 'ola@example.com');
    setValue('#applicant-phone', '12345678');
    fixture.componentInstance['applicationForm'].controls.annualIncome.setValue(600000);
    setValue('#marital-status', 'single', 'change');
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('.co-applicant-toggle')?.click();
    fixture.detectChanges();
    setValue('#co-applicant-name-0', 'Kari Nordmann');
    setValue('#co-applicant-email-0', 'kari@example.com');
    setValue('#co-applicant-phone-0', '87654321');
    element.querySelector<HTMLButtonElement>('[aria-labelledby="co-applicant-heading"] .repeat-add-button')?.click();
    fixture.detectChanges();
    setValue('#co-applicant-name-1', 'Per Nordmann');
    setValue('#co-applicant-email-1', 'per@example.com');
    setValue('#co-applicant-phone-1', '88776655');
    await clickNext();

    expect(element.querySelector('.panel-heading h2')?.textContent).toContain('Gjeld');
    expect(element.querySelector('#security-heading')?.textContent).toContain('Pantesikkerhet');
    expect(element.querySelector('#security-value')).toBeTruthy();
    expect(element.querySelectorAll('.collateral-choices .choice-card')).toHaveLength(0);
    setValue('#debt-type-0', '7', 'change');
    fixture.componentInstance['applicationForm'].controls.debt.at(0).controls.balance.setValue(10000);
    fixture.componentInstance['applicationForm'].controls.securityValue.setValue(500000);
    await clickNext();

    expect(element.querySelector('.panel-heading h2')?.textContent).toContain('Se over og send inn');
    const checkboxes = element.querySelectorAll<HTMLInputElement>('.consent-card input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('.submit-application')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const request = httpTesting.expectOne((candidate) => candidate.url.endsWith('/loan/user/add-loan'));
    expect(request.request.body.co_applicants).toEqual([
      { name: 'Kari Nordmann', email: 'kari@example.com', phone: '87654321' },
      { name: 'Per Nordmann', email: 'per@example.com', phone: '88776655' },
    ]);
    expect(request.request.body.debt).toEqual([{ loan_type: '7', balance: 10000 }]);
    expect(request.request.body.securityValue).toBe(500000);
    expect(request.request.body).not.toHaveProperty('collateralType');
    request.flush({ data: { loan: { loan_number: 'APP-1234' } } });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('.success-panel h2')?.textContent).toContain('Søknaden er sendt inn');
    expect(element.querySelector('.reference-button')?.textContent?.trim()).toBe('APP-1234');
    expect(element.querySelectorAll('p-step.step-complete')).toHaveLength(3);
    expect(element.querySelectorAll('p-stepper-separator.step-complete')).toHaveLength(3);
  });

  it('adds and removes multiple co-applicant rows', async () => {
    const fixture = TestBed.createComponent(ApplicationComponent);
    const element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('.form-actions .primary-button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const setValue = (selector: string, value: string, eventName = 'input') => {
      const control = element.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector);
      if (!control) {
        throw new Error(`Missing form control: ${selector}`);
      }
      control.value = value;
      control.dispatchEvent(new Event(eventName, { bubbles: true }));
    };
    fixture.componentInstance['applicationForm'].controls.loanAmount.setValue(250000);
    setValue('#loan-tenure', '20');
    setValue('#full-name', 'Ola Nordmann');
    setValue('#applicant-email', 'ola@example.com');
    setValue('#applicant-phone', '12345678');
    fixture.componentInstance['applicationForm'].controls.annualIncome.setValue(600000);
    setValue('#marital-status', 'single', 'change');
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('.co-applicant-toggle')?.click();
    fixture.detectChanges();

    expect(element.querySelectorAll('.co-applicant-row')).toHaveLength(1);
    expect(element.querySelector('.co-applicant-row .remove-row-button')).toBeFalsy();
    element.querySelector<HTMLButtonElement>('[aria-labelledby="co-applicant-heading"] .repeat-add-button')?.click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.co-applicant-row')).toHaveLength(2);
    expect(element.querySelector('.co-applicant-row .remove-row-button')).toBeTruthy();

    element.querySelector<HTMLButtonElement>('.co-applicant-row .remove-row-button')?.click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.co-applicant-row')).toHaveLength(1);
    expect(element.querySelector('.co-applicant-row .remove-row-button')).toBeFalsy();
  });

  it('allows existing debt rows to be added and removed', async () => {
    const fixture = TestBed.createComponent(ApplicationComponent);
    const element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('.form-actions .primary-button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const setValue = (selector: string, value: string, eventName = 'input') => {
      const control = element.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector);
      if (!control) {
        throw new Error(`Missing form control: ${selector}`);
      }
      control.value = value;
      control.dispatchEvent(new Event(eventName, { bubbles: true }));
    };
    fixture.componentInstance['applicationForm'].controls.loanAmount.setValue(250000);
    setValue('#loan-tenure', '20');
    setValue('#full-name', 'Ola Nordmann');
    setValue('#applicant-email', 'ola@example.com');
    setValue('#applicant-phone', '12345678');
    fixture.componentInstance['applicationForm'].controls.annualIncome.setValue(600000);
    setValue('#marital-status', 'single', 'change');
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('.form-actions .primary-button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element.querySelector('.panel-heading h2')?.textContent, Array.from(element.querySelectorAll('.field-error')).map((error) => error.textContent).join('; ')).toContain('Gjeld');
    expect(element.querySelectorAll('.debt-row')).toHaveLength(1);
    expect(element.querySelector('.debt-row .remove-row-button')).toBeFalsy();
    element.querySelector<HTMLButtonElement>('[aria-label="Legg til gjeld"]')?.click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.debt-row')).toHaveLength(2);
    expect(element.querySelector('.debt-row .remove-row-button')).toBeTruthy();

    element.querySelector<HTMLButtonElement>('.debt-row .remove-row-button')?.click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.debt-row')).toHaveLength(1);
    expect(element.querySelector('.debt-row .remove-row-button')).toBeFalsy();
  });

  it('keeps collateral options visible for company applicants', async () => {
    applicantType = 'company';
    const fixture = TestBed.createComponent(ApplicationComponent);
    const element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('.form-actions .primary-button')?.click();
    fixture.detectChanges();
    fixture.componentInstance['applicationForm'].controls.loanAmount.setValue(250000);
    fixture.componentInstance['applicationForm'].controls.tenure.setValue(20);
    fixture.componentInstance['applicationForm'].controls.companyName.setValue('Percentum AS');
    fixture.componentInstance['applicationForm'].controls.companyEmail.setValue('loan@example.com');
    fixture.componentInstance['applicationForm'].controls.companyPhone.setValue('12345678');
    fixture.componentInstance['applicationForm'].controls.annualRevenue.setValue('500000');
    fixture.componentInstance['applicationForm'].controls.annualProfit.setValue('100000');
    fixture.componentInstance['applicationForm'].controls.accountingYear.setValue('2025');
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('.form-actions .primary-button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.querySelector('.panel-heading h2')?.textContent).toContain('Gjeld og sikkerhet');
    expect(element.querySelectorAll('.collateral-choices .choice-card')).toHaveLength(2);
    expect(element.querySelector('#security-value')).toBeTruthy();
  });
});
