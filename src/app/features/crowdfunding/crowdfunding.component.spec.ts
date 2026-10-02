import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CrowdfundingComponent } from './crowdfunding.component';

describe('CrowdfundingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrowdfundingComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the investment overview, return comparison, and prospect cards', async () => {
    const fixture = TestBed.createComponent(CrowdfundingComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Invester i eiendom');
    expect(element.querySelectorAll('.chart-column')).toHaveLength(4);
    expect(element.querySelectorAll('.prospect-card')).toHaveLength(3);
  });

  it('shows project funding progress accessibly', async () => {
    const fixture = TestBed.createComponent(CrowdfundingComponent);
    await fixture.whenStable();

    const progress = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(progress.getAttribute('aria-valuenow')).toBe('80');
  });
});
