import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { DyslexiaProvider } from '../DyslexiaContext';
import MainPage from './MainPage';

function renderMainPage() {
  return render(
    <DyslexiaProvider>
      <ChakraProvider>
        <BrowserRouter>
          <MainPage />
        </BrowserRouter>
      </ChakraProvider>
    </DyslexiaProvider>
  );
}

const VALID_YEAR = '2020';
const VALID_MONTH = '6';

const MOCK_ARCHIVE_RESPONSE = {
  copyright: 'Copyright The New York Times Company. All Rights Reserved.',
  response: {
    docs: [
      {
        _id: 'nyt://article/abc123',
        headline: { main: 'Historic Moon Landing Anniversary' },
        pub_date: '2020-06-15T12:00:00+0000',
        byline: { original: 'By Staff Reporter' },
        multimedia: [],
        abstract: 'Celebrating 50 years of the moon landing.',
        lead_paragraph: 'Fifty years ago today...',
        news_desk: 'Science',
        web_url: 'https://www.nytimes.com/2020/06/15/science/moon.html',
      },
    ],
  },
};

beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.clear();
  document.body.classList.remove('dyslexia-mode');
});

afterEach(() => {
  jest.restoreAllMocks();
});

// --- Rendering ---

test('renders the Headline Editor heading', () => {
  renderMainPage();
  expect(screen.getByRole('heading', { name: /headline editor/i, level: 1 })).toBeInTheDocument();
});

test('renders the subheading describing the app', () => {
  renderMainPage();
  expect(screen.getByText(/play with ny times headlines from the archives/i)).toBeInTheDocument();
});

test('renders the dyslexia-friendly mode toggle in the settings bar', () => {
  renderMainPage();
  expect(screen.getByLabelText(/dyslexia-friendly mode/i)).toBeInTheDocument();
});

test('renders year input and month select', () => {
  renderMainPage();
  expect(screen.getByLabelText(/year, 4 digits/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^month$/i)).toBeInTheDocument();
});

test('month select has options for all 12 months', () => {
  renderMainPage();
  const monthSelect = screen.getByLabelText(/^month$/i);
  expect(monthSelect).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'January' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'June' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'December' })).toBeInTheDocument();
});

test('renders Search and Clear buttons', () => {
  renderMainPage();
  expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^clear$/i })).toBeInTheDocument();
});

test('does not show any error alerts on initial render', () => {
  renderMainPage();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

// --- Format validation ---

test('shows format error when year contains letters', async () => {
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), 'abcd');
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/enter the year as 4 digits/i)).toBeInTheDocument();
});

test('shows format error when no month is selected', async () => {
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), '2020');
  // intentionally do not select a month
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/enter the year as 4 digits/i)).toBeInTheDocument();
});

test('shows format error when year is fewer than 4 digits', async () => {
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), '202');
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), '5');
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/enter the year as 4 digits/i)).toBeInTheDocument();
});

test('does not call fetch when format is invalid', async () => {
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), 'bad');
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  await screen.findByText(/enter the year as 4 digits/i);
  expect(global.fetch).not.toHaveBeenCalled();
});

// --- Year range validation ---

test('shows year error for year before 1851', async () => {
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), '1850');
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), '6');
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/enter a year between 1851/i)).toBeInTheDocument();
});

test('shows year error for a year in the future', async () => {
  const futureYear = String(new Date().getFullYear() + 1);
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), futureYear);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), '1');
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/enter a year between 1851/i)).toBeInTheDocument();
});

test('does not call fetch when year is out of range', async () => {
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), '1800');
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), '1');
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  await screen.findByText(/enter a year between 1851/i);
  expect(global.fetch).not.toHaveBeenCalled();
});

// --- Month range validation ---

test('shows month error for a future month in the current year', async () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-indexed
  if (currentMonth >= 12) return; // December has no future month to test
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), String(currentYear));
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), String(currentMonth + 1));
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/enter a month between 1 and/i)).toBeInTheDocument();
});

test('does not call fetch when month is a future month in the current year', async () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  if (currentMonth >= 12) return;
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), String(currentYear));
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), String(currentMonth + 1));
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  await screen.findByText(/enter a month between 1 and/i);
  expect(global.fetch).not.toHaveBeenCalled();
});

// --- Successful fetch ---

test('calls fetch with the correct URL on valid input', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => MOCK_ARCHIVE_RESPONSE,
  });
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), VALID_YEAR);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), VALID_MONTH);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
    `${backendUrl}/nyt?year=${VALID_YEAR}&month=${VALID_MONTH}`
  ));
});

test('shows "Searching..." while the fetch is in flight', async () => {
  // Return a promise that never resolves to keep the loading state active
  global.fetch.mockReturnValue(new Promise(() => {}));
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), VALID_YEAR);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), VALID_MONTH);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/searching/i)).toBeInTheDocument();
});

test('renders article data in SearchResults after a successful fetch', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => MOCK_ARCHIVE_RESPONSE,
  });
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), VALID_YEAR);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), VALID_MONTH);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByRole('option', { name: /historic moon landing/i })).toBeInTheDocument();
});

test('shows copyright text after a successful fetch', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => MOCK_ARCHIVE_RESPONSE,
  });
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), VALID_YEAR);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), VALID_MONTH);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/copyright the new york times company/i)).toBeInTheDocument();
});

test('shows no-articles message when API returns empty docs array', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ copyright: 'Copyright NYT', response: { docs: [] } }),
  });
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), VALID_YEAR);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), VALID_MONTH);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/no articles were found/i)).toBeInTheDocument();
});

// --- Failed fetch ---

test('shows fetch error message when response is not ok', async () => {
  global.fetch.mockResolvedValue({ ok: false });
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), VALID_YEAR);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), VALID_MONTH);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/problem fetching the ny times archive/i)).toBeInTheDocument();
});

// --- Clear button ---

test('Clear button clears a year validation error', async () => {
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), '1800');
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), '1');
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  await screen.findByText(/enter a year between 1851/i);
  userEvent.click(screen.getByRole('button', { name: /^clear$/i }));
  await waitFor(() => {
    expect(screen.queryByText(/enter a year between 1851/i)).not.toBeInTheDocument();
  });
});

test('Clear button clears a fetch error', async () => {
  global.fetch.mockResolvedValue({ ok: false });
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), VALID_YEAR);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), VALID_MONTH);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  await screen.findByText(/problem fetching/i);
  userEvent.click(screen.getByRole('button', { name: /^clear$/i }));
  await waitFor(() => {
    expect(screen.queryByText(/problem fetching/i)).not.toBeInTheDocument();
  });
});

test('Clear button hides SearchResults', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => MOCK_ARCHIVE_RESPONSE,
  });
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), VALID_YEAR);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), VALID_MONTH);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  await screen.findByRole('option', { name: /historic moon landing/i });
  userEvent.click(screen.getByRole('button', { name: /^clear$/i }));
  await waitFor(() => {
    expect(screen.queryByRole('option', { name: /historic moon landing/i })).not.toBeInTheDocument();
  });
});

// --- Edge cases ---

// Bug fix: fetch throwing a network exception previously left "Searching..." visible forever
test('shows fetch error when fetch throws a network exception', async () => {
  global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), VALID_YEAR);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), VALID_MONTH);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/problem fetching the ny times archive/i)).toBeInTheDocument();
});

test('"Searching..." disappears after a network exception', async () => {
  global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), VALID_YEAR);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), VALID_MONTH);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  await screen.findByText(/problem fetching/i);
  expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
});

// Empty form submission
test('shows format error when Search is clicked with no input', async () => {
  renderMainPage();
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/enter the year as 4 digits/i)).toBeInTheDocument();
});

test('does not call fetch when form is empty', async () => {
  renderMainPage();
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  await screen.findByText(/enter the year as 4 digits/i);
  expect(global.fetch).not.toHaveBeenCalled();
});

// --- Dyslexia toggle integration ---

test('clicking the dyslexia toggle enables dyslexia mode', () => {
  renderMainPage();
  userEvent.click(screen.getByLabelText(/dyslexia-friendly mode/i));
  expect(screen.getByLabelText(/dyslexia-friendly mode/i)).toBeChecked();
  expect(document.body.classList.contains('dyslexia-mode')).toBe(true);
});

test('clicking the dyslexia toggle twice returns to the default off state', () => {
  renderMainPage();
  const toggle = screen.getByLabelText(/dyslexia-friendly mode/i);
  userEvent.click(toggle);
  userEvent.click(toggle);
  expect(toggle).not.toBeChecked();
  expect(document.body.classList.contains('dyslexia-mode')).toBe(false);
});

test('clicking the dyslexia toggle persists the new value to localStorage', () => {
  renderMainPage();
  userEvent.click(screen.getByLabelText(/dyslexia-friendly mode/i));
  expect(localStorage.getItem('dyslexiaMode')).toBe('true');
});

// --- Year boundary values ---

test('accepts 1851 (valid lower boundary) and calls fetch', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => MOCK_ARCHIVE_RESPONSE,
  });
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), '1851');
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), '1');
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('accepts the current year with the current month (valid upper boundary) and calls fetch', async () => {
  const currentYear = String(new Date().getFullYear());
  const currentMonth = String(new Date().getMonth() + 1);
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => MOCK_ARCHIVE_RESPONSE,
  });
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), currentYear);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), currentMonth);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(screen.queryByText(/enter a month between/i)).not.toBeInTheDocument();
});

// --- Malformed API response ---

test('shows fetch error when API response is missing response.docs', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ copyright: 'Copyright NYT' }), // no response key
  });
  renderMainPage();
  userEvent.type(screen.getByLabelText(/year, 4 digits/i), VALID_YEAR);
  userEvent.selectOptions(screen.getByLabelText(/^month$/i), VALID_MONTH);
  userEvent.click(screen.getByRole('button', { name: /^search$/i }));
  expect(await screen.findByText(/problem fetching the ny times archive/i)).toBeInTheDocument();
});
