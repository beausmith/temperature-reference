import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InfoScreen from './InfoScreen';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('shows install instructions for both platforms when not standalone', () => {
  render(<InfoScreen onClose={() => {}} />);
  expect(screen.getByText('iPhone & iPad (iOS)')).toBeInTheDocument();
  expect(screen.getByText('Android')).toBeInTheDocument();
  expect(screen.getByText('Add to Home Screen')).toBeInTheDocument();
});

test('shows an installed confirmation when running standalone', () => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('standalone'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  render(<InfoScreen onClose={() => {}} />);
  expect(screen.getByText(/Installed/)).toBeInTheDocument();
  expect(screen.getByText('View install instructions')).toBeInTheDocument();
});

test('Done plays the close animation, then calls onClose when it ends', () => {
  const onClose = vi.fn();
  render(<InfoScreen onClose={onClose} />);
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
  // onClose waits for the slide-down to finish, not the click itself
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.animationEnd(screen.getByRole('dialog', { name: 'Info' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});
