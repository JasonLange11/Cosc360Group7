import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupsPage from '../../components/groups/GroupsPage';

// Mock child components so we can inspect what props they receive
vi.mock('../../components/groups/GroupsList', () => ({
  default: ({ searchTerm, onOpenGroup }) => (
    <div data-testid="groups-list" data-search-term={searchTerm}>
      <button onClick={() => onOpenGroup('mock-group-id')}>Open Group</button>
    </div>
  ),
}));

vi.mock('../../components/groups/GroupDetails', () => ({
  default: ({ groupId, onClose }) => (
    <div data-testid="group-details" data-group-id={groupId}>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../../components/search/SearchBar', () => ({
  default: ({ onSearch }) => (
    <input
      data-testid="search-bar"
      placeholder="search"
      onChange={(e) => onSearch(e.target.value)}
    />
  ),
}));

vi.mock('../../components/ui/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('../../components/ui/Footer', () => ({ default: () => <div data-testid="footer" /> }));

// -------------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------------
describe('GroupsPage', () => {
  test('renders the header, search bar, groups list, and footer', () => {
    render(<GroupsPage />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('groups-list')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('passes an empty searchTerm to GroupsList on initial render', () => {
    render(<GroupsPage />);
    expect(screen.getByTestId('groups-list')).toHaveAttribute('data-search-term', '');
  });

  test('passes updated searchTerm to GroupsList when user types in the search bar', async () => {
    const user = userEvent.setup();
    render(<GroupsPage />);
    await user.type(screen.getByTestId('search-bar'), 'hiking');
    expect(screen.getByTestId('groups-list')).toHaveAttribute('data-search-term', 'hiking');
  });

  test('does not render GroupDetails initially', () => {
    render(<GroupsPage />);
    expect(screen.queryByTestId('group-details')).not.toBeInTheDocument();
  });

  test('renders GroupDetails with the correct groupId when a group card is opened', async () => {
    const user = userEvent.setup();
    render(<GroupsPage />);
    await user.click(screen.getByRole('button', { name: 'Open Group' }));
    const details = screen.getByTestId('group-details');
    expect(details).toBeInTheDocument();
    expect(details).toHaveAttribute('data-group-id', 'mock-group-id');
  });

  test('closes GroupDetails and removes blur when Close is clicked', async () => {
    const user = userEvent.setup();
    render(<GroupsPage />);

    // Open
    await user.click(screen.getByRole('button', { name: 'Open Group' }));
    expect(screen.getByTestId('group-details')).toBeInTheDocument();

    // Close
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByTestId('group-details')).not.toBeInTheDocument();
  });

  test('applies blur class to page content while a group is open', async () => {
    const user = userEvent.setup();
    render(<GroupsPage />);

    await user.click(screen.getByRole('button', { name: 'Open Group' }));
    expect(document.querySelector('.page-content-blurred')).toBeInTheDocument();
  });

  test('removes blur class from page content after group is closed', async () => {
    const user = userEvent.setup();
    render(<GroupsPage />);

    await user.click(screen.getByRole('button', { name: 'Open Group' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(document.querySelector('.page-content-blurred')).not.toBeInTheDocument();
  });
});
