import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Prospect {
  company: string;
  title: string;
  loanAmount: string;
  netReturn: string;
  term: string;
  riskClass: string;
  progress: number;
  image: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-crowdfunding',
  styleUrl: './crowdfunding.component.css',
  templateUrl: './crowdfunding.component.html',
})
export class CrowdfundingComponent {
  protected readonly returnComparisons = [
    { label: 'DNB Fastrenteinnskudd', className: 'bar-navy' },
    { label: 'ODIN Rente', className: 'bar-green' },
    { label: 'Oslo Børs', className: 'bar-red' },
    { label: 'Crowdfunding', className: 'bar-gold' },
  ];

  protected readonly prospects: Prospect[] = Array.from({ length: 3 }, () => ({
    company: 'Oslo Flytte- og Renholdservice AS',
    title:
      'Oppføring av 20 leiligheter ved Krokstadelva i Mjøndalen med 75 % forhåndssalg i byggetrinn 1 – fase 13',
    loanAmount: '2 100 000 NOK',
    netReturn: '13,00 %',
    term: '8 mnd',
    riskClass: 'B',
    progress: 80,
    image: '/assets/about-workspace.png',
  }));
}
