import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-about',
  styleUrl: './about.component.css',
  templateUrl: './about.component.html',
})
export class AboutComponent {}
