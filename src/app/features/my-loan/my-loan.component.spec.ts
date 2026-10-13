import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { loadingInterceptor } from '../../core/interceptors/loading.interceptor';
import { MyLoanComponent } from './my-loan.component';

describe('MyLoanComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('access_token', 'loan-test-token');
    await TestBed.configureTestingModule({
      imports: [MyLoanComponent],
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

  it('loads and renders the current user loan applications', async () => {
    const fixture = TestBed.createComponent(MyLoanComponent);
    fixture.detectChanges();
    const request = httpTesting.expectOne(`${environment.apiUrl}/loan/user/get-loan`);

    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer loan-test-token');
    request.flush({
      success: true,
      data: {
        loan: [
          {
            loan_number: 'LOAN-1001',
            applicantType: 'private',
            loanType: 'Boliglån',
            loanAmount: 2500000,
            interest_rate: 5.5,
            tenure: 20,
            fullName: 'Afsar Khan',
            email: 'afsar@example.com',
            phone: '8888881120',
            description: 'Kjøp av bolig',
          },
        ],
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.loan-card')).toHaveLength(1);
    expect(element.textContent).toContain('LOAN-1001');
    expect(element.textContent).toContain('Boliglån');
    expect(element.textContent).toContain('Afsar Khan');
    expect(element.textContent).toContain('afsar@example.com');
    expect(element.textContent).toContain('Kjøp av bolig');
  });
});
