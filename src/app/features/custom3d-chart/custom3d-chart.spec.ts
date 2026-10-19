import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Custom3dChart } from './custom3d-chart';

describe('Custom3dChart', () => {
  let component: Custom3dChart;
  let fixture: ComponentFixture<Custom3dChart>;

  beforeEach(async () => {
    vi.stubGlobal('ResizeObserver', class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    });

    await TestBed.configureTestingModule({
      imports: [Custom3dChart],
    }).compileComponents();

    fixture = TestBed.createComponent(Custom3dChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
