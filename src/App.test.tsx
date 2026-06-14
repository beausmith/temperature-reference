import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// (celciusMax / scale) * rowHeight + rowHeight / 2, with no safe-area inset in jsdom
const zeroScrollTop = (300 / 5) * 50 + 50 / 2;

const setScrollY = (y: number) => {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
};

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.scroll = vi.fn();
  window.localStorage.clear();
  setScrollY(0);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

test('renders 0°C navigation button', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /0ºC/i });
  expect(button).toBeInTheDocument();
});

test('renders a row for every 5ºC from -40 to 300 with fahrenheit conversions', () => {
  render(<App />);
  expect(screen.getAllByText(/ºF$/)).toHaveLength((300 - -40) / 5 + 1);
  expect(screen.getByText('-40ºC')).toBeInTheDocument();
  expect(screen.getByText('-40ºF')).toBeInTheDocument();
  expect(screen.getByText('100ºC')).toBeInTheDocument();
  expect(screen.getByText('212ºF')).toBeInTheDocument();
  expect(screen.getByText('300ºC')).toBeInTheDocument();
  expect(screen.getByText('572ºF')).toBeInTheDocument();
});

test('renders reference items with name, time, and temperature', () => {
  render(<App />);
  expect(screen.getByText('Sauna • 15m @ 80ºC')).toBeInTheDocument();
  expect(screen.getByText('Bath Tub • 38ºC')).toBeInTheDocument();
  expect(screen.getByText('Pizza • 300ºC')).toBeInTheDocument();
  expect(screen.getByText('Steak (Rare) • 1–2h @ 54ºC')).toBeInTheDocument();
});

test('scrolls to 0ºC on load when no temperature is saved', () => {
  render(<App />);
  expect(window.scrollTo).toHaveBeenCalledWith({ top: zeroScrollTop + 1 });
});

test('restores scroll to the saved temperature on load', () => {
  window.localStorage.setItem('lastTemp', '50.0');
  render(<App />);
  expect(window.scrollTo).toHaveBeenCalledWith({ top: zeroScrollTop - 50 * 10 + 1 });
});

test('falls back to 0ºC when the saved temperature is not a number', () => {
  window.localStorage.setItem('lastTemp', 'garbage');
  render(<App />);
  expect(window.scrollTo).toHaveBeenCalledWith({ top: zeroScrollTop + 1 });
});

test('saves the current temperature to localStorage on scroll', async () => {
  render(<App />);
  setScrollY(zeroScrollTop - 50 * 10);
  fireEvent.scroll(window);
  await waitFor(() => expect(window.localStorage.getItem('lastTemp')).toBe('50.0'));
});

test('does not save a temperature before any scroll happens', () => {
  render(<App />);
  expect(window.localStorage.getItem('lastTemp')).toBeNull();
});

test('fahrenheit readout derives from the raw value (350°F reads 350.0, not 350.1)', async () => {
  render(<App />);
  // Scroll position for exactly 350°F (= 176.6667°C)
  setScrollY(zeroScrollTop - ((350 - 32) * 5 / 9) * 10);
  fireEvent.scroll(window);
  const label = await screen.findByText(
    (_, el) => el?.textContent === '176.7ºC / 350.0ºF' && el.children.length === 0
  );
  expect(label).toBeInTheDocument();
});

// Notched device: the env() probe resolves to a top inset (in px)
const mockInsetTop = (px: number) =>
  vi.spyOn(window, 'getComputedStyle').mockReturnValue(
    { paddingTop: `${px}px`, getPropertyValue: () => '' } as unknown as CSSStyleDeclaration
  );

test('applies the safe-area top inset to the scroll math on cold launch', () => {
  const spy = mockInsetTop(50);
  render(<App />);
  // zeroScrollTop = 3025 - 50/2 = 3000; initial restore scroll is +1
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 3000 + 1 });
  spy.mockRestore();
});

test('0ºC button scrolls to the inset-adjusted zero position', () => {
  const spy = mockInsetTop(62);
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /0ºC/i }));
  // zeroScrollTop = 3025 - 62/2 = 2994
  expect(window.scroll).toHaveBeenCalledWith({ top: 2994, behavior: 'smooth' });
  spy.mockRestore();
});

test('restores the saved temperature against the inset-adjusted basis', () => {
  window.localStorage.setItem('lastTemp', '50.0');
  const spy = mockInsetTop(62);
  render(<App />);
  // zeroScrollTop = 2994; initialTop = 2994 - 50*10 = 2494; restore scroll +1
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 2494 + 1 });
  spy.mockRestore();
});

test('shows the branch name in the title on non-production branches', () => {
  vi.stubEnv('VITE_BRANCH', 'preview');
  render(<App />);
  expect(document.title).toBe('Celsius - preview');
});

test('keeps the default title on the production branch', () => {
  vi.stubEnv('VITE_BRANCH', 'production');
  document.title = 'Celsius';
  render(<App />);
  expect(document.title).toBe('Celsius');
});
