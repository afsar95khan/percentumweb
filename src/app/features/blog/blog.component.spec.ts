import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BlogComponent } from './blog.component';

describe('BlogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the blog hero and three rows of dynamic cards', async () => {
    const fixture = TestBed.createComponent(BlogComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.hero-copy h1')?.textContent).toContain('Innsikt som hjelper deg videre');
    expect(element.querySelectorAll('.blog-grid-page[aria-hidden="false"] .blog-card')).toHaveLength(9);
    expect(element.querySelectorAll('.blog-grid-page[aria-hidden="false"] .blog-card > img')).toHaveLength(9);
  });

  it('slides to the next set of blog posts', async () => {
    const fixture = TestBed.createComponent(BlogComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLButtonElement>('[aria-label="Neste innlegg"]')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('.blog-pagination span')?.textContent?.trim()).toBe('2 / 2');
    expect(element.querySelector('.blog-grid-page[aria-hidden="false"] .blog-card h3')?.textContent).toContain('Crowdfunding');
  });

  it('links each blog card to its matching detail route', async () => {
    const fixture = TestBed.createComponent(BlogComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.blog-card .read-more')?.getAttribute('href')).toBe('/blog/forstaelse-av-lanerenter');
  });
});
