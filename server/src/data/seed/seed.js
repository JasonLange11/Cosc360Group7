import "dotenv/config";
import { readFile } from "node:fs/promises";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "../db/connection.js";
import { User } from "../../modules/users/users.model.js";
import { Event } from "../../modules/events/events.model.js";
import { Group } from "../../modules/groups/groups.model.js";
import { Comment } from "../../modules/comments/comments.model.js";

const SALT_ROUNDS = 10;
const EVENT_COMMENT_TEMPLATES = [
	(title) => `I already RSVP'd for ${title}. This looks like one of the best events on the calendar.`,
	(title) => `${title} sounds great. I am planning to bring a friend from class.`,
	(title) => `Really excited for ${title}. The time and location work perfectly for me.`,
];
const GROUP_COMMENT_TEMPLATES = [
	(name) => `${name} already feels active. Looking forward to seeing more people join in.`,
	(name) => `Glad this group exists. ${name} seems like an easy way to meet people with similar interests.`,
	(name) => `I joined ${name} for the conversations and upcoming meetups.`,
];

async function readJson(relativePath) {
	const fileUrl = new URL(relativePath, import.meta.url);
	const raw = await readFile(fileUrl, "utf-8");
	return JSON.parse(raw);
}

async function seedUsers(usersData) {
	const usersWithHashedPasswords = await Promise.all(
		usersData.map(async (user) => ({
			email: user.email,
			name: user.name,
			password: await bcrypt.hash(user.password, SALT_ROUNDS),
			isAdmin: Boolean(user.isAdmin),
			isDisabled: Boolean(user.isDisabled),
		}))
	);

	await User.deleteMany({});
	const insertedUsers = await User.insertMany(usersWithHashedPasswords);

	const userIdByEmail = new Map();
	const usersById = new Map();
	insertedUsers.forEach((user) => {
		userIdByEmail.set(user.email, user._id);
		usersById.set(user._id.toString(), user);
	});

	return {
		userIdByEmail,
		usersById,
		regularUsers: insertedUsers.filter((user) => !user.isAdmin && !user.isDisabled),
	};
}

function uniqueObjectIds(ids) {
	const seen = new Set();

	return ids.filter((id) => {
		if (!id) {
			return false;
		}

		const key = id.toString();
		if (seen.has(key)) {
			return false;
		}

		seen.add(key);
		return true;
	});
}

function selectRotatingUsers(users, count, offset = 0) {
	if (!Array.isArray(users) || users.length === 0 || count <= 0) {
		return [];
	}

	const selected = [];
	for (let index = 0; index < Math.min(count, users.length); index += 1) {
		selected.push(users[(offset + index) % users.length]);
	}

	return selected;
}

function buildEventAttendees(event, index, seedContext, ownerEmail) {
	const { userIdByEmail, regularUsers } = seedContext;

	if (Array.isArray(event.attendeeEmails) && event.attendeeEmails.length > 0) {
		return uniqueObjectIds(
			event.attendeeEmails
				.filter((email) => email !== ownerEmail)
				.map((email) => userIdByEmail.get(email))
		);
	}

	const eligibleUsers = regularUsers.filter((user) => user.email !== ownerEmail);
	const requestedCount = Math.min(Math.max(6, 6 + (index % 6)), eligibleUsers.length, Math.max(1, event.capacity - 1));

	return uniqueObjectIds(
		selectRotatingUsers(eligibleUsers, requestedCount, index).map((user) => user._id)
	);
}

async function seedEvents(eventsData, seedContext) {
	await Event.deleteMany({});

	if (!eventsData.length) {
		return [];
	}

	const preparedEvents = eventsData.map((event, index) => {
		const ownerEmail = event.ownerEmail || event.userEmail;
		const userId = event.userId || (ownerEmail ? seedContext.userIdByEmail.get(ownerEmail) : null);

		if (!userId) {
			throw new Error(
				`Event \"${event.title || "Untitled"}\" is missing a valid owner. Add ownerEmail that matches users.json.`
			);
		}

		return {
			userId,
			attendees: buildEventAttendees(event, index, seedContext, ownerEmail),
			bannerImage: event.bannerImage,
			title: event.title,
			eventDate: event.eventDate,
			eventTime: event.eventTime,
			location: event.location,
			cost: event.cost,
			capacity: event.capacity,
			description: event.description,
			tags: Array.isArray(event.tags) ? event.tags : [],
		};
	});

	return Event.insertMany(preparedEvents);
}

async function seedGroups(groupData, seedContext) {
	await Group.deleteMany({});

	if (!groupData.length) {
		return [];
	}

	const preparedGroup = groupData.map((group) => {
		const ownerEmail = group.ownerEmail || group.userEmail;
		const userId = group.userId || (ownerEmail ? seedContext.userIdByEmail.get(ownerEmail) : null);

		if (!userId) {
			throw new Error(
				`Group \"${group.title || "Untitled"}\" is missing a valid owner. Add ownerEmail that matches users.json.`
			);
		}

		const memberIds = Array.isArray(group.memberEmails)
			? group.memberEmails
				.map((member) => seedContext.userIdByEmail.get(member))
				.filter(Boolean)
			: [];
		const members = uniqueObjectIds([userId, ...memberIds]);

		return {
			userId,
			bannerImage: group.bannerImage,
			name: group.name,
			location: group.location,
			description: group.description,
			tags: Array.isArray(group.tags) ? group.tags : [],
			members,
		};
	});

	return Group.insertMany(preparedGroup);
}

async function seedComments(events, groups, seedContext) {
	await Comment.deleteMany({});

	const commentDocs = [];
	const fallbackUsers = seedContext.regularUsers;

	events.forEach((event, eventIndex) => {
		const participants = uniqueObjectIds([event.userId, ...(event.attendees || [])])
			.map((userId) => seedContext.usersById.get(userId.toString()))
			.filter(Boolean);
		const commenters = selectRotatingUsers(
			participants.length > 0 ? participants : fallbackUsers,
			EVENT_COMMENT_TEMPLATES.length,
			eventIndex
		);

		commenters.forEach((user, commentIndex) => {
			commentDocs.push({
				parentType: "event",
				parentId: event._id,
				userId: user._id,
				username: user.name,
				content: EVENT_COMMENT_TEMPLATES[commentIndex % EVENT_COMMENT_TEMPLATES.length](event.title),
			});
		});
	});

	groups.forEach((group, groupIndex) => {
		const members = uniqueObjectIds(group.members || [])
			.map((userId) => seedContext.usersById.get(userId.toString()))
			.filter(Boolean);
		const commenters = selectRotatingUsers(
			members.length > 0 ? members : fallbackUsers,
			GROUP_COMMENT_TEMPLATES.length,
			groupIndex
		);

		commenters.forEach((user, commentIndex) => {
			commentDocs.push({
				parentType: "group",
				parentId: group._id,
				userId: user._id,
				username: user.name,
				content: GROUP_COMMENT_TEMPLATES[commentIndex % GROUP_COMMENT_TEMPLATES.length](group.name),
			});
		});
	});

	if (commentDocs.length > 0) {
		await Comment.insertMany(commentDocs);
	}

	return commentDocs.length;
}

async function seed() {
	await connectDB();

	const usersData = await readJson("./users.json");
	const eventsData = await readJson("./events.json");
	const groupsData = await readJson("./groups.json");

	const seedContext = await seedUsers(usersData);
	const insertedEvents = await seedEvents(eventsData, seedContext);
	const insertedGroups = await seedGroups(groupsData, seedContext);
	const commentCount = await seedComments(insertedEvents, insertedGroups, seedContext);

	console.log(`Seed complete: ${usersData.length} users, ${eventsData.length} events, ${groupsData.length} groups, and ${commentCount} comments inserted.`);
}

seed()
	.catch((error) => {
		console.error("Seed failed:", error.message);
		process.exitCode = 1;
	})
	.finally(async () => {
		await mongoose.disconnect();
	});
