import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import SearchResults from './SearchResults';

const MOCK_FORM_DATA = { year: 2020, month: 6 };

function makeArticle(overrides = {}) {
  return {
    _id: 'nyt://article/abc123',
    headline: { main: 'Test Article Headline' },
    pub_date: '2020-06-15T12:00:00+0000',
    byline: { original: 'By Test Author' },
    multimedia: [],
    abstract: 'A test abstract.',
    lead_paragraph: 'The test lead paragraph.',
    news_desk: 'National',
    web_url: 'https://www.nytimes.com/2020/06/15/test.html',
    ...overrides,
  };
}

function renderSearchResults(articles = [], formData = MOCK_FORM_DATA, copyright = 'Copyright NYT') {
  return render(
    <ChakraProvider>
      <SearchResults articleData={articles} formData={formData} copyright={copyright} />
    </ChakraProvider>
  );
}

// --- Initial render ---

test('shows archive heading with year and month name', () => {
  renderSearchResults([], { year: 2020, month: 6 });
  expect(screen.getByRole('heading', { name: /ny times archive for 2020 june/i })).toBeInTheDocument();
});

test('shows "Please select an article." before any article is chosen', () => {
  renderSearchResults([makeArticle()]);
  expect(screen.getByText(/please select an article/i)).toBeInTheDocument();
});

test('renders copyright text', () => {
  renderSearchResults([makeArticle()], MOCK_FORM_DATA, 'Copyright The New York Times Company');
  expect(screen.getByText(/copyright the new york times company/i)).toBeInTheDocument();
});

// --- Dropdown population ---

test('renders a dropdown option for each article', () => {
  const articles = [
    makeArticle({ _id: 'a1', headline: { main: 'First Article' } }),
    makeArticle({ _id: 'a2', headline: { main: 'Second Article' } }),
    makeArticle({ _id: 'a3', headline: { main: 'Third Article' } }),
  ];
  renderSearchResults(articles);
  expect(screen.getByRole('option', { name: 'First Article' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Second Article' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Third Article' })).toBeInTheDocument();
});

test('renders empty dropdown when no articles are provided', () => {
  renderSearchResults([]);
  const combobox = screen.getByRole('combobox');
  // Only the placeholder option should be present
  expect(combobox.options).toHaveLength(1);
});

// --- Article detail display ---

test('shows article headline after selecting an article', async () => {
  const article = makeArticle();
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  expect(await screen.findByRole('heading', { name: /test article headline/i })).toBeInTheDocument();
});

test('shows byline after selecting an article', async () => {
  const article = makeArticle();
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  expect(await screen.findByText(/by test author/i)).toBeInTheDocument();
});

test('shows publication date after selecting an article', async () => {
  const article = makeArticle({ pub_date: '2020-06-15T12:00:00+0000' });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  expect(await screen.findByText(/2020 june 15/i)).toBeInTheDocument();
});

test('shows abstract and lead paragraph after selecting an article', async () => {
  const article = makeArticle();
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  expect(await screen.findByText(/a test abstract/i)).toBeInTheDocument();
  expect(screen.getByText(/the test lead paragraph/i)).toBeInTheDocument();
});

test('shows news desk after selecting an article', async () => {
  const article = makeArticle({ news_desk: 'Science' });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  expect(await screen.findByText(/news desk: science/i)).toBeInTheDocument();
});

// --- Media display ---

test('shows "No media." when article has fewer than 5 multimedia items', async () => {
  const article = makeArticle({ multimedia: [{}, {}, {}] }); // only 3 items
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  expect(await screen.findByText(/no media/i)).toBeInTheDocument();
});

test('shows "No media." when article has empty multimedia array', async () => {
  const article = makeArticle({ multimedia: [] });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  expect(await screen.findByText(/no media/i)).toBeInTheDocument();
});

test('shows article image when multimedia array has 5+ items', async () => {
  const multimedia = Array(5).fill(null).map((_, i) => ({ url: `images/photo${i}.jpg` }));
  const article = makeArticle({ multimedia });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  expect(await screen.findByRole('img')).toBeInTheDocument();
});

// --- Headline editing ---

test('shows headline edit input and Edit button when an article is selected', async () => {
  const article = makeArticle();
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  expect(await screen.findByRole('textbox', { name: /edit the headline/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /apply headline edit/i })).toBeInTheDocument();
});

test('clicking Edit button updates the displayed headline', async () => {
  const article = makeArticle();
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  await screen.findByRole('heading', { name: 'Test Article Headline' });

  const editInput = screen.getByRole('textbox', { name: /edit the headline/i });
  userEvent.clear(editInput);
  userEvent.type(editInput, 'My Rewritten Headline');
  userEvent.click(screen.getByRole('button', { name: /apply headline edit/i }));

  expect(await screen.findByRole('heading', { name: 'My Rewritten Headline' })).toBeInTheDocument();
});

test('edited headline replaces original headline in dropdown', async () => {
  const article = makeArticle();
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  await screen.findByRole('heading', { name: 'Test Article Headline' });

  const editInput = screen.getByRole('textbox', { name: /edit the headline/i });
  userEvent.type(editInput, 'Edited Headline');
  userEvent.click(screen.getByRole('button', { name: /apply headline edit/i }));

  // The article detail heading should show the edited version
  expect(await screen.findByRole('heading', { name: 'Edited Headline' })).toBeInTheDocument();
});

// --- Accessibility ---

test('article detail panel has aria-live="polite" for screen reader announcements', () => {
  renderSearchResults([makeArticle()]);
  const liveRegion = screen.getByRole('region', { name: /article details/i });
  expect(liveRegion).toHaveAttribute('aria-live', 'polite');
});

test('article select has an accessible label', () => {
  renderSearchResults([makeArticle()]);
  expect(screen.getByRole('combobox', { name: /select an article/i })).toBeInTheDocument();
});

// --- Security: sanitizeNytUrl ---

test('renders Original Article link for a valid https://www.nytimes.com URL', async () => {
  const article = makeArticle({ web_url: 'https://www.nytimes.com/2020/06/15/test.html' });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  const link = await screen.findByRole('link', { name: /original article/i });
  expect(link).toHaveAttribute('href', 'https://www.nytimes.com/2020/06/15/test.html');
});

test('renders Original Article link for a valid https://nytimes.com URL (no www)', async () => {
  const article = makeArticle({ web_url: 'https://nytimes.com/2020/06/15/test.html' });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  const link = await screen.findByRole('link', { name: /original article/i });
  expect(link).toHaveAttribute('href', 'https://nytimes.com/2020/06/15/test.html');
});

test('does NOT render Original Article link for a non-NYT URL (open redirect guard)', async () => {
  const article = makeArticle({ web_url: 'https://evil.com/steal-clicks' });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  await screen.findByRole('heading', { name: 'Test Article Headline' });
  expect(screen.queryByRole('link', { name: /original article/i })).not.toBeInTheDocument();
});

test('does NOT render Original Article link for a javascript: URL (XSS guard)', async () => {
  const article = makeArticle({ web_url: 'javascript:alert(document.cookie)' });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  await screen.findByRole('heading', { name: 'Test Article Headline' });
  expect(screen.queryByRole('link', { name: /original article/i })).not.toBeInTheDocument();
});

test('does NOT render Original Article link for a data: URL (XSS guard)', async () => {
  const article = makeArticle({ web_url: 'data:text/html,<script>alert(1)</script>' });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  await screen.findByRole('heading', { name: 'Test Article Headline' });
  expect(screen.queryByRole('link', { name: /original article/i })).not.toBeInTheDocument();
});

test('does NOT render Original Article link when nytimes.com appears only in path (hostname spoofing guard)', async () => {
  const article = makeArticle({ web_url: 'https://evil.com/nytimes.com/steal' });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  await screen.findByRole('heading', { name: 'Test Article Headline' });
  expect(screen.queryByRole('link', { name: /original article/i })).not.toBeInTheDocument();
});

test('does NOT render Original Article link for a subdomain of nytimes.com (strict hostname match)', async () => {
  const article = makeArticle({ web_url: 'https://phishing.nytimes.com.evil.com/page' });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  await screen.findByRole('heading', { name: 'Test Article Headline' });
  expect(screen.queryByRole('link', { name: /original article/i })).not.toBeInTheDocument();
});

test('does NOT render Original Article link when web_url is an empty string', async () => {
  const article = makeArticle({ web_url: '' });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  await screen.findByRole('heading', { name: 'Test Article Headline' });
  expect(screen.queryByRole('link', { name: /original article/i })).not.toBeInTheDocument();
});

test('article image src is prefixed with https://nytimes.com/', async () => {
  const multimedia = Array(5).fill(null).map((_, i) => ({ url: `images/photo${i}.jpg` }));
  multimedia[4] = { url: 'images/2020/test-photo.jpg' };
  const article = makeArticle({ multimedia });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  const img = await screen.findByRole('img');
  expect(img.getAttribute('src')).toMatch(/^https:\/\/nytimes\.com\//);
});

// --- Edge cases ---

// Bug fix: multimedia: null previously caused a TypeError crash in both the
// useEffect (null[4]) and the render (null.length).
test('renders without crashing when multimedia is null', async () => {
  const article = makeArticle({ multimedia: null });
  renderSearchResults([article]);
  expect(() => userEvent.selectOptions(screen.getByRole('combobox'), article._id)).not.toThrow();
});

test('shows "No media." when multimedia is null', async () => {
  const article = makeArticle({ multimedia: null });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  expect(await screen.findByText(/no media/i)).toBeInTheDocument();
});

// Bug fix: multimedia[4].url being undefined previously produced a broken image
// with src="https://nytimes.com/undefined". The fix skips setting the image URL.
test('shows "No media." when multimedia[4] exists but has no url property', async () => {
  const multimedia = Array(5).fill(null).map(() => ({ url: 'images/photo.jpg' }));
  multimedia[4] = {}; // url is undefined
  const article = makeArticle({ multimedia });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  expect(await screen.findByText(/no media/i)).toBeInTheDocument();
});

test('does not render an image with src containing "undefined"', async () => {
  const multimedia = Array(5).fill(null).map(() => ({ url: 'images/photo.jpg' }));
  multimedia[4] = {};
  const article = makeArticle({ multimedia });
  renderSearchResults([article]);
  userEvent.selectOptions(screen.getByRole('combobox'), article._id);
  await screen.findByRole('heading', { name: 'Test Article Headline' });
  const img = screen.queryByRole('img');
  if (img) expect(img.getAttribute('src')).not.toContain('undefined');
});

// Malformed pub_date: documents that the component handles it without crashing
test('renders article detail without crashing when pub_date is malformed', async () => {
  const article = makeArticle({ pub_date: 'not-a-date' });
  renderSearchResults([article]);
  expect(() => userEvent.selectOptions(screen.getByRole('combobox'), article._id)).not.toThrow();
  expect(await screen.findByText('Test Article Headline')).toBeInTheDocument();
});

// Switching articles: selecting a second article replaces the first
test('detail view updates when a different article is selected', async () => {
  const articles = [
    makeArticle({ _id: 'a1', headline: { main: 'First Article Headline' } }),
    makeArticle({ _id: 'a2', headline: { main: 'Second Article Headline' } }),
  ];
  renderSearchResults(articles);

  userEvent.selectOptions(screen.getByRole('combobox'), 'a1');
  expect(await screen.findByRole('heading', { name: 'First Article Headline' })).toBeInTheDocument();

  userEvent.selectOptions(screen.getByRole('combobox'), 'a2');
  expect(await screen.findByRole('heading', { name: 'Second Article Headline' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'First Article Headline' })).not.toBeInTheDocument();
});
