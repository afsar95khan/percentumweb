import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BlogDetailComponent } from './blog-detail.component';

describe('BlogDetailComponent', () => {
  async function createComponent(slug: string) {
    const paramMap = convertToParamMap({ slug });
    await TestBed.configureTestingModule({
      imports: [BlogDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(paramMap),
            snapshot: { paramMap },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(BlogDetailComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('renders article content and all editorial sections for a valid slug', async () => {
    const fixture = await createComponent('lan-forklart');
    const element = fixture.nativeElement as HTMLElement;
    const summary = 'En praktisk introduksjon til lånetyper, vilkår og hva du bør tenke på før du søker.';

    expect(element.querySelector('.detail-intro h1')?.textContent).toContain('Lån forklart');
    expect(element.querySelector('.detail-intro p:not(.article-date)')?.textContent?.trim()).toBe(summary);
    expect(element.querySelectorAll('.topic-panel')).toHaveLength(2);
    expect(element.querySelector('.analysis-banner h2')?.textContent).toContain('Marked og analyse');
    expect(element.querySelector('.topic-suggestion h3')?.textContent).toContain('Har du forslag');
    expect(element.querySelector('.detail-hero-image')?.getAttribute('src')).toBe('/assets/about-workspace.png');
    expect(element.querySelector('.detail-hero-image')?.getAttribute('alt')).toContain('Lån forklart');
  });

  it('shows a not-found state for an unknown article slug', async () => {
    const fixture = await createComponent('ukjent-artikkel');
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.article-not-found h1')?.textContent).toContain('Artikkelen ble ikke funnet');
    expect(element.querySelector('.article-not-found a')?.getAttribute('href')).toBe('/blog');
  });
});
