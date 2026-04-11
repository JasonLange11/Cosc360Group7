import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { User } from '../../src/modules/users/users.model.js';
import { Event } from '../../src/modules/events/events.model.js';
import {
  createUserEvent,
  fetchEvents,
  fetchEventById,
  editEvent,
  removeEvent,
  attendEvent,
  unattendEvent,
} from '../../src/modules/events/events.services.js';

const LOCAL_MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosc360_test';

function makeUser(overrides = {}) {
  return {
    email: `user_${Date.now()}_${Math.random()}@example.com`,
    password: 'hashed_password',
    name: 'Event Test User',
    isAdmin: false,
    ...overrides,
  };
}

function makeEventData(overrides = {}) {
  return {
    title: 'Test Event',
    description: 'A test event.',
    eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    eventTime: '18:00',
    location: 'Test City',
    capacity: 50,
    cost: 0,
    bannerImage: 'https://example.com/event-banner.jpg',
    tags: ['test'],
    ...overrides,
  };
}

beforeAll(async () => {
  await mongoose.connect(LOCAL_MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close(true);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Event.deleteMany({});
});

// ---------------------------------------------------------------------------
// createUserEvent
// ---------------------------------------------------------------------------
describe('createUserEvent', () => {
  test('creates an event for an authenticated non-admin user', async () => {
    const userDoc = await User.create(makeUser());
    const user = { id: userDoc._id.toString(), isAdmin: false };

    const event = await createUserEvent(user, makeEventData({ title: 'Created Event' }));

    expect(event.title).toBe('Created Event');
    expect(event.userId.toString()).toBe(user.id);
  });

  test('normalizes tags to lowercase and removes duplicates', async () => {
    const userDoc = await User.create(makeUser());
    const user = { id: userDoc._id.toString(), isAdmin: false };

    const event = await createUserEvent(user, makeEventData({ tags: ['Music', 'music', ' Social '] }));

    expect(event.tags).toEqual(['music', 'social']);
  });

  test('throws when no user is provided', async () => {
    await expect(createUserEvent(null, makeEventData())).rejects.toThrow('Authentication required');
  });

  test('throws when user is an admin', async () => {
    const adminDoc = await User.create(makeUser({ isAdmin: true }));
    const admin = { id: adminDoc._id.toString(), isAdmin: true };

    await expect(createUserEvent(admin, makeEventData())).rejects.toThrow('Admins can not create events');
  });

  test('throws when capacity is out of range', async () => {
    const userDoc = await User.create(makeUser());
    const user = { id: userDoc._id.toString(), isAdmin: false };

    await expect(createUserEvent(user, makeEventData({ capacity: 0 }))).rejects.toThrow('Capacity must be between 1 and 10000');
  });
});

// ---------------------------------------------------------------------------
// fetchEvents / fetchEventById
// ---------------------------------------------------------------------------
describe('fetchEvents', () => {
  test('returns upcoming events for non-admin by default', async () => {
    const userDoc = await User.create(makeUser({ name: 'Organizer' }));

    await Event.create({ ...makeEventData({ title: 'Future Event' }), userId: userDoc._id });
    await Event.create({ ...makeEventData({ title: 'Past Event', eventDate: new Date(Date.now() - 24 * 60 * 60 * 1000) }), userId: userDoc._id });

    const events = await fetchEvents({ user: { id: userDoc._id.toString(), isAdmin: false } });
    const titles = events.map((event) => event.title);

    expect(titles).toContain('Future Event');
    expect(titles).not.toContain('Past Event');
  });

  test('allows admin to fetch all events', async () => {
    const userDoc = await User.create(makeUser());

    await Event.create({ ...makeEventData({ title: 'Upcoming Admin View' }), userId: userDoc._id });
    await Event.create({ ...makeEventData({ title: 'Expired Admin View', eventDate: new Date(Date.now() - 24 * 60 * 60 * 1000) }), userId: userDoc._id });

    const events = await fetchEvents({ status: 'all', user: { isAdmin: true } });
    const titles = events.map((event) => event.title);

    expect(titles).toContain('Upcoming Admin View');
    expect(titles).toContain('Expired Admin View');
  });

  test('throws when non-admin requests expired events', async () => {
    await expect(fetchEvents({ status: 'expired', user: { isAdmin: false } })).rejects.toThrow('Admin access required');
  });

  test('throws on invalid status value', async () => {
    await expect(fetchEvents({ status: 'invalid-status', user: { isAdmin: true } })).rejects.toThrow('Invalid event status');
  });
});

describe('fetchEventById', () => {
  test('returns an event with organizerName', async () => {
    const userDoc = await User.create(makeUser({ name: 'Alice Organizer' }));
    const eventDoc = await Event.create({ ...makeEventData(), userId: userDoc._id });

    const event = await fetchEventById(eventDoc._id.toString());

    expect(event.title).toBe('Test Event');
    expect(event.organizerName).toBe('Alice Organizer');
  });

  test('throws when event id is not found', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(fetchEventById(fakeId)).rejects.toThrow('Event not found');
  });
});

// ---------------------------------------------------------------------------
// editEvent / removeEvent
// ---------------------------------------------------------------------------
describe('editEvent', () => {
  test('allows the owner to edit their event', async () => {
    const ownerDoc = await User.create(makeUser());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });
    const owner = { id: ownerDoc._id.toString(), isAdmin: false };

    const updated = await editEvent(owner, eventDoc._id.toString(), { title: 'Renamed Event' });

    expect(updated.title).toBe('Renamed Event');
  });

  test('throws Forbidden for non-owner non-admin', async () => {
    const ownerDoc = await User.create(makeUser());
    const otherDoc = await User.create(makeUser());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    await expect(editEvent({ id: otherDoc._id.toString(), isAdmin: false }, eventDoc._id.toString(), { title: 'Hacked Title' })).rejects.toThrow('Forbidden');
  });

  test('throws when invalid capacity update is provided', async () => {
    const ownerDoc = await User.create(makeUser());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    await expect(editEvent({ id: ownerDoc._id.toString(), isAdmin: false }, eventDoc._id.toString(), { capacity: 10001 })).rejects.toThrow('Capacity must be between 1 and 10000');
  });
});

describe('removeEvent', () => {
  test('allows owner to remove event', async () => {
    const ownerDoc = await User.create(makeUser());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    await removeEvent({ id: ownerDoc._id.toString(), isAdmin: false }, eventDoc._id.toString());

    const found = await Event.findById(eventDoc._id);
    expect(found).toBeNull();
  });

  test('throws Forbidden when non-owner tries to remove event', async () => {
    const ownerDoc = await User.create(makeUser());
    const otherDoc = await User.create(makeUser());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    await expect(removeEvent({ id: otherDoc._id.toString(), isAdmin: false }, eventDoc._id.toString())).rejects.toThrow('Forbidden');
  });
});

// ---------------------------------------------------------------------------
// attendEvent / unattendEvent
// ---------------------------------------------------------------------------
describe('attendEvent', () => {
  test('adds attendee when user is not already attending', async () => {
    const ownerDoc = await User.create(makeUser({ name: 'Owner' }));
    const attendeeDoc = await User.create(makeUser({ name: 'Attendee' }));
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const updated = await attendEvent({ id: attendeeDoc._id.toString(), isAdmin: false }, eventDoc._id.toString());
    const attendeeIds = updated.attendees.map(String);

    expect(attendeeIds).toContain(attendeeDoc._id.toString());
  });

  test('does not add duplicate attendee entries', async () => {
    const ownerDoc = await User.create(makeUser());
    const attendeeDoc = await User.create(makeUser());
    const eventDoc = await Event.create({
      ...makeEventData(),
      userId: ownerDoc._id,
      attendees: [attendeeDoc._id],
    });

    const updated = await attendEvent({ id: attendeeDoc._id.toString(), isAdmin: false }, eventDoc._id.toString());
    const attendeeIds = updated.attendees.map(String);

    expect(attendeeIds.filter((id) => id === attendeeDoc._id.toString())).toHaveLength(1);
  });

  test('throws when admin tries to RSVP', async () => {
    const ownerDoc = await User.create(makeUser());
    const adminDoc = await User.create(makeUser({ isAdmin: true }));
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    await expect(attendEvent({ id: adminDoc._id.toString(), isAdmin: true }, eventDoc._id.toString())).rejects.toThrow('Admins cannot RSVP to events');
  });

  test('throws when trying to attend expired event', async () => {
    const ownerDoc = await User.create(makeUser());
    const attendeeDoc = await User.create(makeUser());
    const eventDoc = await Event.create({
      ...makeEventData({ eventDate: new Date(Date.now() - 24 * 60 * 60 * 1000) }),
      userId: ownerDoc._id,
    });

    await expect(attendEvent({ id: attendeeDoc._id.toString(), isAdmin: false }, eventDoc._id.toString())).rejects.toThrow('Cannot register for an expired event');
  });
});

describe('unattendEvent', () => {
  test('removes attendee from event', async () => {
    const ownerDoc = await User.create(makeUser());
    const attendeeDoc = await User.create(makeUser());
    const eventDoc = await Event.create({
      ...makeEventData(),
      userId: ownerDoc._id,
      attendees: [attendeeDoc._id],
    });

    const updated = await unattendEvent({ id: attendeeDoc._id.toString(), isAdmin: false }, eventDoc._id.toString());
    const attendeeIds = updated.attendees.map(String);

    expect(attendeeIds).not.toContain(attendeeDoc._id.toString());
  });

  test('throws when no user is provided', async () => {
    const ownerDoc = await User.create(makeUser());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    await expect(unattendEvent(null, eventDoc._id.toString())).rejects.toThrow('Authentication required');
  });
});
