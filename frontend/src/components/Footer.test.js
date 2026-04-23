import { render, screen } from '@testing-library/react';
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
