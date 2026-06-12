import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

// Simulates a notched iPhone cold launch: safe-area-inset-top reads 0 while
// the viewport settles, then arrives late via the lib's change callback.
const inset = vi.hoisted(() => ({
  top: 0,
  listeners: [] as Array<() => void>,
}));

vi.mock('safe-area-insets', () => ({
  default: {
    get top() { return inset.top; },
    get bottom() { return 0; },
    get left() { return 0; },
    get right() { return 0; },
    get support() { return true; },
    onChange: (cb: () => void) => { inset.listeners.push(cb); },
    offChange: (cb: () => void) => {
      const index = inset.listeners.indexOf(cb);
      if (index >= 0) inset.listeners.splice(index, 1);
    },
  },
}));

const settleInset = (top: number) => {
  act(() => {
    inset.top = top;
    inset.listeners.forEach(cb => cb());
  });
};

// (celciusMax / scale) * rowHeight + rowHeight / 2
const zeroScrollTopBase = (300 / 5) * 50 + 50 / 2;

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.scroll = vi.fn();
  window.localStorage.clear();
  inset.top = 0;
  inset.listeners.length = 0;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('re-restores the saved temperature when the inset settles late, without a stale snap-back', () => {
  window.localStorage.setItem('lastTemp', '50.0');
  render(<App />);

  // cold launch: inset reads 0
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: zeroScrollTopBase - 500 + 1 });

  settleInset(62);
  const settledTop = zeroScrollTopBase - 62 / 2 - 500;
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: settledTop + 1 });

  vi.runAllTimers();
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: settledTop });
  // the 200ms snap-back scheduled under the inset-0 basis must have been cleared
  expect(window.scrollTo).not.toHaveBeenCalledWith({ top: zeroScrollTopBase - 500 });
});

test('0ºC button targets the settled inset basis', () => {
  render(<App />);
  settleInset(62);
  vi.runAllTimers();

  fireEvent.click(screen.getByRole('button', { name: /0ºC/i }));
  expect(window.scroll).toHaveBeenCalledWith({ top: zeroScrollTopBase - 62 / 2, behavior: 'smooth' });
});
