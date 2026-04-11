import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupDetails from '../../components/groups/GroupDetails';
import { getGroupById, joinGroup, leaveGroup } from '../../lib/groupsApi';
import { createFlag } from '../../lib/flagsApi';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../lib/groupsApi', () => ({
  getGroupById: vi.fn(),
  joinGroup: vi.fn(),
  leaveGroup: vi.fn(),
}));

vi.mock('../../lib/flagsApi', () => ({ createFlag: vi.fn() }));

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));

// Prevent CommentSection from making real API calls in these tests
vi.mock('../../components/comments/CommentSection', () => ({ default: () => null }));

// -------------------------------------------------------------------------
// Fixtures
// -------------------------------------------------------------------------
const USER_ID = 'user-abc-123';

const regularUser = { id: USER_ID, email: 'user@test.com', isAdmin: false };
const adminUser = { id: 'admin-id', email: 'admin@test.com', isAdmin: true };

const baseGroup = {
  _id: 'group-xyz',
  name: 'Hiking Club',
  description: 'We love hiking.',
  location: 'Banff',
  bannerImage: 'http://example.com/banner.jpg',
  tags: ['outdoor', 'nature'],
  members: [],
  organizerName: 'Alice',
};

const groupWithUser = { ...baseGroup, members: [USER_ID] };

function renderDetails(props = {}) {
  return render(<GroupDetails groupId="group-xyz" onClose={vi.fn()} {...props} />);
}

// -------------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------------
describe('GroupDetails — loading and error states', () => {
  test('shows loading indicator while fetching', () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: null });
    vi.mocked(getGroupById).mockReturnValue(new Promise(() => {}));
    renderDetails();
    expect(screen.getByText(/Loading group details/i)).toBeInTheDocument();
  });

  test('shows error message when group fetch fails', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: null });
    vi.mocked(getGroupById).mockRejectedValue(new Error('Group not found'));
    renderDetails();
    await waitFor(() => expect(screen.getByText(/Group not found/i)).toBeInTheDocument());
  });
});

describe('GroupDetails — renders group data', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: null });
    vi.mocked(getGroupById).mockResolvedValue(baseGroup);
  });

  test('renders the group name', async () => {
    renderDetails();
    await waitFor(() => expect(screen.getByText('Hiking Club')).toBeInTheDocument());
  });

  test('renders the group description', async () => {
    renderDetails();
    await waitFor(() => expect(screen.getByText('We love hiking.')).toBeInTheDocument());
  });

  test('renders the location', async () => {
    renderDetails();
    await waitFor(() => expect(screen.getByText('Banff')).toBeInTheDocument());
  });

  test('renders the organizer name', async () => {
    renderDetails();
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
  });

  test('renders all group tags', async () => {
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText('outdoor')).toBeInTheDocument();
      expect(screen.getByText('nature')).toBeInTheDocument();
    });
  });

  test('calls onClose when the overlay backdrop is clicked', async () => {
    const onClose = vi.fn();
    renderDetails({ onClose });
    await waitFor(() => expect(screen.getByText('Hiking Club')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Hiking Club').closest('.group-details-overlay'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('GroupDetails — join/leave button label', () => {
  test('shows "Login to join" for unauthenticated users', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: null });
    vi.mocked(getGroupById).mockResolvedValue(baseGroup);
    renderDetails();
    await waitFor(() => expect(screen.getByRole('button', { name: /login to join/i })).toBeInTheDocument());
  });

  test('shows "Join Group" for a logged-in non-member', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: regularUser });
    vi.mocked(getGroupById).mockResolvedValue(baseGroup);
    renderDetails();
    await waitFor(() => expect(screen.getByRole('button', { name: /join group/i })).toBeInTheDocument());
  });

  test('shows "Leave group" for a current member', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: regularUser });
    vi.mocked(getGroupById).mockResolvedValue(groupWithUser);
    renderDetails();
    await waitFor(() => expect(screen.getByRole('button', { name: /leave group/i })).toBeInTheDocument());
  });

  test('shows disabled "Admins cannot join groups" button for admin', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: adminUser });
    vi.mocked(getGroupById).mockResolvedValue(baseGroup);
    renderDetails();
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /admins cannot join groups/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toBeDisabled();
    });
  });
});

describe('GroupDetails — join and leave actions', () => {
  test('calls joinGroup and updates button to "Leave group" on join', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: regularUser });
    vi.mocked(getGroupById).mockResolvedValue(baseGroup);
    vi.mocked(joinGroup).mockResolvedValue({ ...baseGroup, members: [USER_ID] });

    const user = userEvent.setup();
    renderDetails();

    await waitFor(() => expect(screen.getByRole('button', { name: /join group/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /join group/i }));

    await waitFor(() => {
      expect(vi.mocked(joinGroup)).toHaveBeenCalledWith('group-xyz');
      expect(screen.getByRole('button', { name: /leave group/i })).toBeInTheDocument();
    });
  });

  test('calls leaveGroup and updates button to "Join Group" on leave', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: regularUser });
    vi.mocked(getGroupById).mockResolvedValue(groupWithUser);
    vi.mocked(leaveGroup).mockResolvedValue({ ...baseGroup, members: [] });

    const user = userEvent.setup();
    renderDetails();

    await waitFor(() => expect(screen.getByRole('button', { name: /leave group/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /leave group/i }));

    await waitFor(() => {
      expect(vi.mocked(leaveGroup)).toHaveBeenCalledWith('group-xyz');
      expect(screen.getByRole('button', { name: /join group/i })).toBeInTheDocument();
    });
  });

  test('shows error message when join fails', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: regularUser });
    vi.mocked(getGroupById).mockResolvedValue(baseGroup);
    vi.mocked(joinGroup).mockRejectedValue(new Error('Already a member'));

    const user = userEvent.setup();
    renderDetails();

    await waitFor(() => expect(screen.getByRole('button', { name: /join group/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /join group/i }));

    await waitFor(() => expect(screen.getByText(/Already a member/i)).toBeInTheDocument());
  });

  test('shows error when unauthenticated user tries to join', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: null });
    vi.mocked(getGroupById).mockResolvedValue(baseGroup);

    const user = userEvent.setup();
    renderDetails();

    await waitFor(() => expect(screen.getByRole('button', { name: /login to join/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /login to join/i }));

    await waitFor(() =>
      expect(screen.getByText(/you must be logged in to join/i)).toBeInTheDocument()
    );
    expect(vi.mocked(joinGroup)).not.toHaveBeenCalled();
  });
});

describe('GroupDetails — flag action', () => {
  test('calls createFlag when flag button is clicked by logged-in user', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: regularUser });
    vi.mocked(getGroupById).mockResolvedValue(baseGroup);
    vi.mocked(createFlag).mockResolvedValue({});
    vi.spyOn(window, 'prompt').mockReturnValue('inappropriate content');

    const user = userEvent.setup();
    renderDetails();

    await waitFor(() => expect(screen.getByLabelText(/flag group/i)).toBeInTheDocument());
    await user.click(screen.getByLabelText(/flag group/i));

    await waitFor(() => {
      expect(vi.mocked(createFlag)).toHaveBeenCalledWith(
        expect.objectContaining({ targetType: 'group', targetId: 'group-xyz' })
      );
      expect(screen.getByText(/flagged for admin review/i)).toBeInTheDocument();
    });
  });

  test('shows login message when unauthenticated user clicks flag', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: null });
    vi.mocked(getGroupById).mockResolvedValue(baseGroup);

    const user = userEvent.setup();
    renderDetails();

    await waitFor(() => expect(screen.getByLabelText(/flag group/i)).toBeInTheDocument());
    await user.click(screen.getByLabelText(/flag group/i));

    expect(screen.getByText(/you must be logged in to flag/i)).toBeInTheDocument();
    expect(vi.mocked(createFlag)).not.toHaveBeenCalled();
  });
});
