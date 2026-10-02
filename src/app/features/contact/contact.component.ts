import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  selector: 'app-contact',
  styleUrl: './contact.component.css',
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly consultationRequested = signal(false);
  protected readonly submitted = signal(false);

  protected readonly contactForm = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    message: [''],
    consultation: [false],
  });

  protected submit(): void {
    this.submitted.set(true);
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
  }

  protected toggleConsultation(): void {
    this.consultationRequested.update((requested) => !requested);
    this.contactForm.controls.consultation.setValue(this.consultationRequested());
  }
}
