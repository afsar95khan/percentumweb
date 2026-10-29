import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('acts as the parent outlet for dashboard pages', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('router-outlet')).toBeTruthy();
  });

  it('renders the four primary account destinations', async () => {
    const fixture = TestBed.createComponent(DashboardHomeComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Velkommen');
    expect(Array.from(element.querySelectorAll('.dashboard-tile h2')).map((heading) => heading.textContent?.trim())).toEqual([
      'Oversikt',
      'Meldinger',
      'Min Profil',
      'Mine lån',
    ]);
    expect(element.querySelectorAll('.dashboard-tile')).toHaveLength(4);
  });
});
