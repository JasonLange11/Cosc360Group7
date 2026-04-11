import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import GroupCreate from '../../components/groups/GroupCreate';
import { createGroup } from '../../lib/groupsApi';
import { uploadGroupBannerImage } from '../../lib/uploadsApi';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../lib/groupsApi', () => ({ createGroup: vi.fn() }));
vi.mock('../../lib/uploadsApi', () => ({ uploadGroupBannerImage: vi.fn() }));
vi.mock('../../components/ui/Header', () => ({ default: () => null }));
vi.mock('../../components/ui/Footer', () => ({ default: () => null }));

function renderCreate() {
  return render(
    <MemoryRouter>
      <GroupCreate />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(uploadGroupBannerImage).mockResolvedValue({ imageUrl: 'http://example.com/banner.jpg' });
  vi.mocked(createGroup).mockResolvedValue({ _id: 'new-group-id' });
});

describe('GroupCreate', () => {
  test('renders all required form fields', () => {
    renderCreate();
    expect(screen.getByLabelText(/group name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/banner image/i)).toBeInTheDocument();
  });

  test('disables the submit button when name is empty', () => {
    renderCreate();
    // Button starts disabled because name field is empty on mount
    expect(screen.getByRole('button', { name: /create group/i })).toBeDisabled();
    expect(vi.mocked(createGroup)).not.toHaveBeenCalled();
  });

  test('shows error when submitting without a description', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.type(screen.getByLabelText(/group name/i), 'My Group');
    await user.click(screen.getByRole('button', { name: /create group/i }));
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
  });

  test('shows error when submitting without a location', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.type(screen.getByLabelText(/group name/i), 'My Group');
    await user.type(screen.getByLabelText(/description/i), 'A description');
    await user.click(screen.getByRole('button', { name: /create group/i }));
    expect(screen.getByText(/location is required/i)).toBeInTheDocument();
  });

  test('shows error when submitting without a banner image', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.type(screen.getByLabelText(/group name/i), 'My Group');
    await user.type(screen.getByLabelText(/description/i), 'A description');
    await user.type(screen.getByLabelText(/location/i), 'City');
    await user.click(screen.getByRole('button', { name: /create group/i }));
    expect(screen.getByText(/banner image is required/i)).toBeInTheDocument();
  });

  test('adds a tag when pressing Enter in the tag input', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.type(screen.getByPlaceholderText(/type a tag/i), 'outdoor{Enter}');
    expect(screen.getByText('#outdoor')).toBeInTheDocument();
  });

  test('normalises tags to lowercase', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.type(screen.getByPlaceholderText(/type a tag/i), 'OUTDOOR{Enter}');
    expect(screen.getByText('#outdoor')).toBeInTheDocument();
  });

  test('does not add a duplicate tag', async () => {
    const user = userEvent.setup();
    renderCreate();
    const tagInput = screen.getByPlaceholderText(/type a tag/i);
    await user.type(tagInput, 'outdoor{Enter}');
    await user.type(tagInput, 'outdoor{Enter}');
    expect(screen.getAllByText('#outdoor')).toHaveLength(1);
  });

  test('removes a tag when its remove button is clicked', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.type(screen.getByPlaceholderText(/type a tag/i), 'outdoor{Enter}');
    expect(screen.getByText('#outdoor')).toBeInTheDocument();
    await user.click(screen.getByTitle('Remove tag'));
    expect(screen.queryByText('#outdoor')).not.toBeInTheDocument();
  });

  test('uploads banner and calls createGroup with correct data on valid submit', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/group name/i), 'My Group');
    await user.type(screen.getByLabelText(/description/i), 'A cool group');
    await user.type(screen.getByLabelText(/location/i), 'Vancouver');
    await user.type(screen.getByPlaceholderText(/type a tag/i), 'fun{Enter}');

    const file = new File(['img-bytes'], 'banner.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/banner image/i), file);

    await user.click(screen.getByRole('button', { name: /create group/i }));

    await waitFor(() => {
      expect(vi.mocked(uploadGroupBannerImage)).toHaveBeenCalledWith(file);
      expect(vi.mocked(createGroup)).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Group',
          description: 'A cool group',
          location: 'Vancouver',
          tags: ['fun'],
          bannerImage: 'http://example.com/banner.jpg',
        })
      );
    });
  });

  test('navigates to /groups after successful creation', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/group name/i), 'My Group');
    await user.type(screen.getByLabelText(/description/i), 'A description');
    await user.type(screen.getByLabelText(/location/i), 'City');

    const file = new File(['img'], 'banner.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/banner image/i), file);

    await user.click(screen.getByRole('button', { name: /create group/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/groups'));
  });

  test('shows error message when API call fails', async () => {
    vi.mocked(createGroup).mockRejectedValue(new Error('Server error'));
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/group name/i), 'My Group');
    await user.type(screen.getByLabelText(/description/i), 'A description');
    await user.type(screen.getByLabelText(/location/i), 'City');

    const file = new File(['img'], 'banner.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/banner image/i), file);

    await user.click(screen.getByRole('button', { name: /create group/i }));

    await waitFor(() => expect(screen.getByText(/Server error/)).toBeInTheDocument());
  });

  test('navigates to /groups when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/groups');
  });
});
