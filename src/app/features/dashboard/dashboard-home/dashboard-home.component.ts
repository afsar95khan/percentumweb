import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DashboardItem {
  label: string;
  description: string;
  icon: string;
  route: string;
}

interface DashboardUser {
  firstName?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-dashboard-home',
  styleUrl: './dashboard-home.component.css',
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent {
  protected readonly user = signal<DashboardUser | null>(this.readUser());

  protected readonly items: DashboardItem[] = [
    {
      label: 'Oversikt',
      description: 'Se investeringene og aktivitetene dine',
      icon: 'pi pi-th-large',
      route: '/dashboard/overview',
    },
    {
      label: 'Meldinger',
      description: 'Kontakt oss og følg opp henvendelser',
      icon: 'pi pi-comment',
      route: '/dashboard/messages',
    },
    {
      label: 'Min Profil',
      description: 'Se kontoopplysningene dine',
      icon: 'pi pi-user',
      route: '/dashboard/profile',
    },
    {
      label: 'Mine lån',
      description: 'Følg status på lånesøknadene dine',
      icon: 'pi pi-file',
      route: '/dashboard/loans',
    },
  ];

  private readUser(): DashboardUser | null {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return null;
    }

    try {
      const user: unknown = JSON.parse(storedUser);
      if (typeof user === 'object' && user !== null && 'firstName' in user) {
        return { firstName: typeof user.firstName === 'string' ? user.firstName : '' };
      }
    } catch {
      return null;
    }

    return null;
  }
}
