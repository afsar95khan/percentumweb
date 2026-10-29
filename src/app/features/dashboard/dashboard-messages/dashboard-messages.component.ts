import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { APIService } from '../../../core/services/api.service';

interface Ticket {
  _id: string | number;
  subject: string;
  message: string;
  status?: string;
  ticket_number?: string;
  dateCreated?: string;
  lastUpdated?: string;
  lastMessage?: string;
  user?: {
    _id: string;
  };
}

interface TicketMessage {
  _id: string | number;
  message: string;
  dateCreated?: string;
  user?: {
    _id: string;
  };
}

interface TicketsResponse {
  success: boolean;
  data?: Ticket[];
  message?: string;
}

interface TicketResponse {
  success: boolean;
  data?: Ticket;
  message?: string;
}

interface MessagesResponse {
  success: boolean;
  data?: TicketMessage[];
  message?: string;
}

interface MessageResponse {
  success: boolean;
  data?: TicketMessage;
  message?: string;
}

const STATUS_LABELS: Record<string, string> = {
  3: 'Lukket',
  2: 'Pågår',
  1: 'Åpne',
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-dashboard-messages',
  styleUrl: './dashboard-messages.component.css',
  templateUrl: './dashboard-messages.component.html',
})
export class DashboardMessagesComponent implements OnInit {
  private readonly api = inject(APIService);
  private readonly formBuilder = inject(FormBuilder);
  private messagesRequestId = 0;

  protected readonly tickets = signal<Ticket[]>([]);
  protected readonly selectedTicket = signal<Ticket | null>(null);
  protected readonly messages = signal<TicketMessage[]>([]);
  protected readonly loadingTickets = signal(true);
  protected readonly loadingMessages = signal(false);
  protected readonly submittingTicket = signal(false);
  protected readonly sendingMessage = signal(false);
  protected readonly creatingTicket = signal(false);
  protected readonly ticketsError = signal('');
  protected readonly messagesError = signal('');
  protected readonly ticketFormError = signal('');
  protected readonly messageFormError = signal('');

  protected readonly ticketForm = this.formBuilder.nonNullable.group({
    subject: ['', [Validators.required, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.maxLength(4000)]],
  });

  protected readonly messageForm = this.formBuilder.nonNullable.group({
    message: ['', [Validators.required, Validators.maxLength(4000)]],
  });

  ngOnInit(): void {
    this.loadTickets();
  }

  protected loadTickets(): void {
    this.ticketsError.set('');
    this.loadingTickets.set(true);
    this.api
      .get<TicketsResponse>('', "ticket/get-tickets")
      .pipe(finalize(() => this.loadingTickets.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !Array.isArray(response.data)) {
            this.ticketsError.set(response.message ?? 'Kunne ikke hente ticket-listen din.');
            return;
          }
          this.tickets.set(response.data);
        },
        error: () => this.ticketsError.set('Kunne ikke hente ticket-listen din. Prøv igjen.'),
      });
  }

  protected selectTicket(ticket: Ticket): void {
    this.selectedTicket.set(ticket);
    this.messages.set([]);
    this.messagesError.set('');
    this.messageForm.reset();
    this.loadMessages(ticket);
  }

  protected backToTickets(): void {
    this.selectedTicket.set(null);
    this.messages.set([]);
    this.messagesError.set('');
    this.messagesRequestId += 1;
    this.loadingMessages.set(false);
  }

  protected loadMessages(ticket: Ticket): void {
    const requestId = ++this.messagesRequestId;
    this.messagesError.set('');
    this.loadingMessages.set(true);
    this.api
      .get<MessagesResponse>('', "ticket/get-messages/" + ticket._id)
      .pipe(
        finalize(() => {
          if (requestId === this.messagesRequestId) {
            this.loadingMessages.set(false);
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.messagesRequestId) {
            return;
          }
          if (!response.success || !Array.isArray(response.data)) {
            this.messagesError.set(response.message ?? 'Kunne ikke hente meldingene for denne ticketen.');
            return;
          }
          this.messages.set(response.data);
        },
        error: () => {
          if (requestId === this.messagesRequestId) {
            this.messagesError.set('Kunne ikke hente meldingene for denne ticketen. Prøv igjen.');
          }
        },
      });
  }

  protected submitTicket(): void {
    if (this.submittingTicket()) {
      return;
    }
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    const values = this.ticketForm.getRawValue();
    const payload = {
      subject: values.subject.trim(),
      message: values.message.trim(),
    };
    if (!payload.subject || !payload.message) {
      if (!payload.subject) {
        this.ticketForm.controls.subject.setErrors({ required: true });
      }
      if (!payload.message) {
        this.ticketForm.controls.message.setErrors({ required: true });
      }
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.ticketFormError.set('');
    this.submittingTicket.set(true);
    this.api
      .post<TicketResponse>(payload, 'ticket/add-ticket')
      .pipe(finalize(() => this.submittingTicket.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.ticketFormError.set(response.message ?? 'Kunne ikke opprette ticketen.');
            return;
          }
          const ticket = response.data;
          this.tickets.update((tickets) => [ticket, ...tickets]);
          this.ticketForm.reset({ subject: '', message: '' });
          this.creatingTicket.set(false);
          this.selectTicket(ticket);
        },
        error: () => this.ticketFormError.set('Kunne ikke opprette ticketen. Prøv igjen.'),
      });
  }

  protected submitMessage(): void {
    const ticket = this.selectedTicket();
    if (!ticket || this.sendingMessage()) {
      return;
    }
    if (this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    const message = this.messageForm.controls.message.value.trim();
    if (!message) {
      this.messageForm.controls.message.setErrors({ required: true });
      this.messageForm.controls.message.markAsTouched();
      return;
    }

    this.messageFormError.set('');
    this.sendingMessage.set(true);
    this.api
      .post<MessageResponse>({ message }, `ticket/send-message/${ticket._id}`)
      .pipe(finalize(() => this.sendingMessage.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.messageFormError.set(response.message ?? 'Kunne ikke sende meldingen.');
            return;
          }
          const sentMessage = response.data;
          this.messages.update((messages) => [...messages, sentMessage]);
          this.messageForm.reset();
          this.tickets.update((tickets) =>
            tickets.map((item) =>
              item._id === ticket._id
                ? { ...item, lastMessage: message, lastUpdated: new Date().toISOString() }
                : item,
            ),
          );
        },
        error: () => this.messageFormError.set('Kunne ikke sende meldingen. Prøv igjen.'),
      });
  }

  protected toggleTicketForm(): void {
    this.creatingTicket.update((creating) => !creating);
    this.ticketFormError.set('');
    if (this.creatingTicket()) {
      this.ticketForm.reset({ subject: '', message: '' });
    }
  }

  protected statusLabel(status: string | undefined): string {
    return STATUS_LABELS[status ?? ''] ?? 'Åpen';
  }

  protected isOwnMessage(message: TicketMessage): boolean {
    let userData = localStorage.getItem('user');
    let user = JSON.parse(userData || '{}');
    return message?.user?._id === user._id
  }

  protected formatDate(value: string | undefined): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat('nb-NO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }
}
