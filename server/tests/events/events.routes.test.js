import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import eventsRouter from '../../src/modules/events/events.routes.js';
import { errorHandler } from '../../src/middleware/error-handler.js';
import { User } from '../../src/modules/users/users.model.js';
import { Event } from '../../src/modules/events/events.model.js';

const LOCAL_MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosc360_test';
const JWT_SECRET = process.env.JWT_SECRET || 'development-only-change-me';

const app = express();
app.use(express.json());
app.use('/api/events', eventsRouter);
app.use(errorHandler);

function makeToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, isAdmin: Boolean(user.isAdmin) },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function makeUserData(overrides = {}) {
  return {
    email: `user_${Date.now()}_${Math.random()}@test.com`,
    password: 'hashed_password',
    name: 'Route Test User',
    isAdmin: false,
    ...overrides,
  };
}

function makeEventData(overrides = {}) {
  return {
    title: 'Route Test Event',
    description: 'A route-level test event.',
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
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close(true);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Event.deleteMany({});
});

// --------------------------------------------------------------------------
// GET /api/events
// --------------------------------------------------------------------------
describe('GET /api/events', () => {
  test('returns 200 and an array', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('allows admin to request status=all', async () => {
    const ownerDoc = await User.create(makeUserData());
    const adminDoc = await User.create(makeUserData({ isAdmin: true }));

    await Event.create({ ...makeEventData({ title: 'Upcoming Event' }), userId: ownerDoc._id });
    await Event.create({ ...makeEventData({ title: 'Expired Event', eventDate: new Date(Date.now() - 24 * 60 * 60 * 1000) }), userId: ownerDoc._id });

    const res = await request(app)
      .get('/api/events?status=all')
      .set('Authorization', `Bearer ${makeToken(adminDoc)}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('blocks non-admin from status=expired', async () => {
    const userDoc = await User.create(makeUserData());

    const res = await request(app)
      .get('/api/events?status=expired')
      .set('Authorization', `Bearer ${makeToken(userDoc)}`);

    expect(res.status).toBe(403);
  });

  test('returns 400 for invalid status value', async () => {
    const res = await request(app).get('/api/events?status=not-valid');
    expect(res.status).toBe(400);
  });
});

// --------------------------------------------------------------------------
// GET /api/events/:eventId
// --------------------------------------------------------------------------
describe('GET /api/events/:eventId', () => {
  test('returns 200 and event when id exists', async () => {
    const ownerDoc = await User.create(makeUserData());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const res = await request(app).get(`/api/events/${eventDoc._id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Route Test Event');
  });

  test('returns 404 when id does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/events/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

// --------------------------------------------------------------------------
// POST /api/events
// --------------------------------------------------------------------------
describe('POST /api/events', () => {
  test('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/events').send(makeEventData());
    expect(res.status).toBe(401);
  });

  test('returns 403 for admin user', async () => {
    const adminDoc = await User.create(makeUserData({ isAdmin: true }));

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${makeToken(adminDoc)}`)
      .send(makeEventData());

    expect(res.status).toBe(403);
  });

  test('returns 201 and creates event for regular user', async () => {
    const userDoc = await User.create(makeUserData());

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${makeToken(userDoc)}`)
      .send(makeEventData({ title: 'Created Via Route' }));

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Created Via Route');
    expect(res.body.userId.toString()).toBe(userDoc._id.toString());
  });
});

// --------------------------------------------------------------------------
// PUT /api/events/:eventId
// --------------------------------------------------------------------------
describe('PUT /api/events/:eventId', () => {
  test('returns 200 when owner updates event', async () => {
    const ownerDoc = await User.create(makeUserData());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const res = await request(app)
      .put(`/api/events/${eventDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(ownerDoc)}`)
      .send({ title: 'Owner Updated Event' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Owner Updated Event');
  });

  test('returns 403 when non-owner updates event', async () => {
    const ownerDoc = await User.create(makeUserData());
    const otherDoc = await User.create(makeUserData());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const res = await request(app)
      .put(`/api/events/${eventDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(otherDoc)}`)
      .send({ title: 'Not Allowed Update' });

    expect(res.status).toBe(403);
  });

  test('returns 200 when admin updates event', async () => {
    const ownerDoc = await User.create(makeUserData());
    const adminDoc = await User.create(makeUserData({ isAdmin: true }));
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const res = await request(app)
      .put(`/api/events/${eventDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(adminDoc)}`)
      .send({ title: 'Admin Updated Event' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Admin Updated Event');
  });
});

// --------------------------------------------------------------------------
// DELETE /api/events/:eventId
// --------------------------------------------------------------------------
describe('DELETE /api/events/:eventId', () => {
  test('returns 204 when owner deletes event', async () => {
    const ownerDoc = await User.create(makeUserData());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const res = await request(app)
      .delete(`/api/events/${eventDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(ownerDoc)}`);

    expect(res.status).toBe(204);
  });

  test('returns 403 when non-owner deletes event', async () => {
    const ownerDoc = await User.create(makeUserData());
    const otherDoc = await User.create(makeUserData());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const res = await request(app)
      .delete(`/api/events/${eventDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(otherDoc)}`);

    expect(res.status).toBe(403);
  });

  test('returns 204 when admin deletes event', async () => {
    const ownerDoc = await User.create(makeUserData());
    const adminDoc = await User.create(makeUserData({ isAdmin: true }));
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const res = await request(app)
      .delete(`/api/events/${eventDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(adminDoc)}`);

    expect(res.status).toBe(204);
  });
});

// --------------------------------------------------------------------------
// RSVP routes
// --------------------------------------------------------------------------
describe('POST /api/events/:eventId/attend', () => {
  test('returns 401 without auth token', async () => {
    const ownerDoc = await User.create(makeUserData());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const res = await request(app).post(`/api/events/${eventDoc._id}/attend`);
    expect(res.status).toBe(401);
  });

  test('returns 200 and adds attendee for regular user', async () => {
    const ownerDoc = await User.create(makeUserData());
    const attendeeDoc = await User.create(makeUserData());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const res = await request(app)
      .post(`/api/events/${eventDoc._id}/attend`)
      .set('Authorization', `Bearer ${makeToken(attendeeDoc)}`);

    expect(res.status).toBe(200);
    expect(res.body.attendees.map(String)).toContain(attendeeDoc._id.toString());
  });

  test('returns 403 for admin attendee', async () => {
    const ownerDoc = await User.create(makeUserData());
    const adminDoc = await User.create(makeUserData({ isAdmin: true }));
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const res = await request(app)
      .post(`/api/events/${eventDoc._id}/attend`)
      .set('Authorization', `Bearer ${makeToken(adminDoc)}`);

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/events/:eventId/attend', () => {
  test('returns 200 and removes attendee', async () => {
    const ownerDoc = await User.create(makeUserData());
    const attendeeDoc = await User.create(makeUserData());
    const eventDoc = await Event.create({
      ...makeEventData(),
      userId: ownerDoc._id,
      attendees: [attendeeDoc._id],
    });

    const res = await request(app)
      .delete(`/api/events/${eventDoc._id}/attend`)
      .set('Authorization', `Bearer ${makeToken(attendeeDoc)}`);

    expect(res.status).toBe(200);
    expect(res.body.attendees.map(String)).not.toContain(attendeeDoc._id.toString());
  });

  test('returns 401 without auth token', async () => {
    const ownerDoc = await User.create(makeUserData());
    const eventDoc = await Event.create({ ...makeEventData(), userId: ownerDoc._id });

    const res = await request(app).delete(`/api/events/${eventDoc._id}/attend`);
    expect(res.status).toBe(401);
  });
});
