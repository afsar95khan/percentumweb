import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaaCarousel } from './loaa-carousel';

describe('LoaaCarousel', () => {
  let component: LoaaCarousel;
  let fixture: ComponentFixture<LoaaCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaaCarousel],
    }).compileComponents();

    fixture = TestBed.createComponent(LoaaCarousel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
