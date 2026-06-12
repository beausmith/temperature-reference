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
