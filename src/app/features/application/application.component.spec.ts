import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ApplicationComponent } from './application.component';

describe('ApplicationComponent', () => {
  let applicantType = 'private';

  beforeEach(async () => {
    applicantType = 'private';
    await TestBed.configureTestingModule({
      imports: [ApplicationComponent],
      providers: [
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
  });

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

  it('validates the private application flow and reports that submission is not connected', async () => {
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
    setValue('#loan-amount', '250000');
    setValue('#loan-purpose', 'Kjøp av bolig');
    setValue('#full-name', 'Ola Nordmann');
    setValue('#applicant-email', 'ola@example.com');
    setValue('#applicant-phone', '12345678');
    setValue('#annual-income', '600000');
    setValue('#marital-status', 'single', 'change');
    await clickNext();

    expect(element.querySelector('.panel-heading h2')?.textContent).toContain('Gjeld og sikkerhet');
    setValue('#debt-type', 'none', 'change');
    setValue('#security-value', '1800000');
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

    expect(element.querySelector('.success-panel h2')?.textContent).toContain('Søknaden er klar');
    expect(element.querySelector('.success-panel')?.textContent).toContain('Innsendingstjenesten er ikke koblet til');
    const referenceButton = element.querySelector<HTMLButtonElement>('.reference-button');
    expect(referenceButton?.textContent?.trim()).toBe('NC-3456-3566');
    expect(referenceButton?.disabled).toBe(true);
    expect(element.querySelectorAll('p-step.step-complete')).toHaveLength(3);
    expect(element.querySelectorAll('p-stepper-separator.step-complete')).toHaveLength(3);
  });
});
