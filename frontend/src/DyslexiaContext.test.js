import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DyslexiaProvider, useDyslexia } from './DyslexiaContext';

// Helper component that exposes the context values for testing
function TestConsumer() {
  const { dyslexiaMode, setDyslexiaMode } = useDyslexia();
  return (
    <div>
      <span data-testid="mode-value">{String(dyslexiaMode)}</span>
      <button onClick={() => setDyslexiaMode(true)}>Enable</button>
      <button onClick={() => setDyslexiaMode(false)}>Disable</button>
      <button onClick={() => setDyslexiaMode(!dyslexiaMode)}>Toggle</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <DyslexiaProvider>
      <TestConsumer />
    </DyslexiaProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.body.classList.remove('dyslexia-mode');
});

// --- Default state ---

test('dyslexia mode is false by default when localStorage is empty', () => {
  renderWithProvider();
  expect(screen.getByTestId('mode-value')).toHaveTextContent('false');
});

test('does not add dyslexia-mode class to document.body by default', () => {
  renderWithProvider();
  expect(document.body.classList.contains('dyslexia-mode')).toBe(false);
});

// --- Persistence: reading from localStorage ---

test('reads saved true value from localStorage on mount', () => {
  localStorage.setItem('dyslexiaMode', 'true');
  renderWithProvider();
  expect(screen.getByTestId('mode-value')).toHaveTextContent('true');
});

test('adds dyslexia-mode CSS class on mount when localStorage is true', () => {
  localStorage.setItem('dyslexiaMode', 'true');
  renderWithProvider();
  expect(document.body.classList.contains('dyslexia-mode')).toBe(true);
});

test('ignores non-"true" localStorage values (treats them as false)', () => {
  localStorage.setItem('dyslexiaMode', 'yes');
  renderWithProvider();
  expect(screen.getByTestId('mode-value')).toHaveTextContent('false');
});

// --- Toggling: CSS class on document.body ---

test('adds dyslexia-mode class to document.body when enabled', async () => {
  renderWithProvider();
  await act(async () => { userEvent.click(screen.getByRole('button', { name: /enable/i })); });
  expect(document.body.classList.contains('dyslexia-mode')).toBe(true);
});

test('removes dyslexia-mode class from document.body when disabled', async () => {
  localStorage.setItem('dyslexiaMode', 'true');
  renderWithProvider();
  await act(async () => { userEvent.click(screen.getByRole('button', { name: /disable/i })); });
  expect(document.body.classList.contains('dyslexia-mode')).toBe(false);
});

// --- Persistence: writing to localStorage ---

test('saves true to localStorage when dyslexia mode is enabled', async () => {
  renderWithProvider();
  await act(async () => { userEvent.click(screen.getByRole('button', { name: /enable/i })); });
  expect(localStorage.getItem('dyslexiaMode')).toBe('true');
});

test('saves false to localStorage when dyslexia mode is disabled', async () => {
  localStorage.setItem('dyslexiaMode', 'true');
  renderWithProvider();
  await act(async () => { userEvent.click(screen.getByRole('button', { name: /disable/i })); });
  expect(localStorage.getItem('dyslexiaMode')).toBe('false');
});

// --- Toggle behaviour ---

test('toggle flips from false to true', async () => {
  renderWithProvider();
  await act(async () => { userEvent.click(screen.getByRole('button', { name: /toggle/i })); });
  expect(screen.getByTestId('mode-value')).toHaveTextContent('true');
});

test('toggle flips from true back to false', async () => {
  localStorage.setItem('dyslexiaMode', 'true');
  renderWithProvider();
  await act(async () => { userEvent.click(screen.getByRole('button', { name: /toggle/i })); });
  expect(screen.getByTestId('mode-value')).toHaveTextContent('false');
});
