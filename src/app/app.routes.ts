import { Routes } from '@angular/router';
import { AboutComponent } from './features/about/about.component';
import { BlogComponent } from './features/blog/blog.component';
import { BlogDetailComponent } from './features/blog-detail/blog-detail.component';
import { ContactComponent } from './features/contact/contact.component';
import { CrowdfundingComponent } from './features/crowdfunding/crowdfunding.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/login/login.component';
import { LoaaCarousel } from './features/loaa-carousel/loaa-carousel';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((module) => module.HomeComponent),
  },
  { path: 'about-us', component: AboutComponent },
  { path: 'contact-us', component: ContactComponent },
  {
    path: 'application',
    loadComponent: () =>
      import('./features/application/application.component').then((module) => module.ApplicationComponent),
  },
  { path: 'blog', component: BlogComponent },
  { path: 'blog/:slug', component: BlogDetailComponent },
  { path: 'crowdfunding', component: CrowdfundingComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'loan', component: LoaaCarousel },
  { path: '**', redirectTo: '' },
];
