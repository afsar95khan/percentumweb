import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { loadingInterceptor } from '../../core/interceptors/loading.interceptor';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('access_token', 'profile-test-token');
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.removeItem('access_token');
  });

  it('loads and renders the authenticated user profile', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    const request = httpTesting.expectOne(`${environment.apiUrl}/user/me`);

    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer profile-test-token');
    request.flush({
      success: true,
      data: {
        firstName: 'Afsar',
        lastName: 'Khan',
        image: '',
        email: 'afsar@example.com',
        role: 'CUSTOMER',
        mobile: '8888881120',
        address: 'Main Street 1',
        city: 'Oslo',
        state: 'Oslo',
        zipCode: '0001',
        country: 'Norway',
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.profile-summary h2')?.textContent).toContain('Afsar Khan');
    expect(element.querySelector('.profile-avatar')?.textContent).toContain('AK');
    expect(element.textContent).toContain('afsar@example.com');
    expect(element.textContent).toContain('Main Street 1');
  });
});
