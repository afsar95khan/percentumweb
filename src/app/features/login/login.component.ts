import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.component.css',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly loginError = signal('');

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.submitting()) {
      return;
    }

    this.loginError.set('');
    this.submitting.set(true);
    this.auth
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => {
        const token = response?.data?.access_token;
        if (!response?.success || typeof token !== 'string' || !token.trim()) {
            this.loginError.set('Innlogging mislyktes. Kontroller e-postadresse og passord.');
            return;
          }
          this.auth.saveToken(token);
          const user = response?.data;
          if (user) {
            this.auth.saveUser(user);
          }
          void this.router.navigateByUrl('/dashboard');
        },
        error: () => {
          this.loginError.set('Kunne ikke logge inn. Prøv igjen senere.');
        },
      });
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }
}
