import { TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  it('renders the company profile sections and supplied photos', async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AboutComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Registrert finansagentforetak');
    expect(element.querySelector('.business-areas h2')?.textContent).toContain('virksomhetsområder');
    expect(element.querySelector('.methodology h2')?.textContent).toContain('Arbeidsmetodikk');
    expect(element.querySelector('.contact-option[href="mailto:ks@percentum.no"]')).toBeTruthy();
    expect([...element.querySelectorAll('img')].map((image) => image.getAttribute('src'))).toEqual([
      '/assets/about-workspace.png',
      '/assets/about-crowdfunding.png',
      '/assets/about-meeting.png',
    ]);
  });
});
