import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventDetails from '../../components/events/EventDetails';
import {
  attendEvent,
  getEventById,
  unattendEvent,
  addTagToEvent,
  removeTagFromEvent,
} from '../../lib/eventsApi';
import { useAuth } from '../../context/AuthContext';
import { usePopup } from '../../components/ui/PopupProvider';

vi.mock('../../lib/eventsApi', () => ({
  attendEvent: vi.fn(),
  getEventById: vi.fn(),
  unattendEvent: vi.fn(),
  addTagToEvent: vi.fn(),
  removeTagFromEvent: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));

vi.mock('../../components/ui/PopupProvider', () => ({
  usePopup: vi.fn(),
}));

vi.mock('../../components/comments/CommentSection', () => ({
  default: () => null,
}));

vi.mock('../../lib/flagsApi.js', () => ({
  createFlag: vi.fn(),
}));

const baseEvent = {
  _id: 'event-123',
  title: 'Frontend Event',
  description: 'Event description',
  eventDate: '2030-06-10T00:00:00.000Z',
  eventTime: '18:00',
  location: 'Campus Hall',
  capacity: 50,
  cost: 0,
  organizerName: 'Alice',
  bannerImage: 'https://example.com/banner.jpg',
  attendees: [],
  tags: ['test'],
};

const regularUser = { id: 'user-1', isAdmin: false };
const adminUser = { id: 'admin-1', isAdmin: true };

function renderDetails(props = {}) {
  return render(<EventDetails eventId="event-123" onClose={vi.fn()} {...props} />);
}

beforeEach(() => {
  vi.mocked(getEventById).mockResolvedValue(baseEvent);
  vi.mocked(useAuth).mockReturnValue({ currentUser: null });
  vi.mocked(usePopup).mockReturnValue({
    showPrompt: vi.fn(),
    showToast: vi.fn(),
  });
});

describe('EventDetails', () => {
  test('shows loading indicator while fetching details', () => {
    vi.mocked(getEventById).mockReturnValue(new Promise(() => {}));

    renderDetails();

    expect(screen.getByText(/Loading event details/i)).toBeInTheDocument();
  });

  test('shows error message when event fetch fails', async () => {
    vi.mocked(getEventById).mockRejectedValue(new Error('Event not found'));

    renderDetails();

    await waitFor(() => expect(screen.getByText(/Event not found/i)).toBeInTheDocument());
  });

  test('shows login button for unauthenticated user and displays login toast on click', async () => {
    const showToast = vi.fn();
    vi.mocked(usePopup).mockReturnValue({ showPrompt: vi.fn(), showToast });

    const user = userEvent.setup();
    renderDetails();

    await waitFor(() => expect(screen.getByRole('button', { name: /login to register/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /login to register/i }));

    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    expect(vi.mocked(attendEvent)).not.toHaveBeenCalled();
  });

  test('calls attendEvent for non-member and updates button to leave event', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: regularUser });
    vi.mocked(attendEvent).mockResolvedValue({ ...baseEvent, attendees: [regularUser.id] });

    const user = userEvent.setup();
    renderDetails();

    await waitFor(() => expect(screen.getByRole('button', { name: /register for this event/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /register for this event/i }));

    await waitFor(() => {
      expect(vi.mocked(attendEvent)).toHaveBeenCalledWith('event-123');
      expect(screen.getByRole('button', { name: /leave event/i })).toBeInTheDocument();
    });
  });

  test('calls unattendEvent for member and updates button to register', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: regularUser });
    vi.mocked(getEventById).mockResolvedValue({ ...baseEvent, attendees: [regularUser.id] });
    vi.mocked(unattendEvent).mockResolvedValue({ ...baseEvent, attendees: [] });

    const user = userEvent.setup();
    renderDetails();

    await waitFor(() => expect(screen.getByRole('button', { name: /leave event/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /leave event/i }));

    await waitFor(() => {
      expect(vi.mocked(unattendEvent)).toHaveBeenCalledWith('event-123');
      expect(screen.getByRole('button', { name: /register for this event/i })).toBeInTheDocument();
    });
  });

  test('shows disabled admin RSVP button for admin user', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: adminUser });

    renderDetails();

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /admins cannot rsvp/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });
});
