import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Headline Editor page heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /headline editor/i, level: 1 })).toBeInTheDocument();
});

test('renders skip-to-main-content link for keyboard accessibility', () => {
  render(<App />);
  expect(screen.getByText(/skip to main content/i)).toBeInTheDocument();
});

test('skip link points to #main-content', () => {
  render(<App />);
  expect(screen.getByText(/skip to main content/i)).toHaveAttribute('href', '#main-content');
});

test('renders the archive search form', () => {
  render(<App />);
  expect(screen.getByRole('form', { name: /search ny times archive/i })).toBeInTheDocument();
});

test('renders year and month inputs', () => {
  render(<App />);
  expect(screen.getByLabelText(/year, 4 digits/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/month, number/i)).toBeInTheDocument();
});

test('renders Search and Reset Page buttons', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reset page/i })).toBeInTheDocument();
});

test('renders the dyslexia mode toggle in the footer', () => {
  render(<App />);
  expect(screen.getByLabelText(/dyslexia-friendly mode/i)).toBeInTheDocument();
});

test('renders designer attribution in the footer', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /wanda l. mccrae/i })).toBeInTheDocument();
});
