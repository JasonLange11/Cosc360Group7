import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import eventsRouter from '../../src/modules/events/events.routes.js';
import { errorHandler } from '../../src/middleware/error-handler.js';
import { User } from '../../src/modules/users/users.model.js';
import { Event } from '../../src/modules/events/events.model.js';

const LOCAL_MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosc360_test';

const app = express();
app.use(express.json());
app.use('/api/events', eventsRouter);
app.use(errorHandler);

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

describe('events.routes scaffold', () => {
  test('GET /api/events returns 200 and array', async () => {
    const response = await request(app).get('/api/events');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
