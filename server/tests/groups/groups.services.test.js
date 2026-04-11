import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { User } from '../../src/modules/users/users.model.js';
import { Group } from '../../src/modules/groups/groups.model.js';
import {
  createUserGroup,
  fetchGroups,
  fetchGroupById,
  fetchMyGroups,
  editGroup,
  removeGroup,
  joinGroup,
  leaveGroup,
  fetchGroupMembership,
} from '../../src/modules/groups/groups.services.js';

const LOCAL_MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosc360_test';

const VALID_BANNER = 'https://example.com/banner.jpg';

function makeUser(overrides = {}) {
  return {
    email: `user_${Date.now()}_${Math.random()}@example.com`,
    password: 'hashed_password',
    name: 'Test User',
    isAdmin: false,
    ...overrides,
  };
}

function makeGroupData(overrides = {}) {
  return {
    name: 'Test Group',
    description: 'A group for testing purposes.',
    location: 'Test City',
    tags: ['testing'],
    bannerImage: VALID_BANNER,
    ...overrides,
  };
}

beforeAll(async () => {
  await mongoose.connect(LOCAL_MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close(true);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Group.deleteMany({});
});

// ---------------------------------------------------------------------------
// createUserGroup
// ---------------------------------------------------------------------------
describe('createUserGroup', () => {
  test('creates a group for an authenticated user', async () => {
    const userDoc = await User.create(makeUser());
    const user = { id: userDoc._id.toString(), isAdmin: false };

    const group = await createUserGroup(user, makeGroupData());

    expect(group.name).toBe('Test Group');
    expect(group.location).toBe('Test City');
    expect(group.userId.toString()).toBe(user.id);
    expect(group.members.map(String)).toContain(user.id);
  });

  test('throws when no user is provided', async () => {
    await expect(createUserGroup(null, makeGroupData())).rejects.toThrow('Authentication required');
  });

  test('throws when the user is an admin', async () => {
    const userDoc = await User.create(makeUser({ isAdmin: true }));
    const user = { id: userDoc._id.toString(), isAdmin: true };

    await expect(createUserGroup(user, makeGroupData())).rejects.toThrow('Admins can not create groups');
  });

  test('throws when required fields are missing', async () => {
    const userDoc = await User.create(makeUser());
    const user = { id: userDoc._id.toString(), isAdmin: false };

    await expect(createUserGroup(user, { tags: ['test'], bannerImage: VALID_BANNER })).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// fetchGroups
// ---------------------------------------------------------------------------
describe('fetchGroups', () => {
  test('returns an empty array when there are no groups', async () => {
    const groups = await fetchGroups();
    expect(groups).toEqual([]);
  });

  test('returns all groups with organizerName attached', async () => {
    const userDoc = await User.create(makeUser({ name: 'Alice' }));
    await Group.create({ ...makeGroupData(), userId: userDoc._id, members: [userDoc._id] });

    const groups = await fetchGroups();

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Test Group');
    expect(groups[0].organizerName).toBe('Alice');
  });
});

// ---------------------------------------------------------------------------
// fetchGroupById
// ---------------------------------------------------------------------------
describe('fetchGroupById', () => {
  test('returns the group with organizerName when found', async () => {
    const userDoc = await User.create(makeUser({ name: 'Bob' }));
    const groupDoc = await Group.create({ ...makeGroupData(), userId: userDoc._id, members: [userDoc._id] });

    const group = await fetchGroupById(groupDoc._id.toString());

    expect(group.name).toBe('Test Group');
    expect(group.organizerName).toBe('Bob');
  });

  test('throws "Group not found" for a non-existent id', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(fetchGroupById(fakeId)).rejects.toThrow('Group not found');
  });
});

// ---------------------------------------------------------------------------
// fetchMyGroups
// ---------------------------------------------------------------------------
describe('fetchMyGroups', () => {
  test('returns groups created by the given user', async () => {
    const userDoc = await User.create(makeUser());
    const otherDoc = await User.create(makeUser());

    await Group.create({ ...makeGroupData({ name: 'My Group' }), userId: userDoc._id, members: [userDoc._id] });
    await Group.create({ ...makeGroupData({ name: 'Other Group' }), userId: otherDoc._id, members: [otherDoc._id] });

    const user = { id: userDoc._id.toString() };
    const groups = await fetchMyGroups(user);

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('My Group');
  });

  test('throws when no user is provided', async () => {
    await expect(fetchMyGroups(null)).rejects.toThrow('Authentication required');
  });
});

// ---------------------------------------------------------------------------
// editGroup
// ---------------------------------------------------------------------------
describe('editGroup', () => {
  test('allows the owner to update a group', async () => {
    const userDoc = await User.create(makeUser());
    const groupDoc = await Group.create({ ...makeGroupData(), userId: userDoc._id, members: [userDoc._id] });
    const user = { id: userDoc._id.toString(), isAdmin: false };

    const updated = await editGroup(user, groupDoc._id.toString(), { name: 'Renamed Group' });

    expect(updated.name).toBe('Renamed Group');
  });

  test('allows an admin to update any group', async () => {
    const ownerDoc = await User.create(makeUser());
    const adminDoc = await User.create(makeUser({ isAdmin: true }));
    const groupDoc = await Group.create({ ...makeGroupData(), userId: ownerDoc._id, members: [ownerDoc._id] });
    const admin = { id: adminDoc._id.toString(), isAdmin: true };

    const updated = await editGroup(admin, groupDoc._id.toString(), { name: 'Admin Renamed' });

    expect(updated.name).toBe('Admin Renamed');
  });

  test('throws Forbidden when a non-owner non-admin tries to update', async () => {
    const ownerDoc = await User.create(makeUser());
    const otherDoc = await User.create(makeUser());
    const groupDoc = await Group.create({ ...makeGroupData(), userId: ownerDoc._id, members: [ownerDoc._id] });
    const other = { id: otherDoc._id.toString(), isAdmin: false };

    await expect(editGroup(other, groupDoc._id.toString(), { name: 'Hacked' })).rejects.toThrow('Forbidden');
  });

  test('throws "Group not found" for a non-existent id', async () => {
    const userDoc = await User.create(makeUser());
    const user = { id: userDoc._id.toString(), isAdmin: false };
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(editGroup(user, fakeId, { name: 'Ghost' })).rejects.toThrow('Group not found');
  });
});

// ---------------------------------------------------------------------------
// removeGroup
// ---------------------------------------------------------------------------
describe('removeGroup', () => {
  test('allows the owner to delete their group', async () => {
    const userDoc = await User.create(makeUser());
    const groupDoc = await Group.create({ ...makeGroupData(), userId: userDoc._id, members: [userDoc._id] });
    const user = { id: userDoc._id.toString(), isAdmin: false };

    await removeGroup(user, groupDoc._id.toString());

    const found = await Group.findById(groupDoc._id);
    expect(found).toBeNull();
  });

  test('throws Forbidden when a non-owner tries to delete', async () => {
    const ownerDoc = await User.create(makeUser());
    const otherDoc = await User.create(makeUser());
    const groupDoc = await Group.create({ ...makeGroupData(), userId: ownerDoc._id, members: [ownerDoc._id] });
    const other = { id: otherDoc._id.toString(), isAdmin: false };

    await expect(removeGroup(other, groupDoc._id.toString())).rejects.toThrow('Forbidden');
  });

  test('throws "Group not found" for a non-existent id', async () => {
    const userDoc = await User.create(makeUser());
    const user = { id: userDoc._id.toString(), isAdmin: false };
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(removeGroup(user, fakeId)).rejects.toThrow('Group not found');
  });
});

// ---------------------------------------------------------------------------
// joinGroup / leaveGroup
// ---------------------------------------------------------------------------
describe('joinGroup', () => {
  test('adds the user to the group members list', async () => {
    const ownerDoc = await User.create(makeUser());
    const joinerDoc = await User.create(makeUser());
    const groupDoc = await Group.create({ ...makeGroupData(), userId: ownerDoc._id, members: [ownerDoc._id] });
    const joiner = { id: joinerDoc._id.toString(), isAdmin: false };

    const result = await joinGroup(joiner, groupDoc._id.toString());

    const memberIds = result.members.map(String);
    expect(memberIds).toContain(joinerDoc._id.toString());
  });

  test('does not add duplicates when user is already a member', async () => {
    const userDoc = await User.create(makeUser());
    const groupDoc = await Group.create({ ...makeGroupData(), userId: userDoc._id, members: [userDoc._id] });
    const user = { id: userDoc._id.toString(), isAdmin: false };

    const result = await joinGroup(user, groupDoc._id.toString());
    const memberIds = result.members.map(String);

    expect(memberIds.filter((id) => id === user.id)).toHaveLength(1);
  });

  test('throws when no user is provided', async () => {
    const ownerDoc = await User.create(makeUser());
    const groupDoc = await Group.create({ ...makeGroupData(), userId: ownerDoc._id, members: [ownerDoc._id] });

    await expect(joinGroup(null, groupDoc._id.toString())).rejects.toThrow('Authentication required');
  });

  test('throws when an admin tries to join', async () => {
    const ownerDoc = await User.create(makeUser());
    const adminDoc = await User.create(makeUser({ isAdmin: true }));
    const groupDoc = await Group.create({ ...makeGroupData(), userId: ownerDoc._id, members: [ownerDoc._id] });
    const admin = { id: adminDoc._id.toString(), isAdmin: true };

    await expect(joinGroup(admin, groupDoc._id.toString())).rejects.toThrow('Admins cannot join groups');
  });

  test('throws "Group not found" for a non-existent id', async () => {
    const userDoc = await User.create(makeUser());
    const user = { id: userDoc._id.toString(), isAdmin: false };
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(joinGroup(user, fakeId)).rejects.toThrow('Group not found');
  });
});

describe('leaveGroup', () => {
  test('removes the user from the group members list', async () => {
    const ownerDoc = await User.create(makeUser());
    const memberDoc = await User.create(makeUser());
    const groupDoc = await Group.create({
      ...makeGroupData(),
      userId: ownerDoc._id,
      members: [ownerDoc._id, memberDoc._id],
    });
    const member = { id: memberDoc._id.toString(), isAdmin: false };

    const result = await leaveGroup(member, groupDoc._id.toString());
    const memberIds = result.members.map(String);

    expect(memberIds).not.toContain(memberDoc._id.toString());
  });

  test('throws when no user is provided', async () => {
    const ownerDoc = await User.create(makeUser());
    const groupDoc = await Group.create({ ...makeGroupData(), userId: ownerDoc._id, members: [ownerDoc._id] });

    await expect(leaveGroup(null, groupDoc._id.toString())).rejects.toThrow('Authentication required');
  });

  test('throws "Group not found" for a non-existent id', async () => {
    const userDoc = await User.create(makeUser());
    const user = { id: userDoc._id.toString(), isAdmin: false };
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(leaveGroup(user, fakeId)).rejects.toThrow('Group not found');
  });
});

// ---------------------------------------------------------------------------
// fetchGroupMembership
// ---------------------------------------------------------------------------
describe('fetchGroupMembership', () => {
  test('returns groups the user is a member of', async () => {
    const userDoc = await User.create(makeUser());
    const otherDoc = await User.create(makeUser());
    await Group.create({ ...makeGroupData({ name: 'Member Group' }), userId: userDoc._id, members: [userDoc._id] });
    await Group.create({ ...makeGroupData({ name: 'Non-Member Group' }), userId: otherDoc._id, members: [otherDoc._id] });

    const user = { id: userDoc._id.toString() };
    const groups = await fetchGroupMembership(user);

    expect(groups.map((g) => g.name)).toContain('Member Group');
    expect(groups.map((g) => g.name)).not.toContain('Non-Member Group');
  });

  test('throws when no user is provided', async () => {
    await expect(fetchGroupMembership(null)).rejects.toThrow('Authentication required');
  });
});
