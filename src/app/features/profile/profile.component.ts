import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../core/services/auth.service';
import { APIService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

interface ChangePasswordResponse {
  success: boolean;
  data?: any;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  image: string;
  email: string;
  role: string;
  mobile: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
}

interface ProfileResponse {
  success: boolean;
  data?: UserProfile;
  message?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ReactiveFormsModule, RouterLink],
  selector: 'app-profile',
  styleUrl: './profile.component.css',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private toast = inject(ToastService);
  private readonly api = inject(APIService);
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly error = signal('');
  protected readonly changePasswordDialogVisible = signal(false);
  protected readonly changePasswordError = signal('');
  protected readonly changingPassword = signal(false);

  private readonly matchingPasswords: ValidatorFn = (control) => {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return confirmPassword && newPassword !== confirmPassword ? { passwordMismatch: true } : null;
  };

  protected readonly changePasswordForm = this.formBuilder.nonNullable.group(
    {
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.matchingPasswords },
  );

  ngOnInit(): void {
    this.loadProfile();
  }

  protected loadProfile(): void {
    this.error.set('');
    this.api.get<ProfileResponse>('', 'user/me').subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.error.set(response.message ?? 'Kunne ikke hente profilinformasjonen.');
          return;
        }

        this.profile.set(response.data);
      },
      error: () => this.error.set('Kunne ikke hente profilinformasjonen. Prøv igjen.'),
    });
  }

  protected displayName(profile: UserProfile): string {
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email;
  }

  protected initials(profile: UserProfile): string {
    const name = this.displayName(profile);
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  protected location(profile: UserProfile): string {
    return [profile.city, profile.state, profile.zipCode, profile.country]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(', ');
  }

  protected openChangePasswordDialog(): void {
    this.changePasswordError.set('');
    this.changePasswordForm.reset();
    this.changePasswordDialogVisible.set(true);
  }

  protected closeChangePasswordDialog(): void {
    if (this.changingPassword()) {
      return;
    }

    this.changePasswordDialogVisible.set(false);
    this.changePasswordError.set('');
    this.changePasswordForm.reset();
  }

  protected submitPasswordChange(): void {
    if (this.changingPassword()) {
      return;
    }

    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { oldPassword, newPassword } = this.changePasswordForm.getRawValue();
    this.changePasswordError.set('');
    this.changingPassword.set(true);

    this.api
      .patch({ oldPassword, newPassword }, 'user/change-password')
      .pipe(finalize(() => this.changingPassword.set(false)))
      .subscribe({
        next: (response:any) => {
          if (!response?.success) {
            this.changePasswordError.set(response?.message ?? 'Kunne ikke endre passordet. Prøv igjen.');
            return;
          }
          this.toast.success('Suksess', 'Passordet er endret');
          this.auth.logout();
          void this.router.navigateByUrl('/');
        },
        error: (error: unknown) => {
          this.changePasswordError.set(this.passwordChangeErrorMessage(error));
        },
      });
  }

  private passwordChangeErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const response = error.error;
      if (typeof response === 'object' && response !== null && 'message' in response) {
        const message = response.message;
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }
    }

    return 'Kunne ikke endre passordet. Kontroller det gamle passordet og prøv igjen.';
  }
}
