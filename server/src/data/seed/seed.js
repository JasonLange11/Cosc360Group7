import "dotenv/config";
import { readFile } from "node:fs/promises";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "../db/connection.js";
import { User } from "../../modules/users/users.model.js";
import { Event } from "../../modules/events/events.model.js";
import { Group } from "../../modules/groups/groups.model.js"

const SALT_ROUNDS = 10;

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
	insertedUsers.forEach((user) => {
		userIdByEmail.set(user.email, user._id);
	});

	return userIdByEmail;
}

async function seedEvents(eventsData, userIdByEmail) {
	await Event.deleteMany({});

	if (!eventsData.length) {
		return;
	}

	const preparedEvents = eventsData.map((event) => {
		const ownerEmail = event.ownerEmail || event.userEmail;
		const userId = event.userId || (ownerEmail ? userIdByEmail.get(ownerEmail) : null);

		if (!userId) {
			throw new Error(
				`Event \"${event.title || "Untitled"}\" is missing a valid owner. Add ownerEmail that matches users.json.`
			);
		}

		return {
			userId,
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

	await Event.insertMany(preparedEvents);
}

async function seedGroups(groupData, userIdByEmail) {
	await Group.deleteMany({});

	if (!groupData.length) {
		return;
	}

	const preparedGroup = groupData.map((group) => {
		const ownerEmail = group.ownerEmail || group.userEmail;
		const userId = group.userId || (ownerEmail ? userIdByEmail.get(ownerEmail) : null);

		if (!userId) {
			throw new Error(
				`Group \"${group.title || "Untitled"}\" is missing a valid owner. Add ownerEmail that matches users.json.`
			);
		}

		const members = (group.memberEmails.map((member) => userIdByEmail.get(member)))

		return {
			userId,
			bannerImage: group.bannerImage,
			name: group.name,
			location: group.location,
			description: group.description,
			tags: Array.isArray(group.tags) ? group.tags : [],
			members: Array.isArray(members) ? members : [],
		};
	});

	await Group.insertMany(preparedGroup);
}

async function seed() {
	await connectDB();

	const usersData = await readJson("./users.json");
	const eventsData = await readJson("./events.json");
	const groupsData = await readJson("./groups.json");

	const userIdByEmail = await seedUsers(usersData);
	await seedEvents(eventsData, userIdByEmail);
	await seedGroups(groupsData, userIdByEmail);

	console.log(`Seed complete: ${usersData.length} users, ${eventsData.length} events, and ${groupsData.length} groups inserted.`);
}

seed()
	.catch((error) => {
		console.error("Seed failed:", error.message);
		process.exitCode = 1;
	})
	.finally(async () => {
		await mongoose.disconnect();
	});
