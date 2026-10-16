import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { loadingInterceptor } from '../../core/interceptors/loading.interceptor';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let httpTesting: HttpTestingController;
  let router: Router;

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
    router = TestBed.inject(Router);
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

  it('posts the password change, logs out, and redirects home on success', async () => {
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    httpTesting.expectOne(`${environment.apiUrl}/user/me`).flush({
      success: true,
      data: {
        firstName: 'Afsar',
        lastName: 'Khan',
        image: '',
        email: 'afsar@example.com',
        role: 'CUSTOMER',
        mobile: '8888881120',
        address: null,
        city: null,
        state: null,
        zipCode: null,
        country: null,
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.change-password-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const setPassword = (id: string, value: string) => {
      const input = document.body.querySelector<HTMLInputElement>(`#${id}`);
      if (!input) {
        throw new Error(`Missing password field: ${id}`);
      }
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    setPassword('old-password', 'old-secret');
    setPassword('new-password', 'new-secret');
    setPassword('confirm-password', 'new-secret');
    fixture.detectChanges();
    (document.body.querySelector('.password-change-form') as HTMLFormElement).dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    const request = httpTesting.expectOne(`${environment.apiUrl}/user/change-password`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      oldPassword: 'old-secret',
      newPassword: 'new-secret',
    });
    expect(request.request.headers.has('Authorization')).toBe(true);
    request.flush({ success: true });
    await fixture.whenStable();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('does not submit when confirmation does not match the new password', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    httpTesting.expectOne(`${environment.apiUrl}/user/me`).flush({
      success: true,
      data: {
        firstName: 'Afsar',
        lastName: 'Khan',
        image: '',
        email: 'afsar@example.com',
        role: 'CUSTOMER',
        mobile: '8888881120',
        address: null,
        city: null,
        state: null,
        zipCode: null,
        country: null,
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.change-password-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    for (const [id, value] of [
      ['old-password', 'old-secret'],
      ['new-password', 'new-secret'],
      ['confirm-password', 'different-secret'],
    ]) {
      const input = document.body.querySelector<HTMLInputElement>(`#${id}`);
      if (!input) {
        throw new Error(`Missing password field: ${id}`);
      }
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    fixture.detectChanges();
    (document.body.querySelector('.password-change-form') as HTMLFormElement).dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(document.body.textContent).toContain('Passordene er ikke like.');
    httpTesting.expectNone(`${environment.apiUrl}/user/change-password`);
    expect(localStorage.getItem('access_token')).toBe('profile-test-token');
  });
});
