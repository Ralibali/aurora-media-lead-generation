import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactModalProvider } from '@/components/ContactModal';
import AuroraSiteWatch from './AuroraSiteWatch';

vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
afterEach(cleanup);

describe('Aurora Watch commercial journey', () => {
  it('opens the existing contact form with the selected package and editable website context', async () => {
    render(<MemoryRouter initialEntries={['/aurora-watch']}><ContactModalProvider><AuroraSiteWatch /></ContactModalProvider></MemoryRouter>);
    const proCard = screen.getByText('Watch Pro').parentElement!;
    fireEvent.click(within(proCard).getByRole('button', { name: /Begär offert/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Starta ett projekt' });
    expect(within(dialog).getByText('Sida: /aurora-watch · Paket: Watch Pro')).toBeInTheDocument();
    const message = within(dialog).getByRole<HTMLTextAreaElement>('textbox', { name: /Beskriv projektet kort/ });
    expect(message.value).toContain('Önskat paket: Watch Pro');
    expect(message.value).toContain('Webbplats:');
    fireEvent.change(message, { target: { value: 'Vi vill bevaka vår kontaktväg från startsidan.' } });
    expect(message).toHaveValue('Vi vill bevaka vår kontaktväg från startsidan.');
  });

  it('preserves the old SiteWatch entry point with the new canonical offer and explicit test scope', () => {
    render(<MemoryRouter initialEntries={['/sitewatch']}><ContactModalProvider><AuroraSiteWatch /></ContactModalProvider></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hittar kunden fram när det gäller?');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://auroramedia.se/aurora-watch');
    expect(screen.getByText(/De skickar inte formulär, loggar inte in/)).toBeInTheDocument();
    expect(screen.getByText(/Automatiska kundmejl för dessa flöden ingår inte/)).toBeInTheDocument();
  });
});
