import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the loan calculator and home page sections', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('#calculator-title')?.textContent).toContain('Lånekalkulator');
    expect(element.querySelector('#financing-title')?.textContent).toContain('Velg finansiering som passer deg');
    expect(element.querySelector('.simple-process h2')?.textContent).toContain('Enkel søkeprosess');
    expect(element.querySelector('.reviews-heading h2')?.textContent).toContain('Fornøyde kunder i hele landet');
  });

  it('switches the hero copy when selecting Bedrift without changing the financing carousel', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const heroBusinessButton = fixture.nativeElement.querySelector(
      '.hero-copy .audience-toggle button:last-child',
    ) as HTMLButtonElement;
    heroBusinessButton.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.hero-copy h1')?.textContent).toContain('Få fart på veksten');
    expect(fixture.nativeElement.querySelector('.hero-points')?.textContent).toContain('Likviditetslån');
    expect(fixture.nativeElement.querySelector('.financing-card.is-active h3')?.textContent).toContain('Boliglån');
    expect(fixture.nativeElement.querySelector('.carousel-toggle button:first-child')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('switches financing cards independently of the hero audience switch', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const carouselBusinessButton = fixture.nativeElement.querySelector(
      '.carousel-toggle button:last-child',
    ) as HTMLButtonElement;
    carouselBusinessButton.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.financing-card.is-active h3')?.textContent).toContain('Bedriftslån');
    expect(fixture.nativeElement.querySelector('.hero-copy h1')?.textContent).toContain('Smarte finansiering');
    expect(fixture.nativeElement.querySelector('.hero-copy .audience-toggle button:first-child')?.getAttribute('aria-pressed')).toBe('true');

    fixture.nativeElement.querySelector('.financing-next').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.financing-card.is-active h3')?.textContent).toContain('Prosjektfinansiering');
  });

  it('uses the financing section switch to select its application type independently', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    const financingLink = () => element.querySelector('.card__cta')?.getAttribute('href');
    expect(financingLink()).toBe('/application?applicantType=private');

    const heroBusinessButton = element.querySelector(
      '.hero-copy .audience-toggle button:last-child',
    ) as HTMLButtonElement;
    heroBusinessButton.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('.hero-actions a')?.getAttribute('href')).toBe('/application?applicantType=company');
    expect(financingLink()).toBe('/application?applicantType=private');

    const financingBusinessButton = element.querySelector(
      '.finance .toggle__btn:last-child',
    ) as HTMLButtonElement;
    financingBusinessButton.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(financingLink()).toBe('/application?applicantType=company');
    expect(element.querySelector('.hero-actions a')?.getAttribute('href')).toBe('/application?applicantType=company');

    const financingPrivateButton = element.querySelector(
      '.finance .toggle__btn:first-child',
    ) as HTMLButtonElement;
    financingPrivateButton.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(financingLink()).toBe('/application?applicantType=private');
  });

  it('updates the loan amount and calculated monthly payment from the range slider', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const loanAmountInput = fixture.nativeElement.querySelector('#loan-amount') as HTMLInputElement;
    const initialPayment = fixture.nativeElement.querySelector('.calculation-summary div strong')?.textContent;
    loanAmountInput.value = '1000000';
    loanAmountInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.range-label span:last-child')?.textContent?.replace(/\u00a0/g, ' ')).toContain('1 000 000 kr');
    expect(fixture.nativeElement.querySelector('.calculation-summary div strong')?.textContent).not.toBe(initialPayment);
  });

  it('changes the visible customer reviews using the review controls', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.review-controls button:last-child').click();
    await fixture.whenStable();
    fixture.detectChanges();

    const visiblePage = fixture.nativeElement.querySelector('.review-page[aria-hidden="false"]') as HTMLElement;
    expect(visiblePage.querySelector('.review-details strong')?.textContent).toContain('Maria Hansen');
    expect(visiblePage.querySelectorAll('.review-card')).toHaveLength(2);
  });
});
