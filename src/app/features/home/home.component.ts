import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApplicationAudienceService } from '../../core/services/application-audience.service';
import { APIService } from '../../core/services/api.service';
import Swiper from 'swiper';
import { A11y, Keyboard } from 'swiper/modules';
import 'swiper/css';
import { catchError, map, of, Subject, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

type Tab = 'privat' | 'bedrift';
type Icon = 'house' | 'card' | 'chart' | 'briefcase' | 'building' | 'project';

interface LoanCalculationRequest {
  loanAmount: number;
  years: number;
  nominalInterestRate: number;
}

interface LoanCalculationBreakdown {
  totalLoanCost: number;
  monthlyPayment: number;
  effectiveRate: number;
  totalAmount:number;
  totalLoan: number,
}

interface LoanCalculationResponse {
  success: boolean;
  message?: string;
  data?:Partial<LoanCalculationBreakdown>;
}

interface LoanCard {
  id:string;
  title: string;
  text: string;
  icon: Icon;
}

const DATA: Record<Tab, LoanCard[]> = {
  privat: [
    {
      id:'1',
      title: 'Boliglån',
      text: 'Få et boliglån som er tilpasset dine behov og økonomi. Vi hjelper deg med konkurransedyktige renter, fleksible vilkår og en trygg vei til ditt nye hjem.',
      icon: 'house',
    },
    {
      id:'2',
      title: 'Refinansiering',
      text: 'Refinansier eksisterende lån og kreditter i én oversiktlig løsning. Oppnå bedre kontroll over økonomien og potensielt lavere månedlige utgifter.',
      icon: 'chart',
    },
    {
      id:'3',
      title: 'Forbrukslån',
      text: 'Enten du planlegger oppussing, kjøp av bil eller andre personlige prosjekter, kan et privatlån gi deg fleksibiliteten du trenger uten å stille sikkerhet.',
      icon: 'card',
    },

  ],
  bedrift: [
    {
      id:'4',
      title: 'Bedriftslån',
      text: 'Skaff finansiering til investeringer, drift eller ekspansjon. Våre bedriftslån gir virksomheten muligheten til å vokse med forutsigbare vilkår.',
      icon: 'briefcase',
    },
    {
      id:'5',
      title: 'Næringseiendom',
      text: 'Vi hjelper bedrifter med finansiering av kjøp, utvikling eller refinansiering av næringseiendom. Få løsninger som støtter dine langsiktige mål.',
      icon: 'building',
    },
    {
      id:'6',
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
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(APIService);
  private readonly applicationAudience = inject(ApplicationAudienceService);
  protected readonly heroCustomerType = this.applicationAudience.selected;
  protected readonly loanAmount = signal(500000);
  protected readonly repaymentYears = signal(10);
  protected readonly interestRate = signal<number | null>(null);
  protected readonly loanCalculation = signal<LoanCalculationBreakdown | null>(null);
  protected readonly calculationError = signal<string | null>(null);
  protected readonly isCalculating = signal(false);
  protected readonly selectedFinancing = signal(0);
  protected readonly reviewPage = signal(0);
  private readonly calculationRequests = new Subject<LoanCalculationRequest>();


  private readonly cdr = inject(ChangeDetectorRef);
  private readonly swiperHost = viewChild.required<ElementRef<HTMLElement>>('swiperHost');
  private readonly reviewSwiperHost = viewChild.required<ElementRef<HTMLElement>>('reviewSwiperHost');
  private swiper?: Swiper;
  private reviewSwiper?: Swiper;

  readonly tab = signal<Tab>('privat');
  readonly cards = computed(() => DATA[this.tab()]);
  // Loop mode needs more slides than are visible, so each set is rendered twice.
  readonly slides = computed(() => [...this.cards(), ...this.cards()]);

  constructor() {
    this.calculationRequests.pipe(
      switchMap((request) => {
        this.isCalculating.set(true);
        // this.loanCalculation.set(null);
        this.calculationError.set(null);
        return this.http.post<LoanCalculationResponse>(
          `${this.baseUrl}/loan/user/calculator/calculate`,
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

      const breakdown = result.response.data;
      if (
        !result.response.success
        || typeof breakdown?.totalLoanCost !== 'number'
        || typeof breakdown.monthlyPayment !== 'number'
        || typeof breakdown.effectiveRate !== 'number'
        || typeof breakdown.totalAmount !== 'number'
        || typeof breakdown.totalLoan !== 'number'
      ) {
        this.calculationError.set(result.response.message ?? 'Låneberegningen returnerte ugyldige data.');
        return;
      }

      this.loanCalculation.set({
        totalLoanCost: breakdown.totalLoanCost,
        monthlyPayment: breakdown.monthlyPayment,
        effectiveRate: breakdown.effectiveRate,
        totalAmount: breakdown.totalAmount,
        totalLoan: breakdown.totalLoan,
      });
    });
  }

  ngAfterViewInit(): void {
    this.initSwiper();
    this.initReviewSwiper();
    this.requestLoanCalculation()
  }

  setTab(next: Tab): void {
    if (next === this.tab()) return;
    this.destroySwiper(); // removes loop clones before Angular re-renders slides
    this.tab.set(next);
    this.cdr.detectChanges(); // render new slides now, then init
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

  protected moveReview(direction: -1 | 1): void {
    if (direction < 0) {
      this.reviewSwiper?.slidePrev();
      return;
    }

    this.reviewSwiper?.slideNext();
  }

  private initReviewSwiper(): void {
    this.reviewSwiper = new Swiper(this.reviewSwiperHost().nativeElement, {
      modules: [Keyboard, A11y],
      slidesPerView: 1,
      rewind: true,
      speed: 350,
      grabCursor: true,
      keyboard: { enabled: true },
      on: {
        slideChange: (swiper) => this.reviewPage.set(swiper.realIndex),
      },
    });
  }

  private destroyReviewSwiper(): void {
    this.reviewSwiper?.destroy(true, true);
    this.reviewSwiper = undefined;
  }

  ngOnDestroy(): void {
    this.destroySwiper();
    this.destroyReviewSwiper();
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

    });
  }

  protected readonly totalCost = () => this.loanCalculation()?.totalLoanCost;

  protected readonly monthlyPayment = () => this.loanCalculation()?.monthlyPayment;

  protected readonly effectiveRate = () => this.loanCalculation()?.effectiveRate.toFixed(2);
  protected readonly totalAmount = () => this.loanCalculation()?.totalAmount;
  protected readonly totalLoan = () => this.loanCalculation()?.totalLoan;

  protected rangeProgress(value: number, minimum: number, maximum: number): string {
    return `${((value - minimum) / (maximum - minimum)) * 100}%`;
  }
  protected setHeroCustomerType(type: 'private' | 'business'): void {
    this.applicationAudience.set(type);
  }

  
}
