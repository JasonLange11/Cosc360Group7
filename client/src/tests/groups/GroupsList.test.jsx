import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupsList from '../../components/groups/GroupsList';
import { getGroups, searchGroups } from '../../lib/groupsApi';

vi.mock('../../lib/groupsApi', () => ({
  getGroups: vi.fn(),
  searchGroups: vi.fn(),
}));

vi.mock('../../components/ui/CardDisplay', () => ({
  default: ({ heading, groupId, onOpenGroup }) => (
    <div data-testid="card" onClick={() => onOpenGroup?.(groupId)}>
      {heading}
    </div>
  ),
}));

const sampleGroups = [
  { _id: 'g1', name: 'Hiking Club', description: 'We hike', location: 'Mountains', bannerImage: '/img1.jpg' },
  { _id: 'g2', name: 'Book Club', description: 'We read', location: 'Library', bannerImage: '/img2.jpg' },
];

beforeEach(() => {
  vi.mocked(getGroups).mockResolvedValue([]);
  vi.mocked(searchGroups).mockResolvedValue([]);
});

describe('GroupsList', () => {
  test('shows loading state initially', () => {
    vi.mocked(getGroups).mockReturnValue(new Promise(() => {}));
    render(<GroupsList searchTerm="" onOpenGroup={vi.fn()} />);
    expect(screen.getByText('Loading groups...')).toBeInTheDocument();
  });

  test('shows "No results found" when API returns empty array', async () => {
    render(<GroupsList searchTerm="" onOpenGroup={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('No results found')).toBeInTheDocument());
  });

  test('renders a card for each group returned by the API', async () => {
    vi.mocked(getGroups).mockResolvedValue(sampleGroups);
    render(<GroupsList searchTerm="" onOpenGroup={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Hiking Club')).toBeInTheDocument();
      expect(screen.getByText('Book Club')).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('card')).toHaveLength(2);
  });

  test('shows an error message when the API call fails', async () => {
    vi.mocked(getGroups).mockRejectedValue(new Error('Network error'));
    render(<GroupsList searchTerm="" onOpenGroup={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/Network error/)).toBeInTheDocument());
  });

  test('calls getGroups when searchTerm is empty', async () => {
    render(<GroupsList searchTerm="" onOpenGroup={vi.fn()} />);
    await waitFor(() => expect(vi.mocked(getGroups)).toHaveBeenCalled());
    expect(vi.mocked(searchGroups)).not.toHaveBeenCalled();
  });

  test('calls searchGroups with the trimmed term when searchTerm is provided', async () => {
    vi.mocked(searchGroups).mockResolvedValue([sampleGroups[0]]);
    render(<GroupsList searchTerm="  hiking  " onOpenGroup={vi.fn()} />);
    await waitFor(() => expect(vi.mocked(searchGroups)).toHaveBeenCalledWith('hiking'));
    expect(vi.mocked(getGroups)).not.toHaveBeenCalled();
  });

  test('re-fetches when searchTerm changes from empty to a value', async () => {
    vi.mocked(getGroups).mockResolvedValue(sampleGroups);
    vi.mocked(searchGroups).mockResolvedValue([sampleGroups[0]]);

    const { rerender } = render(<GroupsList searchTerm="" onOpenGroup={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Hiking Club')).toBeInTheDocument());

    rerender(<GroupsList searchTerm="hiking" onOpenGroup={vi.fn()} />);
    await waitFor(() => expect(vi.mocked(searchGroups)).toHaveBeenCalledWith('hiking'));
  });

  test('calls onOpenGroup with the correct groupId when a card is clicked', async () => {
    vi.mocked(getGroups).mockResolvedValue(sampleGroups);
    const onOpenGroup = vi.fn();
    render(<GroupsList searchTerm="" onOpenGroup={onOpenGroup} />);
    await waitFor(() => expect(screen.getByText('Hiking Club')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Hiking Club'));
    expect(onOpenGroup).toHaveBeenCalledWith('g1');
  });
});
