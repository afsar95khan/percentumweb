import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ApplicationAudienceService } from '../../core/services/application-audience.service';
import { LayoutComponent } from './layout.component';

@Component({ template: '' })
class TestPageComponent {}

describe('LayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('passes the selected main audience to the header application link', async () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const applicationAudience = TestBed.inject(ApplicationAudienceService);

    expect(element.querySelector('.header-cta')?.getAttribute('href')).toBe('/application?applicantType=private');

    applicationAudience.set('business');
    fixture.detectChanges();

    expect(element.querySelector('.header-cta')?.getAttribute('href')).toBe('/application?applicantType=company');
  });

  it('highlights only the footer link matching the current route', async () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    const router = TestBed.inject(Router);
    router.resetConfig([
      { path: '', component: TestPageComponent },
      { path: 'contact-us', component: TestPageComponent },
    ]);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect([...element.querySelectorAll('.footer-links a.highlight')].map((link) => link.textContent?.trim())).toEqual(['Hjem']);

    await router.navigateByUrl('/contact-us');
    fixture.detectChanges();

    expect([...element.querySelectorAll('.footer-links a.highlight')].map((link) => link.textContent?.trim())).toEqual(['Kontakt']);
  });
});
