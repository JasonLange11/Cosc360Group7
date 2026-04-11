import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventsList from '../../components/events/EventsList';
import { getEvents, searchEvents } from '../../lib/eventsApi';

vi.mock('../../lib/eventsApi', () => ({
  getEvents: vi.fn(),
  searchEvents: vi.fn(),
}));

vi.mock('../../components/ui/CardDisplay', () => ({
  default: ({ heading, eventId, onOpenEvent }) => (
    <div data-testid="event-card" onClick={() => onOpenEvent?.(eventId)}>
      {heading}
    </div>
  ),
}));

const sampleEvents = [
  {
    _id: 'e1',
    title: 'Music Night',
    description: 'Live show',
    eventDate: '2030-05-01T00:00:00.000Z',
    eventTime: '18:00',
    location: 'Hall A',
    bannerImage: '/banner1.jpg',
    tags: ['music', 'social'],
  },
  {
    _id: 'e2',
    title: 'Coding Meetup',
    description: 'Practice coding',
    eventDate: '2030-05-02T00:00:00.000Z',
    eventTime: '19:00',
    location: 'Lab B',
    bannerImage: '/banner2.jpg',
    tags: ['tech'],
  },
];

beforeEach(() => {
  vi.mocked(getEvents).mockResolvedValue([]);
  vi.mocked(searchEvents).mockResolvedValue([]);
});

describe('EventsList', () => {
  test('shows loading state initially', () => {
    vi.mocked(getEvents).mockReturnValue(new Promise(() => {}));

    render(<EventsList searchTerm="" selectedTags={[]} onOpenEvent={vi.fn()} />);

    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  test('renders cards from getEvents and opens selected event', async () => {
    vi.mocked(getEvents).mockResolvedValue(sampleEvents);
    const onOpenEvent = vi.fn();

    render(<EventsList searchTerm="" selectedTags={[]} onOpenEvent={onOpenEvent} />);

    await waitFor(() => {
      expect(screen.getByText('Music Night')).toBeInTheDocument();
      expect(screen.getByText('Coding Meetup')).toBeInTheDocument();
    });

    expect(screen.getAllByTestId('event-card')).toHaveLength(2);

    await userEvent.click(screen.getByText('Music Night'));
    expect(onOpenEvent).toHaveBeenCalledWith('e1');
  });

  test('calls searchEvents with trimmed term when searchTerm is provided', async () => {
    vi.mocked(searchEvents).mockResolvedValue([sampleEvents[0]]);

    render(<EventsList searchTerm="  music  " selectedTags={[]} onOpenEvent={vi.fn()} />);

    await waitFor(() => expect(vi.mocked(searchEvents)).toHaveBeenCalledWith('music'));
    expect(vi.mocked(getEvents)).not.toHaveBeenCalled();
  });

  test('applies selectedTags filtering to fetched events', async () => {
    vi.mocked(getEvents).mockResolvedValue(sampleEvents);

    render(<EventsList searchTerm="" selectedTags={['music']} onOpenEvent={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Music Night')).toBeInTheDocument();
      expect(screen.queryByText('Coding Meetup')).not.toBeInTheDocument();
    });
  });

  test('shows error message when event API call fails', async () => {
    vi.mocked(getEvents).mockRejectedValue(new Error('Failed to fetch events'));

    render(<EventsList searchTerm="" selectedTags={[]} onOpenEvent={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(/Failed to fetch events/i)).toBeInTheDocument());
  });
});
