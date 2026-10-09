import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApplicationAudienceService } from '../../core/services/application-audience.service';
import { APIService } from '../../core/services/api.service';
import Swiper from 'swiper';
import { A11y, Keyboard } from 'swiper/modules';
import { catchError, map, of, Subject, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type Tab = 'privat' | 'bedrift';
type Icon = 'house' | 'card' | 'chart' | 'briefcase' | 'building' | 'project';

interface LoanCalculationRequest {
  loanAmount: number;
  years: number;
  nominalInterestRate: number;
  applicant: {
    taxable_income: number;
    tax_free_income: number;
  };
  co_applicants: any[];
  marital_status: any;
  children: {     
    full_custody: number;
    shared_custody: number;
  };
  mortgage: {
    form_of_living: number;
    size: number;
    property_value: number;
    additional_properties: number;
    rental_income: number;
  };
  expenses: {
    daycare: number;
    manual_adjustment: number;
    number_of_cars: number;
  };
  debt: any[];  
}

interface LoanCalculationBreakdown {
  totalLoanCost: number;
  monthlyPayment: number;
  effectiveRate: number;
}

interface LoanCalculationResponse {
  success: boolean;
  message?: string;
  data?: {
    breakdown?: Partial<LoanCalculationBreakdown>;
  };
}

interface LoanCard {
  title: string;
  text: string;
  icon: Icon;
}

const DATA: Record<Tab, LoanCard[]> = {
  privat: [
    {
      title: 'Boliglån',
      text: 'Få et boliglån som er tilpasset dine behov og økonomi. Vi hjelper deg med konkurransedyktige renter, fleksible vilkår og en trygg vei til ditt nye hjem.',
      icon: 'house',
    },
    {
      title: 'Forbrukslån',
      text: 'Enten du planlegger oppussing, kjøp av bil eller andre personlige prosjekter, kan et privatlån gi deg fleksibiliteten du trenger uten å stille sikkerhet.',
      icon: 'card',
    },
    {
      title: 'Refinansiering',
      text: 'Refinansier eksisterende lån og kreditter i én oversiktlig løsning. Oppnå bedre kontroll over økonomien og potensielt lavere månedlige utgifter.',
      icon: 'chart',
    },
  ],
  bedrift: [
    {
      title: 'Bedriftslån',
      text: 'Skaff finansiering til investeringer, drift eller ekspansjon. Våre bedriftslån gir virksomheten muligheten til å vokse med forutsigbare vilkår.',
      icon: 'briefcase',
    },
    {
      title: 'Næringseiendom',
      text: 'Vi hjelper bedrifter med finansiering av kjøp, utvikling eller refinansiering av næringseiendom. Få løsninger som støtter dine langsiktige mål.',
      icon: 'building',
    },
    {
      title: 'Prosjektfinansiering',
      text: 'Fra eiendomsutvikling til større prosjekter – vi tilbyr skreddersydde finansieringsløsninger som hjelper deg med å realisere dem effektivt.',
      icon: 'project',
    },
  ],
};

interface CustomerReview {
  name: string;
  company: string;
  initials: string;
  rating: number;
  text: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  selector: 'app-home',
  standalone: true,
  styleUrls: ['./home.component.css', './home.component.scss'],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(APIService);
  private readonly applicationAudience = inject(ApplicationAudienceService);
  protected readonly heroCustomerType = this.applicationAudience.selected;
  protected readonly financingCustomerType = signal<'private' | 'business'>('private');
  protected readonly loanAmount = signal(500000);
  protected readonly repaymentYears = signal(10);
  protected readonly interestRate = signal<number | null>(null);
  protected readonly loanCalculation = signal<LoanCalculationBreakdown | null>(null);
  protected readonly calculationError = signal<string | null>(null);
  protected readonly isCalculating = signal(false);
  protected readonly selectedFinancing = signal(0);
  protected readonly reviewPage = signal(0);
  private readonly calculationRequests = new Subject<LoanCalculationRequest>();


  // private readonly cdr = inject(ChangeDetectorRef);
  private readonly swiperHost = viewChild.required<ElementRef<HTMLElement>>('swiperHost');
  private swiper?: Swiper;

  readonly tab = signal<Tab>('privat');
  readonly cards = computed(() => DATA[this.tab()]);
  // Loop mode needs more slides than are visible, so each set is rendered twice.
  readonly slides = computed(() => [...this.cards(), ...this.cards()]);

  constructor() {
    this.calculationRequests.pipe(
      switchMap((request) => {
        this.isCalculating.set(true);
        this.loanCalculation.set(null);
        this.calculationError.set(null);
        return this.http.post<LoanCalculationResponse>(
          'http://localhost:7000/api/loan/calculator/calculate',
          request,
        ).pipe(
          map((response) => ({ response })),
          catchError(() => of({ error: 'Kunne ikke hente låneberegningen. Prøv igjen.' })),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((result) => {
      this.isCalculating.set(false);
      if ('error' in result) {
        this.calculationError.set(result.error);
        return;
      }

      const breakdown = result.response.data?.breakdown;
      if (
        !result.response.success
        || typeof breakdown?.totalLoanCost !== 'number'
        || typeof breakdown.monthlyPayment !== 'number'
        || typeof breakdown.effectiveRate !== 'number'
      ) {
        this.calculationError.set(result.response.message ?? 'Låneberegningen returnerte ugyldige data.');
        return;
      }

      this.loanCalculation.set({
        totalLoanCost: breakdown.totalLoanCost,
        monthlyPayment: breakdown.monthlyPayment,
        effectiveRate: breakdown.effectiveRate,
      });
    });
  }

  ngAfterViewInit(): void {
    this.initSwiper();
    this.requestLoanCalculation()
  }

  setTab(next: Tab): void {
    if (next === this.tab()) return;
    this.destroySwiper(); // removes loop clones before Angular re-renders slides
    this.tab.set(next);
    // this.cdr.detectChanges(); // render new slides now, then init
    this.initSwiper();
  }

  prev(): void {
    this.swiper?.slidePrev(600);
  }

  next(): void {
    this.swiper?.slideNext(600);
  }

  private initSwiper(): void {
    this.swiper = new Swiper(this.swiperHost().nativeElement, {
      modules: [Keyboard, A11y],
      loop: true,
      initialSlide: 0,
      centeredSlides: true,
      slidesPerView: 'auto',
      spaceBetween: 0,
      speed: 600,
      grabCursor: true,
      keyboard: { enabled: true },
    });
  }

  private destroySwiper(): void {
    this.swiper?.destroy(true, true);
    this.swiper = undefined;
  }

  ngOnDestroy(): void {
    this.destroySwiper();
  }


  protected readonly currentReviews: CustomerReview[][] = [
    [
      {
        name: 'Abhishek Sharma',
        company: 'Company (Canada)',
        initials: 'AS',
        rating: 5,
        text: 'Lorem ipsum dolor sit amet consectetur. Felis sit ac enim morbi commodo convallis morbi felis non. Sit amet molestie eget laoreet. Quis nec egestas turpis ut luctus.',
      },
      {
        name: 'Abhishek Sharma',
        company: 'Company (Canada)',
        initials: 'AS',
        rating: 5,
        text: 'Lorem ipsum dolor sit amet consectetur. Felis sit ac enim morbi commodo convallis morbi felis non. Sit amet molestie eget laoreet. Quis nec egestas turpis ut luctus.',
      },
    ],
    [
      {
        name: 'Maria Hansen',
        company: 'Privatkunde',
        initials: 'MH',
        rating: 5,
        text: 'Jeg fikk god hjelp gjennom hele prosessen. Rådgiveren forklarte alternativene tydelig og gjorde det enkelt å komme videre.',
      },
      {
        name: 'Jonas Berg',
        company: 'Bedriftskunde',
        initials: 'JB',
        rating: 5,
        text: 'Rask oppfølging og en ryddig prosess fra første samtale. Percentum fant en løsning som passet prosjektet vårt.',
      },
    ],
  ];

  protected readonly totalPayment = () =>
    this.loanAmount() + (this.loanCalculation()?.totalLoanCost ?? 0);

  protected readonly formatCurrency = (amount: number) =>
    new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(amount);

  protected requestLoanCalculation(): void {
    const nominalInterestRate = Math.max(this.interestRate() ?? 5.65, 0);

    this.calculationRequests.next({
      loanAmount: this.loanAmount(),
      years: this.repaymentYears(),
      nominalInterestRate,
      "applicant": {
        "taxable_income": 0,
        "tax_free_income": 0
      },
      "co_applicants": [],
      "marital_status": null,
      "children": {
        "full_custody": 0,
        "shared_custody": 0
      },
      "mortgage": {
        "form_of_living": 0,
        "size": 0,
        "property_value": 0,
        "additional_properties": 0,
        "rental_income": 0
      },
      "expenses": {
        "daycare": 0,
        "manual_adjustment": 0,
        "number_of_cars": 0
      },
      "debt": []

    });
  }

  protected readonly totalCost = () => this.loanCalculation()?.totalLoanCost;

  protected readonly monthlyPayment = () => this.loanCalculation()?.monthlyPayment;

  protected readonly effectiveRate = () => this.loanCalculation()?.effectiveRate.toFixed(2);

  protected rangeProgress(value: number, minimum: number, maximum: number): string {
    return `${((value - minimum) / (maximum - minimum)) * 100}%`;
  }
  protected setHeroCustomerType(type: 'private' | 'business'): void {
    this.applicationAudience.set(type);
  }

  protected moveReview(direction: -1 | 1): void {
    this.reviewPage.update((page) => (page + direction + this.currentReviews.length) % this.currentReviews.length);
  }
}
