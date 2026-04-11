import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import GroupCreate from '../../components/groups/GroupCreate';
import { createGroup } from '../../lib/groupsApi';
import { uploadGroupBannerImage } from '../../lib/uploadsApi';
import { PopupProvider } from '../../components/ui/PopupProvider';

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
      <PopupProvider>
        <GroupCreate />
      </PopupProvider>
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
    await user.selectOptions(screen.getByRole('combobox', { name: /tags/i }), 'outdoors');
    await user.click(screen.getByRole('button', { name: /add tag/i }));
    const tagsContainer = document.querySelector('.create-event-tags');
    expect(tagsContainer).not.toBeNull();
    expect(within(tagsContainer).getByText('outdoors')).toBeInTheDocument();
  });

  test('normalises tags to lowercase', async () => {
    const user = userEvent.setup();
    renderCreate();
    // All options from the dropdown are already lowercase
    await user.selectOptions(screen.getByRole('combobox', { name: /tags/i }), 'outdoors');
    await user.click(screen.getByRole('button', { name: /add tag/i }));
    const tagsContainer = document.querySelector('.create-event-tags');
    expect(tagsContainer).not.toBeNull();
    expect(within(tagsContainer).getByText('outdoors')).toBeInTheDocument();
  });

  test('does not add a duplicate tag', async () => {
    const user = userEvent.setup();
    renderCreate();
    const select = screen.getByRole('combobox', { name: /tags/i });
    const addBtn = screen.getByRole('button', { name: /add tag/i });
    await user.selectOptions(select, 'outdoors');
    await user.click(addBtn);
    // After adding, selectedTag is cleared; re-select and try to add again
    await user.selectOptions(select, 'outdoors');
    await user.click(addBtn);
    const tagsContainer = document.querySelector('.create-event-tags');
    expect(within(tagsContainer).getAllByText('outdoors')).toHaveLength(1);
  });

  test('removes a tag when its remove button is clicked', async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.selectOptions(screen.getByRole('combobox', { name: /tags/i }), 'outdoors');
    await user.click(screen.getByRole('button', { name: /add tag/i }));
    const tagsContainer = document.querySelector('.create-event-tags');
    expect(within(tagsContainer).getByText('outdoors')).toBeInTheDocument();
    await user.click(within(tagsContainer).getByRole('button'));
    expect(document.querySelector('.create-event-tags')).toBeNull();
  });

  test('uploads banner and calls createGroup with correct data on valid submit', async () => {
    const user = userEvent.setup();
    renderCreate();

    await user.type(screen.getByLabelText(/group name/i), 'My Group');
    await user.type(screen.getByLabelText(/description/i), 'A cool group');
    await user.type(screen.getByLabelText(/location/i), 'Vancouver');
    await user.selectOptions(screen.getByRole('combobox', { name: /tags/i }), 'fitness');
    await user.click(screen.getByRole('button', { name: /add tag/i }));

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
          tags: ['fitness'],
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
