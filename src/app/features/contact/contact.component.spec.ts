import { TestBed } from '@angular/core/testing';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent],
    }).compileComponents();
  });

  it('renders the contact form and service promises', async () => {
    const fixture = TestBed.createComponent(ContactComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Kontakt');
    expect(element.querySelectorAll('.field-grid input')).toHaveLength(4);
    expect(element.querySelectorAll('.promise-card')).toHaveLength(3);
    expect(element.querySelector('.contact-method[href="tel:+4767791900"]')).toBeTruthy();
  });

  it('validates required fields and toggles the consultation request', async () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.submit-button').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.field-error')).toHaveLength(4);

    const toggle = fixture.nativeElement.querySelector('.consultation-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });
});
