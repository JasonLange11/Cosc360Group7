import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import EditGroup from '../../components/groups/EditGroup';
import { getGroupById, updateGroup } from '../../lib/groupsApi';
import { uploadGroupBannerImage } from '../../lib/uploadsApi';
import { useAuth } from '../../context/AuthContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ groupId: 'test-group-id' }),
  };
});

vi.mock('../../lib/groupsApi', () => ({
  getGroupById: vi.fn(),
  updateGroup: vi.fn(),
}));

vi.mock('../../lib/uploadsApi', () => ({ uploadGroupBannerImage: vi.fn() }));

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));

vi.mock('../../components/ui/Header', () => ({ default: () => null }));
vi.mock('../../components/ui/Footer', () => ({ default: () => null }));

// -------------------------------------------------------------------------
// Fixtures
// -------------------------------------------------------------------------
const regularUser = { id: 'user-id', email: 'user@test.com', isAdmin: false };
const adminUser = { id: 'admin-id', email: 'admin@test.com', isAdmin: true };

const existingGroup = {
  _id: 'test-group-id',
  name: 'Original Name',
  description: 'Original description',
  location: 'Original City',
  tags: ['hiking', 'outdoor'],
  bannerImage: 'http://example.com/old-banner.jpg',
};

function renderEdit() {
  return render(
    <MemoryRouter>
      <EditGroup />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ currentUser: regularUser });
  vi.mocked(getGroupById).mockResolvedValue(existingGroup);
  vi.mocked(updateGroup).mockResolvedValue(existingGroup);
  vi.mocked(uploadGroupBannerImage).mockResolvedValue({ imageUrl: 'http://example.com/new-banner.jpg' });
});

// -------------------------------------------------------------------------
// Tests
// -------------------------------------------------------------------------
describe('EditGroup — loading and initial render', () => {
  test('shows loading indicator while fetching group data', () => {
    vi.mocked(getGroupById).mockReturnValue(new Promise(() => {}));
    renderEdit();
    expect(screen.getByText(/loading group/i)).toBeInTheDocument();
  });

  test('pre-populates the name field after loading', async () => {
    renderEdit();
    await waitFor(() =>
      expect(screen.getByLabelText(/group name/i)).toHaveValue('Original Name')
    );
  });

  test('pre-populates the location field after loading', async () => {
    renderEdit();
    await waitFor(() =>
      expect(screen.getByLabelText(/location/i)).toHaveValue('Original City')
    );
  });

  test('pre-populates the description field after loading', async () => {
    renderEdit();
    await waitFor(() =>
      expect(screen.getByLabelText(/description/i)).toHaveValue('Original description')
    );
  });

  test('renders existing tags after loading', async () => {
    renderEdit();
    await waitFor(() => {
      expect(screen.getByText('hiking')).toBeInTheDocument();
      expect(screen.getByText('outdoor')).toBeInTheDocument();
    });
  });

  test('shows error message when group fetch fails', async () => {
    vi.mocked(getGroupById).mockRejectedValue(new Error('Group not found'));
    renderEdit();
    await waitFor(() => expect(screen.getByText(/Group not found/i)).toBeInTheDocument());
  });
});

describe('EditGroup — form validation', () => {
  test('disables the Save button when name field is empty', async () => {
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/group name/i)).toHaveValue('Original Name'));
    await user.clear(screen.getByLabelText(/group name/i));
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
    expect(vi.mocked(updateGroup)).not.toHaveBeenCalled();
  });

  test('shows error when description is cleared and form is submitted', async () => {
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/description/i)).toHaveValue('Original description'));
    await user.clear(screen.getByLabelText(/description/i));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
  });

  test('shows error when location is cleared and form is submitted', async () => {
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/location/i)).toHaveValue('Original City'));
    await user.clear(screen.getByLabelText(/location/i));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getByText(/location is required/i)).toBeInTheDocument();
  });
});

describe('EditGroup — tag management', () => {
  test('adds a new tag on Enter key press', async () => {
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/group name/i)).toHaveValue('Original Name'));
    await user.type(screen.getByPlaceholderText(/type a tag/i), 'trail{Enter}');
    expect(screen.getByText('trail')).toBeInTheDocument();
  });

  test('removes an existing tag when its remove button is clicked', async () => {
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByText('hiking')).toBeInTheDocument());
    const removeButtons = screen.getAllByRole('button', { name: 'x' });
    await user.click(removeButtons[0]);
    expect(screen.queryByText('hiking')).not.toBeInTheDocument();
  });
});

describe('EditGroup — form submission', () => {
  test('calls updateGroup with updated values (no new banner)', async () => {
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/group name/i)).toHaveValue('Original Name'));
    await user.clear(screen.getByLabelText(/group name/i));
    await user.type(screen.getByLabelText(/group name/i), 'Updated Name');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(vi.mocked(updateGroup)).toHaveBeenCalledWith(
        'test-group-id',
        expect.objectContaining({
          name: 'Updated Name',
          bannerImage: 'http://example.com/old-banner.jpg',
        })
      );
      expect(vi.mocked(uploadGroupBannerImage)).not.toHaveBeenCalled();
    });
  });

  test('uploads new banner before calling updateGroup when a new file is selected', async () => {
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/group name/i)).toHaveValue('Original Name'));

    const file = new File(['new-img'], 'new-banner.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/banner image/i), file);
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(vi.mocked(uploadGroupBannerImage)).toHaveBeenCalledWith(file);
      expect(vi.mocked(updateGroup)).toHaveBeenCalledWith(
        'test-group-id',
        expect.objectContaining({ bannerImage: 'http://example.com/new-banner.jpg' })
      );
    });
  });

  test('navigates to /settings for a regular user after saving', async () => {
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/group name/i)).toHaveValue('Original Name'));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/settings'));
  });

  test('navigates to /admin for an admin user after saving', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: adminUser });
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/group name/i)).toHaveValue('Original Name'));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin'));
  });

  test('shows error message when updateGroup fails', async () => {
    vi.mocked(updateGroup).mockRejectedValue(new Error('Save failed'));
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByLabelText(/group name/i)).toHaveValue('Original Name'));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(screen.getByText(/Save failed/i)).toBeInTheDocument());
  });
});

describe('EditGroup — cancel button', () => {
  test('navigates to /settings when Cancel is clicked by a regular user', async () => {
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  test('navigates to /admin when Cancel is clicked by an admin user', async () => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: adminUser });
    const user = userEvent.setup();
    renderEdit();

    await waitFor(() => expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });
});
