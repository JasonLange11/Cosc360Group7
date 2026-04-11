import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { User } from '../../src/modules/users/users.model.js';
import { Event } from '../../src/modules/events/events.model.js';
import { fetchEvents } from '../../src/modules/events/events.services.js';

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

describe('events.services scaffold', () => {
  test('fetchEvents returns an array for admin status=all', async () => {
    const events = await fetchEvents({ status: 'all', user: { isAdmin: true } });
    expect(Array.isArray(events)).toBe(true);
  });

  test('event factory helper creates expected shape', () => {
    const event = makeEventData();
    expect(event).toHaveProperty('title');
    expect(event).toHaveProperty('capacity');
  });

  test('user factory helper creates expected shape', () => {
    const user = makeUser();
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
  });
});
