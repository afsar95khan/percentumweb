import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import Swiper from 'swiper';
import { Keyboard, A11y } from 'swiper/modules';

import 'swiper/css';

type Tab = 'privat' | 'bedrift';
type Icon = 'house' | 'card' | 'chart' | 'briefcase' | 'building' | 'project';

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

@Component({
  selector: 'app-loaa-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loaa-carousel.html',
  styleUrl: './loaa-carousel.scss',
})
export class LoaaCarousel implements AfterViewInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly swiperHost = viewChild.required<ElementRef<HTMLElement>>('swiperHost');
  private swiper?: Swiper;

  readonly tab = signal<Tab>('privat');
  readonly cards = computed(() => DATA[this.tab()]);
  // Loop mode needs more slides than are visible, so each set is rendered twice.
  readonly slides = computed(() => [...this.cards(), ...this.cards()]);

  ngAfterViewInit(): void {
    this.initSwiper();
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

  ngOnDestroy(): void {
    this.destroySwiper();
  }
}