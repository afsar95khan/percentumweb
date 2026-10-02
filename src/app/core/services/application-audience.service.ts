import { Injectable, signal } from '@angular/core';

export type ApplicationAudience = 'private' | 'business';

@Injectable({ providedIn: 'root' })
export class ApplicationAudienceService {
  private readonly audience = signal<ApplicationAudience>('private');
  readonly selected = this.audience.asReadonly();

  set(audience: ApplicationAudience): void {
    this.audience.set(audience);
  }
}
