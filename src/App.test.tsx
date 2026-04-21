import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders 0°C navigation button', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /0ºC/i });
  expect(button).toBeInTheDocument();
});
