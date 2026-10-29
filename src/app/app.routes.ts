import { Routes } from '@angular/router';
import { AboutComponent } from './features/about/about.component';
import { BlogComponent } from './features/blog/blog.component';
import { BlogDetailComponent } from './features/blog-detail/blog-detail.component';
import { ContactComponent } from './features/contact/contact.component';
import { CrowdfundingComponent } from './features/crowdfunding/crowdfunding.component';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/login/login.component';
import { LoaaCarousel } from './features/loaa-carousel/loaa-carousel';
import { MyLoanComponent } from './features/my-loan/my-loan.component';
import { ProfileComponent } from './features/profile/profile.component';
import { DashboardInvestmentsComponent } from './features/dashboard/dashboard-investments/dashboard-investments.component';
import { DashboardMessagesComponent } from './features/dashboard/dashboard-messages/dashboard-messages.component';
import { DashboardOverviewComponent } from './features/dashboard/dashboard-overview/dashboard-overview.component';
import { DashboardSummaryComponent } from './features/dashboard/dashboard-summary/dashboard-summary.component';
import { DashboardTransactionsComponent } from './features/dashboard/dashboard-transactions/dashboard-transactions.component';

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
    {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard-home/dashboard-home.component').then((module) => module.DashboardHomeComponent),
      },
      {
        path: 'overview',
        component: DashboardOverviewComponent,
        children: [
          { path: '', component: DashboardSummaryComponent },
          { path: 'investere', component: DashboardInvestmentsComponent },
          { path: 'transaksjoner', component: DashboardTransactionsComponent },
        ],
      },
      { path: 'messages', component: DashboardMessagesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'loans', component: MyLoanComponent },
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: 'loan', component: LoaaCarousel },
  {
    path: 'chart',
    loadComponent: () =>
      import('./features/custom3d-chart/custom3d-chart').then((module) => module.Custom3dChart),
  },
  { path: '**', redirectTo: '' },
];
