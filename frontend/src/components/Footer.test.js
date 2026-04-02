import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { DyslexiaProvider } from '../DyslexiaContext';
import Footer from './Footer';

function renderFooter() {
  return render(
    <DyslexiaProvider>
      <ChakraProvider>
        <Footer />
      </ChakraProvider>
    </DyslexiaProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.body.classList.remove('dyslexia-mode');
});

// --- Rendering ---

test('renders the dyslexia-friendly mode label', () => {
  renderFooter();
  expect(screen.getByText(/dyslexia-friendly mode/i)).toBeInTheDocument();
});

test('renders the designer attribution text', () => {
  renderFooter();
  expect(screen.getByText(/designed by/i)).toBeInTheDocument();
  expect(screen.getByText(/copyright 2024/i)).toBeInTheDocument();
});

test('renders a link to the designer website', () => {
  renderFooter();
  const link = screen.getByRole('link', { name: /wanda l. mccrae/i });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute('href', 'https://wandamccrae.com/');
});

test('designer link opens in a new tab', () => {
  renderFooter();
  expect(screen.getByRole('link', { name: /wanda l. mccrae/i })).toHaveAttribute('target', '_blank');
});

// --- Dyslexia toggle: initial state ---

test('dyslexia toggle is unchecked by default', () => {
  renderFooter();
  expect(screen.getByLabelText(/dyslexia-friendly mode/i)).not.toBeChecked();
});

test('dyslexia toggle is checked when localStorage has dyslexiaMode=true', () => {
  localStorage.setItem('dyslexiaMode', 'true');
  renderFooter();
  expect(screen.getByLabelText(/dyslexia-friendly mode/i)).toBeChecked();
});

// --- Dyslexia toggle: interaction ---

test('clicking the toggle enables dyslexia mode', () => {
  renderFooter();
  userEvent.click(screen.getByLabelText(/dyslexia-friendly mode/i));
  expect(screen.getByLabelText(/dyslexia-friendly mode/i)).toBeChecked();
});

test('clicking the toggle adds dyslexia-mode class to document.body', () => {
  renderFooter();
  userEvent.click(screen.getByLabelText(/dyslexia-friendly mode/i));
  expect(document.body.classList.contains('dyslexia-mode')).toBe(true);
});

test('clicking the toggle again disables dyslexia mode', () => {
  renderFooter();
  userEvent.click(screen.getByLabelText(/dyslexia-friendly mode/i));
  userEvent.click(screen.getByLabelText(/dyslexia-friendly mode/i));
  expect(screen.getByLabelText(/dyslexia-friendly mode/i)).not.toBeChecked();
  expect(document.body.classList.contains('dyslexia-mode')).toBe(false);
});

test('toggling persists the new value to localStorage', () => {
  renderFooter();
  userEvent.click(screen.getByLabelText(/dyslexia-friendly mode/i));
  expect(localStorage.getItem('dyslexiaMode')).toBe('true');
});
