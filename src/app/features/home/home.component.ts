import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApplicationAudienceService } from '../../core/services/application-audience.service';

interface FinancingOption {
  icon: string;
  title: string;
  description: string;
}

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
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly applicationAudience = inject(ApplicationAudienceService);
  protected readonly heroCustomerType = this.applicationAudience.selected;
  protected readonly financingCustomerType = signal<'private' | 'business'>('private');
  protected readonly loanAmount = signal(500000);
  protected readonly repaymentYears = signal(10);
  protected readonly interestRate = signal<number | null>(null);
  protected readonly selectedFinancing = signal(0);
  protected readonly reviewPage = signal(0);

  private readonly privateFinancing: FinancingOption[] = [
    {
      icon: 'pi pi-home',
      title: 'Boliglån',
      description: 'Få et boliglån som er tilpasset dine behov og din økonomi. Vi hjelper deg med en trygg vei til ditt nye hjem.',
    },
    {
      icon: 'pi pi-credit-card',
      title: 'Forbrukslån',
      description: 'Enten du planlegger oppussing, kjøp av bil eller andre personlige prosjekter, kan et privatlån gi deg fleksibiliteten du trenger uten å stille sikkerhet.',
    },
    {
      icon: 'pi pi-chart-line',
      title: 'Refinansiering',
      description: 'Refinansier eksisterende lån og kreditter i én oversiktlig løsning. Oppnå bedre kontroll over økonomien og potensielt lavere månedlige utgifter.',
    }
   
  ];

  private readonly businessFinancing: FinancingOption[] = [
    {
      icon: 'pi pi-briefcase',
      title: 'Bedriftslån',
      description: 'Skaff finansiering til investeringer, drift eller ekspansjon. Våre bedriftslån gir virksomheten muligheten til å vokse med forutsigbare vilkår.',
    },
    {
      icon: 'pi pi-building',
      title: 'Næringseiendom',
      description: 'Vi hjelper bedrifter med finansiering av kjøp, utvikling eller refinansiering av næringseiendom. Få løsninger som støtter dine langsiktige mål.',
    },
    {
      icon: 'pi pi-box',
      title: 'Prosjektfinansiering',
      description: 'Fra eiendomsutvikling til større prosjekter – vi tilbyr skreddersydde finansieringsløsninger som hjelper deg med å realisere planene dine effektivt.',
    },  
  ];

  protected readonly financingOptions = () =>
    this.financingCustomerType() === 'private' ? this.privateFinancing : this.businessFinancing;

  protected readonly visibleFinancingOptions = () => {
    const options = this.financingOptions();
    const selected = this.selectedFinancing();
    return [
      options[(selected + options.length - 1) % options.length],
      options[selected],
      options[(selected + 1) % options.length],
    ];
  };

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

  protected readonly monthlyPayment = () => {
    const principal = this.loanAmount();
    const monthlyRate = this.annualRate() / 100 / 12;
    const months = this.repaymentYears() * 12;
    if (monthlyRate === 0) {
      return Math.round(principal / months);
    }
    return Math.round((principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months)));
  };

  protected readonly totalPayment = () => this.monthlyPayment() * this.repaymentYears() * 12;

  protected readonly effectiveRate = () => {
    const monthlyRate = this.annualRate() / 100 / 12;
    return ((Math.pow(1 + monthlyRate, 12) - 1) * 100).toFixed(2);
  };

  protected readonly totalInterest = () => Math.max(this.totalPayment() - this.loanAmount(), 0);

  protected readonly formatCurrency = (amount: number) =>
    new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(amount);

  protected rangeProgress(value: number, minimum: number, maximum: number): string {
    return `${((value - minimum) / (maximum - minimum)) * 100}%`;
  }

  private annualRate(): number {
    return Math.max(this.interestRate() ?? 5.65, 0);
  }

  protected setHeroCustomerType(type: 'private' | 'business'): void {
    this.applicationAudience.set(type);
  }

  protected setFinancingCustomerType(type: 'private' | 'business'): void {
    this.financingCustomerType.set(type);
    this.selectedFinancing.set(0);
  }

  protected moveFinancing(direction: -1 | 1): void {
    const options = this.financingOptions();
    this.selectedFinancing.update((index) => (index + direction + options.length) % options.length);
  }

  protected moveReview(direction: -1 | 1): void {
    this.reviewPage.update((page) => (page + direction + this.currentReviews.length) % this.currentReviews.length);
  }
}
