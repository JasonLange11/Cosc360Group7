import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import groupsRouter from '../../src/modules/groups/groups.routes.js';
import { errorHandler } from '../../src/middleware/error-handler.js';
import { User } from '../../src/modules/users/users.model.js';
import { Group } from '../../src/modules/groups/groups.model.js';

// --------------------------------------------------------------------------
// App setup (no DB connection — uses the mongoose connection from beforeAll)
// --------------------------------------------------------------------------
const app = express();
app.use(express.json());
app.use('/api/groups', groupsRouter);
app.use(errorHandler);

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'development-only-change-me';
const VALID_BANNER = 'https://example.com/banner.jpg';

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
    password: 'hashed_pw',
    name: 'Route Test User',
    isAdmin: false,
    ...overrides,
  };
}

function makeGroupPayload(overrides = {}) {
  return {
    name: 'Route Test Group',
    description: 'A group created during route testing.',
    location: 'Test City',
    tags: ['test'],
    bannerImage: VALID_BANNER,
    ...overrides,
  };
}

// --------------------------------------------------------------------------
// DB lifecycle
// --------------------------------------------------------------------------
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Group.deleteMany({});
});

// --------------------------------------------------------------------------
// GET /api/groups
// --------------------------------------------------------------------------
describe('GET /api/groups', () => {
  test('returns 200 and an empty array when there are no groups', async () => {
    const res = await request(app).get('/api/groups');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  test('returns 200 and the list of groups', async () => {
    const userDoc = await User.create(makeUserData());
    await Group.create({ ...makeGroupPayload(), userId: userDoc._id, members: [userDoc._id] });

    const res = await request(app).get('/api/groups');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Route Test Group');
  });
});

// --------------------------------------------------------------------------
// GET /api/groups/mine
// --------------------------------------------------------------------------
describe('GET /api/groups/mine', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).get('/api/groups/mine');
    expect(res.status).toBe(401);
  });

  test('returns 200 and only the authenticated user\'s groups', async () => {
    const ownerDoc = await User.create(makeUserData());
    const otherDoc = await User.create(makeUserData());
    await Group.create({ ...makeGroupPayload({ name: 'My Group' }), userId: ownerDoc._id, members: [ownerDoc._id] });
    await Group.create({ ...makeGroupPayload({ name: 'Other Group' }), userId: otherDoc._id, members: [otherDoc._id] });

    const res = await request(app)
      .get('/api/groups/mine')
      .set('Authorization', `Bearer ${makeToken(ownerDoc)}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('My Group');
  });
});

// --------------------------------------------------------------------------
// GET /api/groups/membership
// --------------------------------------------------------------------------
describe('GET /api/groups/membership', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).get('/api/groups/membership');
    expect(res.status).toBe(401);
  });

  test('returns 200 and groups the user has joined', async () => {
    const userDoc = await User.create(makeUserData());
    const otherDoc = await User.create(makeUserData());
    await Group.create({ ...makeGroupPayload({ name: 'Joined Group' }), userId: otherDoc._id, members: [otherDoc._id, userDoc._id] });
    await Group.create({ ...makeGroupPayload({ name: 'Not Joined' }), userId: otherDoc._id, members: [otherDoc._id] });

    const res = await request(app)
      .get('/api/groups/membership')
      .set('Authorization', `Bearer ${makeToken(userDoc)}`);

    expect(res.status).toBe(200);
    const names = res.body.map((g) => g.name);
    expect(names).toContain('Joined Group');
    expect(names).not.toContain('Not Joined');
  });
});

// --------------------------------------------------------------------------
// GET /api/groups/:groupId
// --------------------------------------------------------------------------
describe('GET /api/groups/:groupId', () => {
  test('returns 200 and the group when it exists', async () => {
    const userDoc = await User.create(makeUserData());
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: userDoc._id, members: [userDoc._id] });

    const res = await request(app).get(`/api/groups/${groupDoc._id}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Route Test Group');
  });

  test('returns 404 when the group does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/groups/${fakeId}`);

    expect(res.status).toBe(404);
  });
});

// --------------------------------------------------------------------------
// POST /api/groups/search
// --------------------------------------------------------------------------
describe('POST /api/groups/search', () => {
  test('returns 200 and matching groups by name', async () => {
    const userDoc = await User.create(makeUserData());
    await Group.create({ ...makeGroupPayload({ name: 'Hiking Club' }), userId: userDoc._id, members: [userDoc._id] });
    await Group.create({ ...makeGroupPayload({ name: 'Book Club' }), userId: userDoc._id, members: [userDoc._id] });

    const res = await request(app).post('/api/groups/search').send({ searchTerm: 'hiking' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Hiking Club');
  });

  test('returns all groups when searchTerm is empty', async () => {
    const userDoc = await User.create(makeUserData());
    await Group.create({ ...makeGroupPayload(), userId: userDoc._id, members: [userDoc._id] });
    await Group.create({ ...makeGroupPayload({ name: 'Second Group' }), userId: userDoc._id, members: [userDoc._id] });

    const res = await request(app).post('/api/groups/search').send({ searchTerm: '' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

// --------------------------------------------------------------------------
// POST /api/groups
// --------------------------------------------------------------------------
describe('POST /api/groups', () => {
  test('returns 401 when no token is provided', async () => {
    const res = await request(app).post('/api/groups').send(makeGroupPayload());
    expect(res.status).toBe(401);
  });

  test('returns 403 when an admin tries to create a group', async () => {
    const adminDoc = await User.create(makeUserData({ isAdmin: true }));

    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${makeToken(adminDoc)}`)
      .send(makeGroupPayload());

    expect(res.status).toBe(403);
  });

  test('returns 201 and the new group when a regular user creates one', async () => {
    const userDoc = await User.create(makeUserData());

    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${makeToken(userDoc)}`)
      .send(makeGroupPayload());

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Route Test Group');
    expect(res.body.members.map(String)).toContain(userDoc._id.toString());
  });
});

// --------------------------------------------------------------------------
// PUT /api/groups/:groupId
// --------------------------------------------------------------------------
describe('PUT /api/groups/:groupId', () => {
  test('returns 401 when no token is provided', async () => {
    const userDoc = await User.create(makeUserData());
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: userDoc._id, members: [userDoc._id] });

    const res = await request(app).put(`/api/groups/${groupDoc._id}`).send({ name: 'Updated' });
    expect(res.status).toBe(401);
  });

  test('returns 403 when a non-owner tries to update', async () => {
    const ownerDoc = await User.create(makeUserData());
    const otherDoc = await User.create(makeUserData());
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: ownerDoc._id, members: [ownerDoc._id] });

    const res = await request(app)
      .put(`/api/groups/${groupDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(otherDoc)}`)
      .send({ name: 'Hacked' });

    expect(res.status).toBe(403);
  });

  test('returns 200 and updated group when called by the owner', async () => {
    const userDoc = await User.create(makeUserData());
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: userDoc._id, members: [userDoc._id] });

    const res = await request(app)
      .put(`/api/groups/${groupDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(userDoc)}`)
      .send({ name: 'Renamed Group' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Renamed Group');
  });

  test('returns 200 when an admin updates any group', async () => {
    const ownerDoc = await User.create(makeUserData());
    const adminDoc = await User.create(makeUserData({ isAdmin: true }));
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: ownerDoc._id, members: [ownerDoc._id] });

    const res = await request(app)
      .put(`/api/groups/${groupDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(adminDoc)}`)
      .send({ name: 'Admin Update' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Admin Update');
  });

  test('returns 404 for a non-existent group', async () => {
    const userDoc = await User.create(makeUserData());
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .put(`/api/groups/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken(userDoc)}`)
      .send({ name: 'Ghost Update' });

    expect(res.status).toBe(404);
  });
});

// --------------------------------------------------------------------------
// DELETE /api/groups/:groupId
// --------------------------------------------------------------------------
describe('DELETE /api/groups/:groupId', () => {
  test('returns 401 when no token is provided', async () => {
    const userDoc = await User.create(makeUserData());
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: userDoc._id, members: [userDoc._id] });

    const res = await request(app).delete(`/api/groups/${groupDoc._id}`);
    expect(res.status).toBe(401);
  });

  test('returns 403 when a non-owner tries to delete', async () => {
    const ownerDoc = await User.create(makeUserData());
    const otherDoc = await User.create(makeUserData());
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: ownerDoc._id, members: [ownerDoc._id] });

    const res = await request(app)
      .delete(`/api/groups/${groupDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(otherDoc)}`);

    expect(res.status).toBe(403);
  });

  test('returns 204 and deletes the group when called by the owner', async () => {
    const userDoc = await User.create(makeUserData());
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: userDoc._id, members: [userDoc._id] });

    const res = await request(app)
      .delete(`/api/groups/${groupDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(userDoc)}`);

    expect(res.status).toBe(204);

    const found = await Group.findById(groupDoc._id);
    expect(found).toBeNull();
  });

  test('returns 204 when an admin deletes any group', async () => {
    const ownerDoc = await User.create(makeUserData());
    const adminDoc = await User.create(makeUserData({ isAdmin: true }));
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: ownerDoc._id, members: [ownerDoc._id] });

    const res = await request(app)
      .delete(`/api/groups/${groupDoc._id}`)
      .set('Authorization', `Bearer ${makeToken(adminDoc)}`);

    expect(res.status).toBe(204);
  });

  test('returns 404 for a non-existent group', async () => {
    const userDoc = await User.create(makeUserData());
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/groups/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken(userDoc)}`);

    expect(res.status).toBe(404);
  });
});

// --------------------------------------------------------------------------
// POST /api/groups/:groupId/join
// --------------------------------------------------------------------------
describe('POST /api/groups/:groupId/join', () => {
  test('returns 401 when no token is provided', async () => {
    const ownerDoc = await User.create(makeUserData());
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: ownerDoc._id, members: [ownerDoc._id] });

    const res = await request(app).post(`/api/groups/${groupDoc._id}/join`);
    expect(res.status).toBe(401);
  });

  test('returns 403 when an admin tries to join', async () => {
    const ownerDoc = await User.create(makeUserData());
    const adminDoc = await User.create(makeUserData({ isAdmin: true }));
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: ownerDoc._id, members: [ownerDoc._id] });

    const res = await request(app)
      .post(`/api/groups/${groupDoc._id}/join`)
      .set('Authorization', `Bearer ${makeToken(adminDoc)}`);

    expect(res.status).toBe(403);
  });

  test('returns 200 and adds the user to members', async () => {
    const ownerDoc = await User.create(makeUserData());
    const joinerDoc = await User.create(makeUserData());
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: ownerDoc._id, members: [ownerDoc._id] });

    const res = await request(app)
      .post(`/api/groups/${groupDoc._id}/join`)
      .set('Authorization', `Bearer ${makeToken(joinerDoc)}`);

    expect(res.status).toBe(200);
    expect(res.body.members.map(String)).toContain(joinerDoc._id.toString());
  });
});

// --------------------------------------------------------------------------
// DELETE /api/groups/:groupId/leave
// --------------------------------------------------------------------------
describe('DELETE /api/groups/:groupId/leave', () => {
  test('returns 401 when no token is provided', async () => {
    const ownerDoc = await User.create(makeUserData());
    const groupDoc = await Group.create({ ...makeGroupPayload(), userId: ownerDoc._id, members: [ownerDoc._id] });

    const res = await request(app).delete(`/api/groups/${groupDoc._id}/leave`);
    expect(res.status).toBe(401);
  });

  test('returns 200 and removes the user from members', async () => {
    const ownerDoc = await User.create(makeUserData());
    const memberDoc = await User.create(makeUserData());
    const groupDoc = await Group.create({
      ...makeGroupPayload(),
      userId: ownerDoc._id,
      members: [ownerDoc._id, memberDoc._id],
    });

    const res = await request(app)
      .delete(`/api/groups/${groupDoc._id}/leave`)
      .set('Authorization', `Bearer ${makeToken(memberDoc)}`);

    expect(res.status).toBe(200);
    expect(res.body.members.map(String)).not.toContain(memberDoc._id.toString());
  });
});
