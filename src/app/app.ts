import { Component, signal } from '@angular/core';
import { LayoutComponent } from './features/layout/layout.component';
import { ToastModule } from 'primeng/toast';

@Component({
  imports: [LayoutComponent,ToastModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('percentumweb');
}
