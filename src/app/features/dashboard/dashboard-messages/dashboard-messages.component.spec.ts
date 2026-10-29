import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DashboardMessagesComponent } from './dashboard-messages.component';

describe('DashboardMessagesComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMessagesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('loads the ticket list and opens a ticket conversation', async () => {
    const fixture = TestBed.createComponent(DashboardMessagesComponent);
    fixture.detectChanges();

    const ticketsRequest = httpTesting.expectOne(`${environment.apiUrl}/support/tickets`);
    expect(ticketsRequest.request.method).toBe('GET');
    ticketsRequest.flush({
      success: true,
      data: [{ id: 'T-42', subject: 'Spørsmål om søknaden', status: 'open', lastMessage: 'Takk for hjelpen' }],
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const ticketButton = fixture.nativeElement.querySelector('.ticket-item') as HTMLButtonElement;
    expect(ticketButton.textContent).toContain('Spørsmål om søknaden');
    ticketButton.click();
    fixture.detectChanges();

    const messagesRequest = httpTesting.expectOne(`${environment.apiUrl}/support/tickets/T-42/messages`);
    expect(messagesRequest.request.method).toBe('GET');
    messagesRequest.flush({
      success: true,
      data: [
        { id: 1, content: 'Hei, hvordan går søknaden?', sender: 'user' },
        { id: 2, content: 'Vi ser på den nå.', sender: 'admin' },
      ],
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.conversation-title h2')?.textContent).toContain('Spørsmål om søknaden');
    expect(element.querySelectorAll('.message-row')).toHaveLength(2);
    expect(element.textContent).toContain('Vi ser på den nå.');

    const reply = element.querySelector('#reply-message') as HTMLTextAreaElement;
    reply.value = 'Takk for oppdateringen.';
    reply.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (element.querySelector('.reply-form button[type="submit"]') as HTMLButtonElement).click();

    const replyRequest = httpTesting.expectOne(`${environment.apiUrl}/support/tickets/T-42/messages`);
    expect(replyRequest.request.method).toBe('POST');
    expect(replyRequest.request.body).toEqual({ message: 'Takk for oppdateringen.' });
    replyRequest.flush({
      success: true,
      data: { id: 3, content: 'Takk for oppdateringen.', sender: 'user' },
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Takk for oppdateringen.');
  });

  it('creates a ticket and opens its conversation', async () => {
    const fixture = TestBed.createComponent(DashboardMessagesComponent);
    fixture.detectChanges();
    httpTesting.expectOne(`${environment.apiUrl}/support/tickets`).flush({ success: true, data: [] });
    await fixture.whenStable();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.new-ticket-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const subject = fixture.nativeElement.querySelector('#ticket-subject') as HTMLInputElement;
    subject.value = 'Hjelp med konto';
    subject.dispatchEvent(new Event('input'));
    const message = fixture.nativeElement.querySelector('#ticket-description') as HTMLTextAreaElement;
    message.value = 'Jeg trenger hjelp med kontoen min.';
    message.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.form-actions button[type="submit"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const createRequest = httpTesting.expectOne(`${environment.apiUrl}/support/tickets`);
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({
      subject: 'Hjelp med konto',
      message: 'Jeg trenger hjelp med kontoen min.',
    });
    createRequest.flush({
      success: true,
      data: { id: 'T-43', subject: 'Hjelp med konto', status: 'open' },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const conversationRequest = httpTesting.expectOne(`${environment.apiUrl}/support/tickets/T-43/messages`);
    expect(conversationRequest.request.method).toBe('GET');
    conversationRequest.flush({ success: true, data: [] });
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.conversation-title h2')?.textContent).toContain(
      'Hjelp med konto',
    );
  });

  it('shows an empty state without rendering placeholder tickets or messages', async () => {
    const fixture = TestBed.createComponent(DashboardMessagesComponent);
    fixture.detectChanges();

    httpTesting.expectOne(`${environment.apiUrl}/support/tickets`).flush({ success: true, data: [] });
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.ticket-item')).toHaveLength(0);
    expect(element.textContent).toContain('Ingen tickets ennå');
    expect(element.textContent).not.toContain('T-42');
    expect(element.textContent).not.toContain('T-43');

    const newTicketButton = element.querySelector('.new-ticket-button') as HTMLButtonElement;
    newTicketButton.click();
    fixture.detectChanges();
    const subject = element.querySelector('#ticket-subject') as HTMLInputElement;
    subject.value = 'Spørsmål';
    subject.dispatchEvent(new Event('input'));
    const message = element.querySelector('#ticket-description') as HTMLTextAreaElement;
    message.value = 'Testmelding';
    message.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (element.querySelector('.form-actions button[type="submit"]') as HTMLButtonElement).click();

    const createRequest = httpTesting.expectOne(`${environment.apiUrl}/support/tickets`);
    createRequest.flush({
      success: true,
      data: { id: 'T-44', subject: 'Spørsmål', status: 'open' },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    httpTesting.expectOne(`${environment.apiUrl}/support/tickets/T-44/messages`).flush({ success: true, data: [] });
    await fixture.whenStable();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.message-row')).toHaveLength(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Start samtalen');
  });

  it('shows an error instead of placeholder tickets when the API returns no ticket data', async () => {
    const fixture = TestBed.createComponent(DashboardMessagesComponent);
    fixture.detectChanges();

    httpTesting.expectOne(`${environment.apiUrl}/support/tickets`).flush({ success: true });
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.ticket-item')).toHaveLength(0);
    expect(element.querySelectorAll('.message-row')).toHaveLength(0);
    expect(element.textContent).toContain('Kunne ikke hente ticket-listen din.');
    expect(element.textContent).not.toContain('T-42');
    expect(element.textContent).not.toContain('T-43');
  });
});
